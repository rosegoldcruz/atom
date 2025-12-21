/**
 * Market Data Service
 * Purpose: Fetch DEX prices, normalize pool state, detect arbitrage opportunities
 * Emits: opportunity.detected
 * Failure Behavior: Opportunities stop, no unsafe execution
 */

import { ethers } from 'ethers';
import { EventBusService } from './event-bus';
import { logger } from '../utils/logger';
import { v7 as uuidv7 } from 'uuid';

export interface PoolState {
  address: string;
  token0: string;
  token1: string;
  reserve0: ethers.BigNumber;
  reserve1: ethers.BigNumber;
  fee: number;
  blockNumber: number;
}

export interface ArbitragePath {
  chain: string;
  dexPath: string[];
  assetIn: string;
  assetOut: string;
  spreadBps: number;
  liquidityEstimate: number;
  confidenceScore: number;
}

export class MarketDataService {
  private providers: Map<string, ethers.Provider> = new Map();
  private eventBus: EventBusService;
  private isRunning = false;
  private scanInterval: NodeJS.Timeout | null = null;
  private readonly SCAN_INTERVAL_MS = 2000; // 2 seconds
  private readonly MIN_SPREAD_BPS = 10; // Minimum 10 bps spread
  private readonly MIN_CONFIDENCE = 0.7; // Minimum 70% confidence

  constructor(eventBus: EventBusService) {
    this.eventBus = eventBus;
    this.setupProviders();
  }

  private setupProviders(): void {
    // Ethereum
    if (process.env.ETHEREUM_RPC_URL) {
      this.providers.set('ethereum', new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL));
    }
    
    // Arbitrum
    if (process.env.ARBITRUM_RPC_URL) {
      this.providers.set('arbitrum', new ethers.JsonRpcProvider(process.env.ARBITRUM_RPC_URL));
    }
    
    // Base
    if (process.env.BASE_RPC_URL) {
      this.providers.set('base', new ethers.JsonRpcProvider(process.env.BASE_RPC_URL));
    }
    
    // Polygon
    if (process.env.POLYGON_RPC_URL) {
      this.providers.set('polygon', new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL));
    }
  }

  async start(): Promise<void> {
    if (this.isRunning) return;
    
    this.isRunning = true;
    logger.info('Market Data Service started');
    
    // Start scanning for opportunities
    this.scanInterval = setInterval(() => {
      this.scanForOpportunities().catch(error => {
        logger.error('Scan failed:', error);
      });
    }, this.SCAN_INTERVAL_MS);
  }

  async stop(): Promise<void> {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
    
    logger.info('Market Data Service stopped');
  }

  private async scanForOpportunities(): Promise<void> {
    for (const [chain, provider] of this.providers) {
      try {
        await this.scanChain(chain, provider);
      } catch (error) {
        logger.error(`Failed to scan ${chain}:`, error);
      }
    }
  }

  private async scanChain(chain: string, provider: ethers.Provider): Promise<void> {
    // This is a simplified implementation
    // In production, this would integrate with various DEX protocols
    
    const opportunities = await this.detectArbitrageOpportunities(chain, provider);
    
    for (const opportunity of opportunities) {
      await this.emitOpportunity(opportunity);
    }
  }

  private async detectArbitrageOpportunities(chain: string, provider: ethers.Provider): Promise<ArbitragePath[]> {
    const opportunities: ArbitragePath[] = [];
    
    try {
      // Get current block number
      const blockNumber = await provider.getBlockNumber();
      
      // Mock data for demonstration - in production this would query actual DEX pools
      const mockOpportunities = this.generateMockOpportunities(chain, blockNumber);
      
      // Filter opportunities based on minimum criteria
      for (const opp of mockOpportunities) {
        if (opp.spreadBps >= this.MIN_SPREAD_BPS && opp.confidenceScore >= this.MIN_CONFIDENCE) {
          opportunities.push(opp);
        }
      }
      
    } catch (error) {
      logger.error(`Error detecting opportunities on ${chain}:`, error);
    }
    
    return opportunities;
  }

  private generateMockOpportunities(chain: string, blockNumber: number): ArbitragePath[] {
    // This generates mock opportunities for demonstration
    // In production, this would query actual DEX pools and compare prices
    
    const opportunities: ArbitragePath[] = [];
    const assets = ['USDC', 'USDT', 'DAI', 'WETH', 'WBTC'];
    const dexes = ['UNISWAP_V3', 'AAVE', 'BALANCER', 'CURVE'];
    
    // Generate some random opportunities
    for (let i = 0; i < 3; i++) {
      const assetIn = assets[Math.floor(Math.random() * assets.length)];
      const assetOut = assets[Math.floor(Math.random() * assets.length)];
      
      if (assetIn !== assetOut) {
        const spreadBps = 15 + Math.random() * 50; // 15-65 bps spread
        const confidenceScore = 0.7 + Math.random() * 0.3; // 70-100% confidence
        
        opportunities.push({
          chain,
          dexPath: [
            dexes[Math.floor(Math.random() * dexes.length)],
            dexes[Math.floor(Math.random() * dexes.length)]
          ],
          assetIn,
          assetOut,
          spreadBps,
          liquidityEstimate: 100000 + Math.random() * 1000000, // 100K to 1.1M
          confidenceScore
        });
      }
    }
    
    return opportunities;
  }

  private async emitOpportunity(opportunity: ArbitragePath): Promise<void> {
    const opportunityId = uuidv7();
    
    await this.eventBus.appendEvent({
      event_type: 'opportunity.detected',
      source: 'agent',
      severity: 'info',
      payload: {
        opportunity_id: opportunityId,
        chain: opportunity.chain,
        dex_path: opportunity.dexPath,
        asset_in: opportunity.assetIn,
        asset_out: opportunity.assetOut,
        spread_bps: opportunity.spreadBps,
        liquidity_estimate: opportunity.liquidityEstimate,
        confidence_score: opportunity.confidenceScore
      }
    });
    
    logger.debug(`Opportunity detected: ${opportunity.assetIn}/${opportunity.assetOut} ${opportunity.spreadBps.toFixed(1)} bps on ${opportunity.chain}`);
  }

  /**
   * Get pool state from a specific DEX
   */
  async getPoolState(dex: string, poolAddress: string, provider: ethers.Provider): Promise<PoolState | null> {
    try {
      // This would be implemented for each DEX protocol
      // For now, return mock data
      return {
        address: poolAddress,
        token0: '0xA0b86a33E6441b8A853C68d2e71F6fF8DAd62B2c', // Mock USDC
        token1: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // Mock WETH
        reserve0: ethers.parseUnits('1000000', 6), // 1M USDC
        reserve1: ethers.parseUnits('500', 18), // 500 WETH
        fee: 3000, // 0.3%
        blockNumber: await provider.getBlockNumber()
      };
    } catch (error) {
      logger.error('Failed to get pool state:', error);
      return null;
    }
  }

  /**
   * Calculate arbitrage opportunity between two pools
   */
  calculateArbitrage(
    pool1: PoolState,
    pool2: PoolState,
    amountIn: ethers.BigNumber
  ): { profit: number; gasEstimate: number } | null {
    try {
      // Simplified arbitrage calculation
      // In production, this would use proper DEX math
      
      const price1 = Number(pool1.reserve1) / Number(pool1.reserve0);
      const price2 = Number(pool2.reserve1) / Number(pool2.reserve0);
      
      const spread = Math.abs(price1 - price2) / Math.min(price1, price2);
      const spreadBps = spread * 10000;
      
      if (spreadBps < this.MIN_SPREAD_BPS) {
        return null;
      }
      
      // Mock profit calculation
      const profit = Number(ethers.formatUnits(amountIn, 6)) * spread * 0.8; // 80% of theoretical profit
      const gasEstimate = 150000; // Typical arbitrage gas usage
      
      return { profit, gasEstimate };
      
    } catch (error) {
      logger.error('Arbitrage calculation failed:', error);
      return null;
    }
  }

  getStatus(): { isRunning: boolean; chains: number } {
    return {
      isRunning: this.isRunning,
      chains: this.providers.size
    };
  }
}