import { ethers } from "hardhat";
import { MEVGuardFlashLoanArbitrageV2 } from "../typechain-types";

interface StrategyConfig {
  asset: string;
  symbol: string;
  minProfit: string; // in asset units
  maxAmount: string; // in asset units
  oracleConfig?: {
    feed: string;
    deviationBps: number;
    stalePeriod: number;
  };
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const contractAddress = process.env.CONTRACT_ADDRESS;

  if (!contractAddress) {
    throw new Error("CONTRACT_ADDRESS environment variable required");
  }

  console.log("Updating strategy for contract:", contractAddress);
  console.log("Deployer:", deployer.address);

  const contract = await ethers.getContractAt("MEVGuardFlashLoanArbitrageV2", contractAddress) as MEVGuardFlashLoanArbitrageV2;
  
  // Network-specific asset configurations
  const network = await ethers.provider.getNetwork();
  let strategies: StrategyConfig[] = [];

  if (network.chainId === 11155111n) { // Sepolia
    strategies = [
      {
        asset: "0x779877A7B0D9E8603169DdbD7836e478b4624789", // LINK
        symbol: "LINK",
        minProfit: ethers.parseUnits("0.1", 18).toString(), // 0.1 LINK
        maxAmount: ethers.parseUnits("1000", 18).toString(), // 1000 LINK
        oracleConfig: {
          feed: "0xc59E3633BAAC79493d908e63626716e204A45EdF", // LINK/USD on Sepolia
          deviationBps: 500, // 5%
          stalePeriod: 3600 // 1 hour
        }
      },
      {
        asset: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", // UNI
        symbol: "UNI",
        minProfit: ethers.parseUnits("0.5", 18).toString(), // 0.5 UNI
        maxAmount: ethers.parseUnits("500", 18).toString(), // 500 UNI
      }
    ];
  } else if (network.chainId === 137n) { // Polygon
    strategies = [
      {
        asset: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // USDC
        symbol: "USDC",
        minProfit: ethers.parseUnits("1", 6).toString(), // $1 USDC
        maxAmount: ethers.parseUnits("100000", 6).toString(), // $100k USDC
        oracleConfig: {
          feed: "0xfE4A8cc5b5B2366C1B58Bea3858e81843581b2F7", // USDC/USD on Polygon
          deviationBps: 200, // 2%
          stalePeriod: 1800 // 30 minutes
        }
      },
      {
        asset: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063", // DAI
        symbol: "DAI",
        minProfit: ethers.parseUnits("1", 18).toString(), // $1 DAI
        maxAmount: ethers.parseUnits("100000", 18).toString(), // $100k DAI
        oracleConfig: {
          feed: "0x4746DeC9e833A82EC7C2C1356372CcF2cfcD2F3D", // DAI/USD on Polygon
          deviationBps: 200, // 2%
          stalePeriod: 1800 // 30 minutes
        }
      },
      {
        asset: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", // WMATIC
        symbol: "WMATIC",
        minProfit: ethers.parseUnits("1", 18).toString(), // 1 MATIC
        maxAmount: ethers.parseUnits("50000", 18).toString(), // 50k MATIC
        oracleConfig: {
          feed: "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0", // MATIC/USD on Polygon
          deviationBps: 1000, // 10%
          stalePeriod: 3600 // 1 hour
        }
      }
    ];
  }

  if (strategies.length === 0) {
    console.log("No strategies configured for this network");
    return;
  }

  // Check if we need to use timelock
  const EXECUTOR_ROLE = await contract.EXECUTOR_ROLE();
  const hasExecutorRole = await contract.hasRole(EXECUTOR_ROLE, deployer.address);

  if (!hasExecutorRole) {
    console.log("Deployer does not have EXECUTOR_ROLE - strategy updates require timelock");
    
    // Create timelock proposals for each strategy update
    const PROPOSER_ROLE = await contract.PROPOSER_ROLE();
    const hasProposerRole = await contract.hasRole(PROPOSER_ROLE, deployer.address);
    
    if (!hasProposerRole) {
      throw new Error("Deployer does not have PROPOSER_ROLE");
    }

    for (const strategy of strategies) {
      console.log(`Creating timelock proposal for ${strategy.symbol}...`);
      
      const calldata = contract.interface.encodeFunctionData("updateStrategy", [
        strategy.asset,
        strategy.minProfit,
        strategy.maxAmount
      ]);
      
      const tx = await contract.propose(
        contractAddress,
        calldata,
        `Update strategy for ${strategy.symbol}: minProfit=${ethers.formatUnits(strategy.minProfit, 18)}, maxAmount=${ethers.formatUnits(strategy.maxAmount, 18)}`
      );
      await tx.wait();
      
      console.log(`✓ Proposal created for ${strategy.symbol}`);
    }
    
    console.log("All proposals created successfully!");
    console.log("Proposals will be executable after timelock delay");
    
    return;
  }

  // Direct configuration (if we have EXECUTOR_ROLE)
  console.log("Updating strategies directly...");
  
  for (const strategy of strategies) {
    console.log(`Updating strategy for ${strategy.symbol}...`);
    
    // Update main strategy
    const tx = await contract.updateStrategy(strategy.asset, strategy.minProfit, strategy.maxAmount);
    await tx.wait();
    
    // Configure oracle if provided
    if (strategy.oracleConfig) {
      console.log(`Configuring oracle for ${strategy.symbol}...`);
      const oracleTx = await contract.configureOracle(
        strategy.asset,
        strategy.oracleConfig.feed,
        strategy.oracleConfig.deviationBps,
        strategy.oracleConfig.stalePeriod
      );
      await oracleTx.wait();
      console.log(`✓ Oracle configured for ${strategy.symbol}`);
    }
    
    console.log(`✓ Strategy updated for ${strategy.symbol}`);
  }

  console.log("All strategies updated successfully!");

  // Verify configurations
  console.log("\nVerifying configurations:");
  for (const strategy of strategies) {
    const [minProfit, maxAmount] = await contract.getConfig(strategy.asset);
    console.log(`${strategy.symbol}:`);
    console.log(`  Min Profit: ${ethers.formatUnits(minProfit, 18)}`);
    console.log(`  Max Amount: ${ethers.formatUnits(maxAmount, 18)}`);
    
    if (strategy.oracleConfig) {
      try {
        const oracleConfig = await contract.getOracleConfig(strategy.asset);
        console.log(`  Oracle: ${oracleConfig.configured ? "✓ CONFIGURED" : "✗ NOT CONFIGURED"}`);
        if (oracleConfig.configured) {
          console.log(`    Feed: ${oracleConfig.feed}`);
          console.log(`    Deviation: ${oracleConfig.deviationBps} bps`);
          console.log(`    Stale Period: ${oracleConfig.stalePeriod}s`);
        }
      } catch (error) {
        console.log(`  Oracle: ✗ ERROR - ${error}`);
      }
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });