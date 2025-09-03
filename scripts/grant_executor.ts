import { ethers } from "hardhat";
import { MEVGuardFlashLoanArbitrageV2 } from "../typechain-types";

async function main() {
  const [deployer] = await ethers.getSigners();
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const executorAddress = process.env.EXECUTOR_ADDRESS;

  if (!contractAddress) {
    throw new Error("CONTRACT_ADDRESS environment variable required");
  }
  if (!executorAddress) {
    throw new Error("EXECUTOR_ADDRESS environment variable required");
  }

  console.log("Granting EXECUTOR_ROLE to:", executorAddress);
  console.log("Contract:", contractAddress);
  console.log("Deployer:", deployer.address);

  const contract = await ethers.getContractAt("MEVGuardFlashLoanArbitrageV2", contractAddress) as MEVGuardFlashLoanArbitrageV2;
  
  const EXECUTOR_ROLE = await contract.EXECUTOR_ROLE();
  
  // Check if already has role
  const hasRole = await contract.hasRole(EXECUTOR_ROLE, executorAddress);
  if (hasRole) {
    console.log("Address already has EXECUTOR_ROLE");
    return;
  }

  // Check if deployer has admin role
  const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
  const isAdmin = await contract.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
  if (!isAdmin) {
    throw new Error("Deployer does not have DEFAULT_ADMIN_ROLE");
  }

  // Grant role
  console.log("Granting EXECUTOR_ROLE...");
  const tx = await contract.grantRole(EXECUTOR_ROLE, executorAddress);
  await tx.wait();

  console.log("EXECUTOR_ROLE granted successfully!");
  console.log("Transaction hash:", tx.hash);

  // Verify
  const hasRoleAfter = await contract.hasRole(EXECUTOR_ROLE, executorAddress);
  console.log("Verification - has role:", hasRoleAfter);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });