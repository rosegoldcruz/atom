/**
 * Execution Bot Service
 * Purpose: Submit transactions, handle retries (non-tx), manage execution state
 * Consumes: execution.submitted
 * Emits: bot.state.changed
 * Forbidden: Deciding profitability, holding funds
 */

import { ethers } from 'ethers';
import { EventBusService } from './event-bus';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface ExecutionRequest {
  executionId: string;
  opportunityId: string;
  flashProvider: 'AAVE' | 'UNISWAP' | 'BALANCER';
  loanAmount: number;
  asset: string;
  gasEstimate: number;
  chain: string;
  dexPath: string[];
}

export interface BotState {
  botId: string;
  currentState: 'IDLE' | 'EXECUTING' | 'ERROR';
  healthScore: number;
  lastAction: string;
  lastError?: string;
  executionsToday: number;
  successfulExecutions: number;
  failedExecutions: number;
}

export class ExecutionBotService {
  private eventBus: EventBusService;
  private isRunning = false;
  private botStates: Map<string, BotState> = new Map();
  private activeExecutions: Map<string, ExecutionRequest> = new Map();
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 5000; // 5 seconds
  private readonly HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
  private healthCheckInterval: NodeJS.Timeout | null = null;

  // Provider configurations
  private readonly FLASH_LOAN_PROVIDERS = {
    AAVE: {
      address: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2', // AAVE Pool
      abi: ['function flashLoanSimple(address,address,uint256,bytes,uint16)']
    },
    UNISWAP: {
      address: '0x1F98431c8aD98523631AE4a59f267346ea31F984', // Uniswap V3 Factory
      abi: ['function flash(address,uint256,uint256,bytes)']
    },
    BALANCER: {
      address: '0xBA12222222228d8Ba445958a75a0704d566BF2C8', // Balancer Vault
      abi: ['function flashLoan(address,address,uint256,bytes)']
    }
  };

  constructor(eventBus: EventBusService) {
    this.eventBus = eventBus;
    this.setupEventHandlers();
    this.initializeBotStates();
  }

  private setupEventHandlers(): void {
    // Listen for execution submitted events
    this.eventBus.subscribe(['execution.submitted'], 'execution-bot', async (event) => {
      if (event.event_type === 'execution.submitted') {
        await this.handleExecutionSubmitted({
          executionId: event.payload.execution_id,
          opportunityId: event.payload.opportunity_id,
          flashProvider: event.payload.flash_provider,
          loanAmount: event.payload.loan_amount,
          asset: event.payload.asset,
          gasEstimate: event.payload.gas_estimate,
          chain: 'ethereum', // Default chain
          dexPath: ['UNISWAP_V3', 'AAVE'] // Default path
        });
      }
    });
  }

  private initializeBotStates(): void {
    // Initialize multiple bot instances for load distribution
    for (let i = 1; i <= 3; i++) {
      const botId = `bot-${i}`;
      this.botStates.set(botId, {
        botId,
        currentState: 'IDLE',
        healthScore: 1.0,
        lastAction: 'Initialized',
        executionsToday: 0,
        successfulExecutions: 0,
        failedExecutions: 0
      });
    }
  }

  async start(): Promise<void> {
    if (this.isRunning) return;
    
    this.isRunning = true;
    logger.info('Execution Bot Service started');
    
    // Start health checks
    this.startHealthChecks();
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    logger.info('Execution Bot Service stopped');
  }

  private async handleExecutionSubmitted(request: ExecutionRequest): Promise<void> {
    // Find available bot
    const availableBot = this.findAvailableBot();
    
    if (!availableBot) {
      logger.warn('No available bots for execution:', request.executionId);
      return;
    }
    
    // Assign execution to bot
    this.activeExecutions.set(request.executionId, request);
    
    // Update bot state
    this.updateBotState(availableBot, 'EXECUTING', `Executing ${request.executionId}`);
    
    // Execute transaction
    await this.executeTransaction(request, availableBot);
  }

  private async executeTransaction(request: ExecutionRequest, botId: string): Promise<void> {
    let retries = 0;
    let lastError: Error | null = null;
    
    while (retries < this.MAX_RETRIES && this.isRunning) {
      try {
        logger.info(`Bot ${botId} executing transaction: ${request.executionId} (attempt ${retries + 1})`);
        
        // Build and send transaction
        const txHash = await this.buildAndSendTransaction(request);
        
        // Wait for transaction confirmation
        const receipt = await this.waitForTransaction(txHash, request.chain);
        
        if (receipt.status === 1) {
          // Success
          await this.handleExecutionSuccess(request, receipt);
        } else {
          // Reverted
          await this.handleExecutionRevert(request, receipt);
        }
        
        // Clean up
        this.activeExecutions.delete(request.executionId);
        this.updateBotState(botId, 'IDLE', 'Execution completed');
        
        return;
        
      } catch (error) {
        lastError = error as Error;
        retries++;
        
        logger.error(`Execution attempt ${retries} failed:`, error);
        
        if (retries < this.MAX_RETRIES) {
          logger.info(`Retrying in ${this.RETRY_DELAY / 1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
        }
      }
    }
    
    // All retries failed
    if (lastError) {
      await this.handleExecutionError(request, lastError);
      this.updateBotState(botId, 'ERROR', `Execution failed: ${lastError.message}`);
    }
    
    this.activeExecutions.delete(request.executionId);
  }

  private async buildAndSendTransaction(request: ExecutionRequest): Promise<string> {
    // This is a simplified implementation
    // In production, this would build the actual flash loan arbitrage transaction
    
    const provider = this.getProvider(request.chain);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
    
    // Mock transaction - in production, this would be a complex multi-step arbitrage
    const tx = {
      to: wallet.address, // Self-transfer for mock
      value: 0,
      gasLimit: 300000,
      gasPrice: await provider.getFeeData().then(fee => fee.gasPrice || 20000000000n),
      nonce: await wallet.getNonce()
    };
    
    // Sign and send transaction
    const signedTx = await wallet.signTransaction(tx);
    const txResponse = await provider.broadcastTransaction(signedTx);
    
    logger.info(`Transaction submitted: ${txResponse.hash}`);
    return txResponse.hash;
  }

  private async waitForTransaction(txHash: string, chain: string): Promise<ethers.TransactionReceipt> {
    const provider = this.getProvider(chain);
    const receipt = await provider.waitForTransaction(txHash, 1, 60000); // Wait 60 seconds max
    
    if (!receipt) {
      throw new Error('Transaction receipt not found');
    }
    
    return receipt;
  }

  private async handleExecutionSuccess(request: ExecutionRequest, receipt: ethers.TransactionReceipt): Promise<void> {
    // Calculate actual profit and gas used
    const gasUsed = Number(receipt.gasUsed) * Number(receipt.gasPrice) / 1e18;
    const actualProfit = request.loanAmount * 0.0001; // Mock profit calculation
    
    await this.eventBus.appendEvent({
      event_type: 'execution.confirmed',
      event_version: '1.0',
      source: 'bot',
      severity: 'success',
      payload: {
        execution_id: request.executionId,
        actual_profit: actualProfit,
        actual_gas: gasUsed,
        fees: {
          flash: request.loanAmount * 0.0009,
          protocol: actualProfit * 0.001,
          platform: actualProfit * 0.1
        }
      }
    });
    
    // Update bot stats
    this.updateBotStats(request.executionId, true);
    
    logger.info(`Execution confirmed: ${request.executionId} - Profit: ${actualProfit.toFixed(2)} USD`);
  }

  private async handleExecutionRevert(request: ExecutionRequest, receipt: ethers.TransactionReceipt): Promise<void> {
    const gasUsed = Number(receipt.gasUsed) * Number(receipt.gasPrice) / 1e18;
    
    await this.eventBus.appendEvent({
      event_type: 'execution.reverted',
      event_version: '1.0',
      source: 'bot',
      severity: 'warning',
      payload: {
        execution_id: request.executionId,
        revert_reason: 'SLIPPAGE_EXCEEDED', // This would be determined from revert data
        gas_used: gasUsed
      }
    });
    
    // Update bot stats
    this.updateBotStats(request.executionId, false);
    
    logger.warn(`Execution reverted: ${request.executionId} - Gas used: ${gasUsed.toFixed(4)} ETH`);
  }

  private async handleExecutionError(request: ExecutionRequest, error: Error): Promise<void> {
    await this.eventBus.appendEvent({
      event_type: 'execution.reverted',
      event_version: '1.0',
      source: 'bot',
      severity: 'error',
      payload: {
        execution_id: request.executionId,
        revert_reason: 'GAS_SPIKE',
        gas_used: 0
      }
    });
    
    // Update bot stats
    this.updateBotStats(request.executionId, false);
    
    logger.error(`Execution error: ${request.executionId}`, error);
  }

  private findAvailableBot(): string | null {
    for (const [botId, state] of this.botStates) {
      if (state.currentState === 'IDLE' && state.healthScore > 0.7) {
        return botId;
      }
    }
    return null;
  }

  private updateBotState(botId: string, state: 'IDLE' | 'EXECUTING' | 'ERROR', action: string): void {
    const botState = this.botStates.get(botId);
    if (botState) {
      const previousState = botState.currentState;
      botState.currentState = state;
      botState.lastAction = action;
      
      // Emit bot state changed event
      this.eventBus.appendEvent({
        event_type: 'bot.state.changed',
        event_version: '1.0',
        source: 'bot',
        severity: state === 'ERROR' ? 'error' : 'info',
        payload: {
          bot_id: botId,
          previous_state: previousState,
          current_state: state,
          health_score: botState.healthScore
        }
      });
    }
  }

  private updateBotStats(executionId: string, success: boolean): void {
    // Find bot that handled this execution
    for (const [botId, state] of this.botStates) {
      if (state.lastAction.includes(executionId)) {
        state.executionsToday++;
        
        if (success) {
          state.successfulExecutions++;
        } else {
          state.failedExecutions++;
        }
        
        // Update health score
        const totalExecutions = state.successfulExecutions + state.failedExecutions;
        if (totalExecutions > 0) {
          state.healthScore = state.successfulExecutions / totalExecutions;
        }
        
        break;
      }
    }
  }

  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthChecks();
    }, this.HEALTH_CHECK_INTERVAL);
  }

  private performHealthChecks(): void {
    for (const [botId, state] of this.botStates) {
      // Check if bot is stuck in EXECUTING state for too long
      if (state.currentState === 'EXECUTING' && this.shouldResetBot(botId)) {
        this.updateBotState(botId, 'IDLE', 'Health check reset');
      }
      
      // Update health score based on recent performance
      this.updateHealthScore(botId);
    }
  }

  private shouldResetBot(botId: string): boolean {
    // Check if bot has been executing for too long (stuck)
    const botState = this.botStates.get(botId);
    if (!botState || botState.currentState !== 'EXECUTING') {
      return false;
    }
    
    // Simple heuristic - if health score is too low, reset
    return botState.healthScore < 0.3;
  }

  private updateHealthScore(botId: string): void {
    const botState = this.botStates.get(botId);
    if (!botState) return;
    
    // Calculate health based on success rate
    const total = botState.successfulExecutions + botState.failedExecutions;
    if (total > 0) {
      botState.healthScore = botState.successfulExecutions / total;
    }
  }

  private getProvider(chain: string): ethers.Provider {
    // This would return the appropriate provider based on chain
    // For now, return Ethereum mainnet provider
    return new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
  }

  /**
   * Get bot states
   */
  getBotStates(): BotState[] {
    return Array.from(this.botStates.values());
  }

  /**
   * Get active executions
   */
  getActiveExecutions(): ExecutionRequest[] {
    return Array.from(this.activeExecutions.values());
  }

  /**
   * Get service status
   */
  getStatus(): {
    isRunning: boolean;
    activeBots: number;
    activeExecutions: number;
  } {
    return {
      isRunning: this.isRunning,
      activeBots: Array.from(this.botStates.values()).filter(b => b.currentState === 'EXECUTING').length,
      activeExecutions: this.activeExecutions.size
    };
  }
}