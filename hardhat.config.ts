import "dotenv/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import { HardhatUserConfig } from "hardhat/config";

function env(...names: string[]): string {
  for (const n of names) {
    const v = process.env[n];
    if (v && v.trim() !== "") return v.trim();
  }
  return "";
}

const PRIVATE_KEY = env("DEPLOYER_PRIVATE_KEY", "PRIVATE_KEY");
const SEPOLIA_RPC_URL = env("SEPOLIA_RPC_URL");
const POLYGON_RPC_URL = env("POLYGON_RPC_URL");
const ETHERSCAN_API_KEY = env("ETHERSCAN_API_KEY");
const POLYGONSCAN_API_KEY = env("POLYGONSCAN_API_KEY", "ETHERSCAN_API_KEY");

if (!PRIVATE_KEY) throw new Error("Missing DEPLOYER_PRIVATE_KEY/PRIVATE_KEY");
if (!SEPOLIA_RPC_URL) throw new Error("Missing SEPOLIA_RPC_URL");
if (!POLYGON_RPC_URL) throw new Error("Missing POLYGON_RPC_URL");

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.22",
    settings: { 
      optimizer: { enabled: true, runs: 500_000 },
      viaIR: true
    }
  },
  networks: {
    sepolia: { url: SEPOLIA_RPC_URL, accounts: ["0x" + PRIVATE_KEY], chainId: 11155111 },
    polygon: { url: POLYGON_RPC_URL, accounts: ["0x" + PRIVATE_KEY], chainId: 137 },
  },
  etherscan: {
    apiKey: { sepolia: ETHERSCAN_API_KEY, polygon: POLYGONSCAN_API_KEY || ETHERSCAN_API_KEY },
  },
};
export default config;
