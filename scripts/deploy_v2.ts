import { ethers, upgrades } from "hardhat";
import { MEVGuardFlashLoanArbitrageV2 } from "../typechain-types";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Network-specific addresses
  const network = await ethers.provider.getNetwork();
  let poolAddressesProvider: string;
  let guardian: string;
  
  if (network.chainId === 11155111n) { // Sepolia
    poolAddressesProvider = "0x012bAC54348C0E635dCAc9D5FB99f06F24136C9A";
    guardian = process.env.GUARDIAN_ADDRESS || deployer.address;
  } else if (network.chainId === 137n) { // Polygon
    poolAddressesProvider = "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb";
    guardian = process.env.GUARDIAN_ADDRESS || deployer.address;
  } else {
    throw new Error(`Unsupported network: ${network.chainId}`);
  }

  const treasury = process.env.TREASURY_ADDRESS || deployer.address;
  const maxGasPrice = ethers.parseUnits("100", "gwei"); // 100 gwei
  const timelockDelay = 24 * 60 * 60; // 24 hours

  console.log("Deployment parameters:");
  console.log("- Pool Addresses Provider:", poolAddressesProvider);
  console.log("- Treasury:", treasury);
  console.log("- Guardian:", guardian);
  console.log("- Max Gas Price:", ethers.formatUnits(maxGasPrice, "gwei"), "gwei");
  console.log("- Timelock Delay:", timelockDelay / 3600, "hours");

  // Deploy the implementation
  const MEVGuardFlashLoanArbitrageV2 = await ethers.getContractFactory("MEVGuardFlashLoanArbitrageV2");
  
  console.log("Deploying MEVGuardFlashLoanArbitrageV2...");
  const proxy = await upgrades.deployProxy(
    MEVGuardFlashLoanArbitrageV2,
    [poolAddressesProvider, treasury, maxGasPrice, guardian, timelockDelay],
    { 
      kind: "uups",
      initializer: "initialize"
    }
  ) as MEVGuardFlashLoanArbitrageV2;

  await proxy.waitForDeployment();
  const proxyAddress = await proxy.getAddress();
  
  console.log("MEVGuardFlashLoanArbitrageV2 deployed to:", proxyAddress);
  
  // Get implementation address
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  console.log("Implementation address:", implementationAddress);

  // Verify roles
  const DEFAULT_ADMIN_ROLE = await proxy.DEFAULT_ADMIN_ROLE();
  const EXECUTOR_ROLE = await proxy.EXECUTOR_ROLE();
  const GUARDIAN_ROLE = await proxy.GUARDIAN_ROLE();
  const PROPOSER_ROLE = await proxy.PROPOSER_ROLE();

  console.log("\nRole assignments:");
  console.log("- DEFAULT_ADMIN_ROLE:", await proxy.hasRole(DEFAULT_ADMIN_ROLE, deployer.address));
  console.log("- EXECUTOR_ROLE:", await proxy.hasRole(EXECUTOR_ROLE, deployer.address));
  console.log("- GUARDIAN_ROLE:", await proxy.hasRole(GUARDIAN_ROLE, guardian));
  console.log("- PROPOSER_ROLE:", await proxy.hasRole(PROPOSER_ROLE, deployer.address));

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    proxy: proxyAddress,
    implementation: implementationAddress,
    deployer: deployer.address,
    treasury,
    guardian,
    maxGasPrice: maxGasPrice.toString(),
    timelockDelay,
    deployedAt: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber()
  };

  console.log("\nDeployment completed successfully!");
  console.log("Deployment info:", JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });