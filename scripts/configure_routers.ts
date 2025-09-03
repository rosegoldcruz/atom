import { ethers } from "hardhat";
import { MEVGuardFlashLoanArbitrageV2 } from "../typechain-types";

interface RouterConfig {
  name: string;
  address: string;
  type: number;
  allowed: boolean;
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const contractAddress = process.env.CONTRACT_ADDRESS;

  if (!contractAddress) {
    throw new Error("CONTRACT_ADDRESS environment variable required");
  }

  console.log("Configuring routers for contract:", contractAddress);
  console.log("Deployer:", deployer.address);

  const contract = await ethers.getContractAt("MEVGuardFlashLoanArbitrageV2", contractAddress) as MEVGuardFlashLoanArbitrageV2;
  
  // Network-specific router configurations
  const network = await ethers.provider.getNetwork();
  let routers: RouterConfig[] = [];

  if (network.chainId === 11155111n) { // Sepolia
    routers = [
      { name: "UniswapV2Router", address: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", type: 1, allowed: true },
      { name: "SushiSwapRouter", address: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506", type: 1, allowed: true },
    ];
  } else if (network.chainId === 137n) { // Polygon
    routers = [
      { name: "QuickSwapRouter", address: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff", type: 1, allowed: true },
      { name: "SushiSwapRouter", address: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506", type: 1, allowed: true },
      { name: "UniswapV3Router", address: "0xE592427A0AEce92De3Edee1F18E0157C05861564", type: 2, allowed: true },
      { name: "BalancerVault", address: "0xBA12222222228d8Ba445958a75a0704d566BF2C8", type: 3, allowed: true },
    ];
  }

  if (routers.length === 0) {
    console.log("No routers configured for this network");
    return;
  }

  // Check if we need to use timelock
  const EXECUTOR_ROLE = await contract.EXECUTOR_ROLE();
  const hasExecutorRole = await contract.hasRole(EXECUTOR_ROLE, deployer.address);

  if (!hasExecutorRole) {
    console.log("Deployer does not have EXECUTOR_ROLE - router configuration requires timelock");
    
    // Create timelock proposal
    const names = routers.map(r => r.name);
    const addresses = routers.map(r => r.address);
    const types = routers.map(r => r.type);
    const allowed = routers.map(r => r.allowed);

    const calldata = contract.interface.encodeFunctionData("batchConfigureRouters", [names, addresses, types, allowed]);
    
    const PROPOSER_ROLE = await contract.PROPOSER_ROLE();
    const hasProposerRole = await contract.hasRole(PROPOSER_ROLE, deployer.address);
    
    if (!hasProposerRole) {
      throw new Error("Deployer does not have PROPOSER_ROLE");
    }

    console.log("Creating timelock proposal for router configuration...");
    const tx = await contract.propose(
      contractAddress,
      calldata,
      `Configure ${routers.length} routers: ${names.join(", ")}`
    );
    const receipt = await tx.wait();
    
    console.log("Proposal created successfully!");
    console.log("Transaction hash:", tx.hash);
    console.log("Proposal will be executable after timelock delay");
    
    return;
  }

  // Direct configuration (if we have EXECUTOR_ROLE)
  console.log("Configuring routers directly...");
  
  for (const router of routers) {
    console.log(`Configuring ${router.name} (${router.address}) - allowed: ${router.allowed}`);
    
    const tx = await contract.configureRouter(router.name, router.address, router.type, router.allowed);
    await tx.wait();
    
    console.log(`✓ ${router.name} configured`);
  }

  console.log("All routers configured successfully!");

  // Verify configurations
  console.log("\nVerifying configurations:");
  for (const router of routers) {
    const isAllowed = await contract.allowedRouter(router.address);
    console.log(`${router.name}: ${isAllowed ? "✓ ALLOWED" : "✗ NOT ALLOWED"}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });