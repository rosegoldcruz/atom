/**
 * Orchestrator Service - Gatekeeper
 * Purpose: Decide if execution MAY be attempted, enforce global limits
 * Consumes: simulation.completed
 * Emits: execution.submitted, safety.triggered, system.status.changed
 * Forbidden: Modifying execution logic, bypassing constraints
 */

import { EventBusService } from './event-bus';
import { logger } from '../utils/logger';
import { v7 as uuidv7 } from 'uuid';

export interface GlobalLimits {
  maxDailyExecutions: number;
  maxDailyVolume: number;
  maxConcurrentExecutions: number;
  maxGasPerExecution: number;
  minProfitThreshold: number;
  revertRateThreshold: number;
}

export interface ExecutionStats {
  executionsToday: number;
  volumeToday: number;
  activeExecutions: number;
  revertsToday: number;
  totalReverts: number;
  totalExecutions: number;
}

export class OrchestratorService {
  private eventBus: EventBusService;
  private isRunning = false;
  private systemStatus: 'LIVE' | 'PAUSED' | 'DEGRADED' | 'PROTECTED' = 'LIVE';
  private stats: ExecutionStats = {
    executionsToday: 0,
    volumeToday: 0,
    activeExecutions: 0,
    revertsToday: 0,
    totalReverts: 0,
    totalExecutions: 0
  };
  
  private readonly globalLimits: GlobalLimits = {
    maxDailyExecutions: 100,
    maxDailyVolume: 10000000, // $10M
    maxConcurrentExecutions: 10,
    maxGasPerExecution: 100, // $100
    minProfitThreshold: 5, // $5 minimum profit
    revertRateThreshold: 0.2 // 20% max revert rate
  };

  private executionQueue: Array<{
    opportunityId: string;
    simulationResult: any;
    timestamp: number;
  }> = [];

  constructor(eventBus: EventBusService) {
    this.eventBus = eventBus;
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Listen for simulation completed events
    this.eventBus.subscribe(['simulation.completed'], 'orchestrator', async (event) => {
      if (event.event_type === 'simulation.completed') {
        await this.handleSimulationCompleted({
          opportunityId: event.payload.opportunity_id,
          simulationResult: event.payload,
          timestamp: event.timestamp.unix_ms
        });
      }
    });

    // Listen for execution completed/reverted events
    this.eventBus.subscribe(['execution.confirmed', 'execution.reverted'], 'orchestrator', async (event) => {
      if (event.event_type === 'execution.confirmed') {
        await this.handleExecutionCompleted(event.payload);
      } else if (event.event_type === 'execution.reverted') {
        await this.handleExecutionReverted(event.payload);
      }
    });

    // Listen for safety triggers
    this.eventBus.subscribe(['safety.triggered'], 'orchestrator', async (event) => {
      await this.handleSafetyTriggered(event.payload);
    });
  }

  async start(): Promise<void> {
    if (this.isRunning) return;
    
    this.isRunning = true;
    logger.info('Orchestrator Service started');
    
    // Start processing queue
    this.processQueue();
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    logger.info('Orchestrator Service stopped');
  }

  private async handleSimulationCompleted(data: {
    opportunityId: string;
    simulationResult: any;
    timestamp: number;
  }): Promise<void> {
    // Add to execution queue
    this.executionQueue.push(data);
    
    logger.debug(`Simulation completed for opportunity: ${data.opportunityId}`);
  }

  private async processQueue(): Promise<void> {
    while (this.isRunning) {
      if (this.executionQueue.length > 0) {
        const item = this.executionQueue.shift()!;
        
        try {
          await this.evaluateExecution(item);
        } catch (error) {
          logger.error('Execution evaluation failed:', error);
        }
        
        // Small delay between evaluations
        await new Promise(resolve => setTimeout(resolve, 100));
      } else {
        // Wait for new items
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }

  private async evaluateExecution(item: {
    opportunityId: string;
    simulationResult: any;
    timestamp: number;
  }): Promise<void> {
    const { opportunityId, simulationResult } = item;
    
    // Check if simulation passed constraints
    if (!simulationResult.passes_constraints) {
      logger.debug(`Execution rejected: simulation failed constraints for ${opportunityId}`);
      return;
    }
    
    // Check global limits
    const canExecute = await this.checkGlobalLimits(simulationResult);
    
    if (canExecute.allowed) {
      // Submit for execution
      await this.submitExecution(opportunityId, simulationResult);
    } else {
      logger.debug(`Execution rejected: ${canExecute.reason} for ${opportunityId}`);
      
      // Trigger safety if needed
      if (canExecute.triggerSafety) {
        await this.triggerSafety(canExecute.reason);
      }
    }
  }

  private async checkGlobalLimits(simulationResult: any): Promise<{
    allowed: boolean;
    reason?: string;
    triggerSafety?: boolean;
  }> {
    // Check daily execution limit
    if (this.stats.executionsToday >= this.globalLimits.maxDailyExecutions) {
      return {
        allowed: false,
        reason: 'Daily execution limit reached',
        triggerSafety: false
      };
    }
    
    // Check daily volume limit
    const newVolume = this.stats.volumeToday + simulationResult.expected_profit;
    if (newVolume > this.globalLimits.maxDailyVolume) {
      return {
        allowed: false,
        reason: 'Daily volume limit reached',
        triggerSafety: false
      };
    }
    
    // Check concurrent execution limit
    if (this.stats.activeExecutions >= this.globalLimits.maxConcurrentExecutions) {
      return {
        allowed: false,
        reason: 'Max concurrent executions reached',
        triggerSafety: false
      };
    }
    
    // Check gas limit
    if (simulationResult.expected_gas > this.globalLimits.maxGasPerExecution) {
      return {
        allowed: false,
        reason: 'Gas cost exceeds limit',
        triggerSafety: false
      };
    }
    
    // Check minimum profit threshold
    if (simulationResult.net_expected_profit < this.globalLimits.minProfitThreshold) {
      return {
        allowed: false,
        reason: 'Profit below minimum threshold',
        triggerSafety: false
      };
    }
    
    // Check revert rate
    const revertRate = this.stats.totalExecutions > 0 ? 
      this.stats.totalReverts / this.stats.totalExecutions : 0;
    
    if (revertRate > this.globalLimits.revertRateThreshold) {
      return {
        allowed: false,
        reason: 'Revert rate too high',
        triggerSafety: true
      };
    }
    
    return { allowed: true };
  }

  private async submitExecution(opportunityId: string, simulationResult: any): Promise<void> {
    const executionId = uuidv7();
    
    // Update stats
    this.stats.activeExecutions++;
    this.stats.executionsToday++;
    this.stats.totalExecutions++;
    this.stats.volumeToday += simulationResult.net_expected_profit;
    
    // Emit execution submitted event
    await this.eventBus.appendEvent({
      event_type: 'execution.submitted',
      source: 'orchestrator',
      severity: 'info',
      payload: {
        opportunity_id: opportunityId,
        execution_id: executionId,
        flash_provider: 'AAVE', // Default provider
        loan_amount: simulationResult.liquidity_estimate || 100000,
        asset: simulationResult.asset_in || 'USDC',
        gas_estimate: simulationResult.expected_gas
      }
    });
    
    logger.info(`Execution submitted: ${executionId} for opportunity: ${opportunityId}`);
  }

  private async handleExecutionCompleted(payload: any): Promise<void> {
    this.stats.activeExecutions--;
    
    logger.debug(`Execution completed: ${payload.execution_id}`);
  }

  private async handleExecutionReverted(payload: any): Promise<void> {
    this.stats.activeExecutions--;
    this.stats.revertsToday++;
    this.stats.totalReverts++;
    
    logger.debug(`Execution reverted: ${payload.execution_id} - ${payload.revert_reason}`);
    
    // Check if revert rate is too high
    const revertRate = this.stats.totalExecutions > 0 ? 
      this.stats.totalReverts / this.stats.totalExecutions : 0;
    
    if (revertRate > this.globalLimits.revertRateThreshold) {
      await this.triggerSafety('High revert rate detected');
    }
  }

  private async handleSafetyTriggered(payload: any): Promise<void> {
    // Update system status based on trigger
    if (payload.action_taken === 'PAUSE') {
      await this.updateSystemStatus('PROTECTED', payload.trigger_type);
    }
  }

  private async triggerSafety(reason: string): Promise<void> {
    await this.eventBus.appendEvent({
      event_type: 'safety.triggered',
      source: 'orchestrator',
      severity: 'critical',
      payload: {
        trigger_type: 'REVERT_STREAK',
        threshold: reason,
        action_taken: 'PAUSE'
      }
    });
    
    logger.warn(`Safety triggered: ${reason}`);
  }

  private async updateSystemStatus(status: 'LIVE' | 'PAUSED' | 'DEGRADED' | 'PROTECTED', reason: string): Promise<void> {
    const previousStatus = this.systemStatus;
    this.systemStatus = status;
    
    await this.eventBus.appendEvent({
      event_type: 'system.status.changed',
      source: 'orchestrator',
      severity: status === 'PROTECTED' ? 'critical' : 'warning',
      payload: {
        previous_status: previousStatus,
        current_status: status,
        reason: reason,
        initiated_by: 'system'
      }
    });
    
    logger.info(`System status changed: ${previousStatus} -> ${status} (${reason})`);
  }

  /**
   * Get current execution statistics
   */
  getStats(): ExecutionStats {
    return { ...this.stats };
  }

  /**
   * Get global limits
   */
  getGlobalLimits(): GlobalLimits {
    return { ...this.globalLimits };
  }

  /**
   * Get system status
   */
  getSystemStatus(): 'LIVE' | 'PAUSED' | 'DEGRADED' | 'PROTECTED' {
    return this.systemStatus;
  }

  /**
   * Reset daily stats (call at midnight UTC)
   */
  async resetDailyStats(): Promise<void> {
    this.stats.executionsToday = 0;
    this.stats.volumeToday = 0;
    this.stats.revertsToday = 0;
    
    logger.info('Daily stats reset');
  }
}