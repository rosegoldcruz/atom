/**
 * Configuration Service
 * Loads, validates, and provides typed access to environment variables
 */

import dotenv from 'dotenv';
import { logger } from './logger';

// Load environment variables
dotenv.config();

export interface AtomConfig {
  // Network
  network: 'polygon_mainnet' | 'sepolia_testnet';
  chainId: number;
  rpcUrls: string[];
  
  // Wallet
  privateKey: string;
  walletAddress: string;
  treasuryAddress: string;
  
  // Contracts
  atomContractAddress: string;
  flashloanArbAddress: string;
  
  // AAVE
  aavePoolAddressesProvider: string;
  aavePoolAddress: string;
  aaveFlashLoanFeeBps: number;
  
  // DEX Routers
  uniswapV3Router: string;
  sushiswapRouter: string;
  quickswapRouter: string;
  balancerVault: string;
  
  // Tokens
  tokens: {
    WETH: string;
    USDC: string;
    USDT: string;
    DAI: string;
    WMATIC: string;
  };
  
  // Bot Engine
  scanInterval: number;
  opportunityScanInterval: number;
  executionTimeout: number;
  retryAttempts: number;
  maxConcurrentTrades: number;
  
  // Trading Parameters
  minTradeSizeUsd: number;
  minProfitThresholdBps: number;
  minTradeProfitUsd: number;
  targetNetProfitPerTrade: number;
  maxTradeSizeUsd: number;
  maxSlippageBps: number;
  
  // Gas
  maxGasCostUsd: number;
  maxGasPrice: number;
  gasPriceMultiplier: number;
  maxGasLimit: number;
  priorityFeeGwei: number;
  
  // Risk Management
  maxDailyLossUsd: number;
  maxSingleTradeLossUsd: number;
  emergencyStopLossUsd: number;
  circuitBreakerEnabled: boolean;
  
  // Targets
  dailyProfitTargetUsd: number;
  weeklyProfitTargetUsd: number;
  monthlyProfitTargetUsd: number;
  
  // Redis
  redisUrl: string;
  redisHost: string;
  redisPort: number;
  streamNamespace: string;
  
  // MEV Protection
  useFlashbotsProtect: boolean;
  flashbotsProtectRpc: string;
  privateMempoolEnabled: boolean;
  
  // Alerts
  enableDiscordAlerts: boolean;
  enableTelegramAlerts: boolean;
  telegramBotToken?: string;
  telegramChatId?: string;
  
  // Flags
  productionMode: boolean;
  enableTrading: boolean;
  dryRun: boolean;
  allowMainnet: boolean;
}

class ConfigService {
  private config: AtomConfig;

  constructor() {
    this.config = this.loadConfig();
    this.validateConfig();
  }

  private loadConfig(): AtomConfig {
    return {
      // Network
      network: (process.env.NETWORK as any) || 'polygon_mainnet',
      chainId: parseInt(process.env.CHAIN_ID || '137'),
      rpcUrls: [
        process.env.POLYGON_RPC_URL || '',
        process.env.POLYGON_RPC_BACKUP || '',
        process.env.POLYGON_RPC_BACKUP2 || ''
      ].filter(Boolean),
      
      // Wallet
      privateKey: process.env.PRIVATE_KEY || '',
      walletAddress: process.env.WALLET_ADDRESS || '',
      treasuryAddress: process.env.TREASURY_ADDRESS || '',
      
      // Contracts
      atomContractAddress: process.env.ATOM_CONTRACT_ADDRESS || '',
      flashloanArbAddress: process.env.FLASHLOAN_ARB_ADDR || '',
      
      // AAVE
      aavePoolAddressesProvider: process.env.AAVE_POOL_ADDRESSES_PROVIDER || '',
      aavePoolAddress: process.env.AAVE_POOL_ADDRESS || '',
      aaveFlashLoanFeeBps: parseInt(process.env.AAVE_FLASH_LOAN_FEE_BPS || '9'),
      
      // DEX Routers
      uniswapV3Router: process.env.UNISWAP_V3_ROUTER || '',
      sushiswapRouter: process.env.SUSHISWAP_ROUTER || '',
      quickswapRouter: process.env.QUICKSWAP_ROUTER || '',
      balancerVault: process.env.BALANCER_VAULT || '',
      
      // Tokens
      tokens: {
        WETH: process.env.WETH_ADDRESS || '',
        USDC: process.env.USDC_ADDRESS || '',
        USDT: process.env.USDT_ADDRESS || '',
        DAI: process.env.DAI_ADDRESS || '',
        WMATIC: process.env.WMATIC_ADDRESS || ''
      },
      
      // Bot Engine
      scanInterval: parseInt(process.env.ATOM_SCAN_INTERVAL || '1000'),
      opportunityScanInterval: parseInt(process.env.OPPORTUNITY_SCAN_INTERVAL_MS || '500'),
      executionTimeout: parseInt(process.env.ATOM_EXECUTION_TIMEOUT || '8000'),
      retryAttempts: parseInt(process.env.ATOM_RETRY_ATTEMPTS || '1'),
      maxConcurrentTrades: parseInt(process.env.ATOM_MAX_CONCURRENT_TRADES || '1'),
      
      // Trading Parameters
      minTradeSizeUsd: parseFloat(process.env.MIN_TRADE_SIZE_USD || '25000'),
      minProfitThresholdBps: parseInt(process.env.MIN_PROFIT_THRESHOLD_BPS || '35'),
      minTradeProfitUsd: parseFloat(process.env.MIN_TRADE_PROFIT_USD || '87.50'),
      targetNetProfitPerTrade: parseFloat(process.env.TARGET_NET_PROFIT_PER_TRADE || '100'),
      maxTradeSizeUsd: parseFloat(process.env.MAX_TRADE_SIZE_USD || '100000'),
      maxSlippageBps: parseInt(process.env.MAX_SLIPPAGE_BPS || '300'),
      
      // Gas
      maxGasCostUsd: parseFloat(process.env.MAX_GAS_COST_USD || '10'),
      maxGasPrice: parseInt(process.env.ATOM_MAX_GAS_PRICE || '200'),
      gasPriceMultiplier: parseFloat(process.env.GAS_PRICE_MULTIPLIER || '1.2'),
      maxGasLimit: parseInt(process.env.MAX_GAS_LIMIT || '600000'),
      priorityFeeGwei: parseInt(process.env.PRIORITY_FEE_GWEI || '5'),
      
      // Risk Management
      maxDailyLossUsd: parseFloat(process.env.MAX_DAILY_LOSS_USD || '1000'),
      maxSingleTradeLossUsd: parseFloat(process.env.MAX_SINGLE_TRADE_LOSS_USD || '250'),
      emergencyStopLossUsd: parseFloat(process.env.EMERGENCY_STOP_LOSS_USD || '2500'),
      circuitBreakerEnabled: process.env.CIRCUIT_BREAKER_ENABLED === 'true',
      
      // Targets
      dailyProfitTargetUsd: parseFloat(process.env.DAILY_PROFIT_TARGET_USD || '500'),
      weeklyProfitTargetUsd: parseFloat(process.env.WEEKLY_PROFIT_TARGET_USD || '3500'),
      monthlyProfitTargetUsd: parseFloat(process.env.MONTHLY_PROFIT_TARGET_USD || '15000'),
      
      // Redis
      redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379/0',
      redisHost: process.env.REDIS_HOST || '127.0.0.1',
      redisPort: parseInt(process.env.REDIS_PORT || '6379'),
      streamNamespace: process.env.STREAM_NAMESPACE || 'atom',
      
      // MEV Protection
      useFlashbotsProtect: process.env.USE_FLASHBOTS_PROTECT === 'true',
      flashbotsProtectRpc: process.env.FLASHBOTS_PROTECT_RPC || '',
      privateMempoolEnabled: process.env.PRIVATE_MEMPOOL_ENABLED === 'true',
      
      // Alerts
      enableDiscordAlerts: process.env.ENABLE_DISCORD_ALERTS === 'true',
      enableTelegramAlerts: process.env.ENABLE_TELEGRAM_ALERTS === 'true',
      telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
      telegramChatId: process.env.TELEGRAM_CHAT_ID,
      
      // Flags
      productionMode: process.env.PRODUCTION_MODE === 'true',
      enableTrading: process.env.ENABLE_TRADING === 'true',
      dryRun: process.env.DRY_RUN === 'true',
      allowMainnet: process.env.ALLOW_MAINNET === 'true'
    };
  }

  private validateConfig(): void {
    const errors: string[] = [];

    // Critical validations
    if (!this.config.privateKey && this.config.enableTrading) {
      errors.push('PRIVATE_KEY is required when trading is enabled');
    }

    if (this.config.rpcUrls.length === 0) {
      errors.push('At least one RPC URL must be configured');
    }

    if (this.config.productionMode && this.config.network !== 'polygon_mainnet') {
      errors.push('Production mode requires polygon_mainnet network');
    }

    if (this.config.enableTrading && !this.config.allowMainnet && this.config.network === 'polygon_mainnet') {
      errors.push('Mainnet trading requires ALLOW_MAINNET=true');
    }

    if (this.config.minProfitThresholdBps < 1) {
      errors.push('MIN_PROFIT_THRESHOLD_BPS must be at least 1');
    }

    if (this.config.maxGasPrice > 500) {
      logger.warn('MAX_GAS_PRICE is very high (>500 gwei). Proceed with caution.');
    }

    if (errors.length > 0) {
      logger.error('Configuration validation failed:');
      errors.forEach(error => logger.error(`  - ${error}`));
      throw new Error('Invalid configuration');
    }

    logger.info('✅ Configuration validated successfully');
    logger.info(`📍 Network: ${this.config.network} (Chain ID: ${this.config.chainId})`);
    logger.info(`💰 Min Profit: ${this.config.minProfitThresholdBps} bps ($${this.config.minTradeProfitUsd})`);
    logger.info(`⛽ Max Gas: ${this.config.maxGasPrice} gwei ($${this.config.maxGasCostUsd})`);
    logger.info(`🎯 Daily Target: $${this.config.dailyProfitTargetUsd}`);
    logger.info(`🚀 Trading Enabled: ${this.config.enableTrading ? 'YES' : 'NO'}`);
    logger.info(`🧪 Dry Run: ${this.config.dryRun ? 'YES' : 'NO'}`);
  }

  getConfig(): AtomConfig {
    return this.config;
  }

  // Helper methods for common config access
  isProductionMode(): boolean {
    return this.config.productionMode;
  }

  isTradingEnabled(): boolean {
    return this.config.enableTrading && !this.config.dryRun;
  }

  isDryRun(): boolean {
    return this.config.dryRun;
  }

  getRpcUrl(): string {
    return this.config.rpcUrls[0];
  }

  getBackupRpcUrls(): string[] {
    return this.config.rpcUrls.slice(1);
  }
}

// Singleton instance
export const configService = new ConfigService();
export const config = configService.getConfig();
