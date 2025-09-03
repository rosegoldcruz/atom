import { ethers } from "hardhat";
import { MEVGuardFlashLoanArbitrageV2 } from "../typechain-types";

async function main() {
  const [deployer] = await ethers.getSigners();
  const contractAddress = process.env.CONTRACT_ADDRESS;

  if (!contractAddress) {
    throw new Error("CONTRACT_ADDRESS environment variable required");
  }

  console.log("Unpausing contract:", contractAddress);
  console.log("Deployer:", deployer.address);

  const contract = await ethers.getContractAt("MEVGuardFlashLoanArbitrageV2", contractAddress) as MEVGuardFlashLoanArbitrageV2;
  
  // Check current pause state
  const isPaused = await contract.paused();
  if (!isPaused) {
    console.log("Contract is not paused");
    return;
  }

  // Check if deployer has guardian role
  const GUARDIAN_ROLE = await contract.GUARDIAN_ROLE();
  const hasGuardianRole = await contract.hasRole(GUARDIAN_ROLE, deployer.address);
  
  if (!hasGuardianRole) {
    throw new Error("Deployer does not have GUARDIAN_ROLE - cannot unpause");
  }

  console.log("Unpausing contract...");
  const tx = await contract.unpause();
  await tx.wait();

  console.log("Contract unpaused successfully!");
  console.log("Transaction hash:", tx.hash);

  // Verify pause state
  const isPausedAfter = await contract.paused();
  console.log("Verification - is paused:", isPausedAfter);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });