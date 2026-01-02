/**
 * Safety Monitor Service
 * Purpose: Watch event patterns, trigger protection mechanisms
 * Emits: safety.triggered, system.status.changed
 * Failure Behavior: Conservative default - PAUSE
 */

import { EventBusService } from './event-bus';
import { logger } from '../utils/logger';

export interface SafetyThresholds {
  gasPriceSpike: number; // gwei
  mevRiskScore: number; // 0-1
  revertRate: number; // percentage
  executionLatency: number; // milliseconds
  profitDecline: number; // percentage
}

export interface SafetyMetrics {
  currentGasPrice: number;
  mevRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  recentReverts: number;
  recentExecutions: number;
  averageLatency: number;
  averageProfit: number;
}

export class SafetyMonitorService {
  private eventBus: EventBusService;
  private isRunning = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private readonly MONITORING_INTERVAL_MS = 5000; // 5 seconds
  
  private readonly safetyThresholds: SafetyThresholds = {
    gasPriceSpike: 100, // 100 gwei
    mevRiskScore: 0.8, // 80% risk threshold
    revertRate: 20, // 20% revert rate
    executionLatency: 30000, // 30 seconds
    profitDecline: 50 // 50% profit decline
  };

  private safetyMetrics: SafetyMetrics = {
    currentGasPrice: 20,
    mevRiskLevel: 'LOW',
    recentReverts: 0,
    recentExecutions: 0,
    averageLatency: 5000,
    averageProfit: 15
  };

  // Event buffers for pattern analysis
  private eventBuffers = {
    gasPrices: [] as number[],
    executionLatencies: [] as number[],
    profits: [] as number[],
    reverts: [] as { timestamp: number; reason: string }[]
  };

  // Safety state
  private safetyState = {
    isPaused: false,
    lastTrigger: 0,
    cooldownUntil: 0,
    triggers: [] as Array<{
      timestamp: number;
      type: string;
      severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      value: any;
    }>
  };

  constructor(eventBus: EventBusService) {
    this.eventBus = eventBus;
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Monitor all events for safety patterns
    this.eventBus.on('event', (event) => {
      this.analyzeEventForSafety(event);
    });
  }

  async start(): Promise<void> {
    if (this.isRunning) return;
    
    this.isRunning = true;
    logger.info('Safety Monitor Service started');
    
    // Start monitoring loop
    this.monitoringInterval = setInterval(() => {
      this.performSafetyChecks();
    }, this.MONITORING_INTERVAL_MS);
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    logger.info('Safety Monitor Service stopped');
  }

  private analyzeEventForSafety(event: any): void {
    const timestamp = Date.now();
    
    switch (event.event_type) {
      case 'execution.submitted':
        // Track execution latency
        this.eventBuffers.executionLatencies.push(timestamp);
        break;
        
      case 'execution.confirmed':
        // Track profits
        this.eventBuffers.profits.push(event.payload.actual_profit);
        
        // Calculate latency
        if (this.eventBuffers.executionLatencies.length > 0) {
          const submitTime = this.eventBuffers.executionLatencies.pop() || timestamp;
          const latency = timestamp - submitTime;
          this.safetyMetrics.averageLatency = this.calculateMovingAverage(
            this.safetyMetrics.averageLatency,
            latency,
            10
          );
        }
        break;
        
      case 'execution.reverted':
        // Track reverts
        this.eventBuffers.reverts.push({
          timestamp,
          reason: event.payload.revert_reason
        });
        this.safetyMetrics.recentReverts++;
        break;
        
      case 'opportunity.detected':
        // Could be used for MEV risk detection
        break;
    }
    
    // Clean old events (keep last 100)
    this.cleanEventBuffers();
  }

  private performSafetyChecks(): void {
    if (!this.isRunning) return;
    
    try {
      // Check gas price spikes
      this.checkGasPriceSpike();
      
      // Check MEV risk
      this.checkMevRisk();
      
      // Check revert rate
      this.checkRevertRate();
      
      // Check execution latency
      this.checkExecutionLatency();
      
      // Check profit decline
      this.checkProfitDecline();
      
      // Update safety metrics
      this.updateSafetyMetrics();
      
    } catch (error) {
      logger.error('Safety check failed:', error);
      // Conservative approach - trigger safety on error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.triggerSafety('MONITOR_ERROR', 'HIGH', { error: errorMessage });
    }
  }

  private checkGasPriceSpike(): void {
    // Mock gas price check - in production, this would query current gas prices
    const currentGasPrice = this.safetyMetrics.currentGasPrice + Math.random() * 10;
    
    if (currentGasPrice > this.safetyThresholds.gasPriceSpike) {
      this.triggerSafety('GAS_SPIKE', 'HIGH', {
        currentGasPrice,
        threshold: this.safetyThresholds.gasPriceSpike
      });
    }
    
    this.eventBuffers.gasPrices.push(currentGasPrice);
  }

  private checkMevRisk(): void {
    // Mock MEV risk detection - in production, this would analyze mempool and recent blocks
    const mevRiskScore = Math.random();
    
    if (mevRiskScore > this.safetyThresholds.mevRiskScore) {
      this.triggerSafety('MEV_RISK', 'MEDIUM', {
        riskScore: mevRiskScore,
        threshold: this.safetyThresholds.mevRiskScore
      });
    }
    
    // Update MEV risk level
    if (mevRiskScore > 0.8) {
      this.safetyMetrics.mevRiskLevel = 'HIGH';
    } else if (mevRiskScore > 0.5) {
      this.safetyMetrics.mevRiskLevel = 'MEDIUM';
    } else {
      this.safetyMetrics.mevRiskLevel = 'LOW';
    }
  }

  private checkRevertRate(): void {
    // Calculate revert rate over last 100 executions
    const recentReverts = this.eventBuffers.reverts.filter(
      r => r.timestamp > Date.now() - 3600000 // Last hour
    ).length;
    
    const recentExecutions = this.eventBuffers.profits.length;
    const revertRate = recentExecutions > 0 ? (recentReverts / recentExecutions) * 100 : 0;
    
    if (revertRate > this.safetyThresholds.revertRate) {
      this.triggerSafety('REVERT_STREAK', 'MEDIUM', {
        revertRate,
        threshold: this.safetyThresholds.revertRate,
        recentReverts,
        recentExecutions
      });
    }
    
    this.safetyMetrics.recentReverts = recentReverts;
    this.safetyMetrics.recentExecutions = recentExecutions;
  }

  private checkExecutionLatency(): void {
    if (this.safetyMetrics.averageLatency > this.safetyThresholds.executionLatency) {
      this.triggerSafety('MONITOR_ERROR', 'LOW', {
        averageLatency: this.safetyMetrics.averageLatency,
        threshold: this.safetyThresholds.executionLatency
      });
    }
  }

  private checkProfitDecline(): void {
    // Check if average profit has declined significantly
    if (this.eventBuffers.profits.length < 10) return;
    
    const recentProfits = this.eventBuffers.profits.slice(-10);
    const olderProfits = this.eventBuffers.profits.slice(-20, -10);
    
    if (recentProfits.length > 0 && olderProfits.length > 0) {
      const recentAvg = recentProfits.reduce((a, b) => a + b, 0) / recentProfits.length;
      const olderAvg = olderProfits.reduce((a, b) => a + b, 0) / olderProfits.length;
      
      const declinePercent = ((olderAvg - recentAvg) / olderAvg) * 100;
      
      if (declinePercent > this.safetyThresholds.profitDecline) {
        this.triggerSafety('MONITOR_ERROR', 'MEDIUM', {
          declinePercent,
          recentAvg,
          olderAvg,
          threshold: this.safetyThresholds.profitDecline
        });
      }
      
      this.safetyMetrics.averageProfit = recentAvg;
    }
  }

  private triggerSafety(type: 'GAS_SPIKE' | 'MEV_RISK' | 'REVERT_STREAK' | 'MONITOR_ERROR', severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL', data: any): void {
    const timestamp = Date.now();
    
    // Check cooldown period
    if (timestamp < this.safetyState.cooldownUntil) {
      logger.debug(`Safety trigger ignored due to cooldown: ${type}`);
      return;
    }
    
    // Add to trigger history
    this.safetyState.triggers.push({
      timestamp,
      type,
      severity,
      value: data
    });
    
    // Keep only last 100 triggers
    if (this.safetyState.triggers.length > 100) {
      this.safetyState.triggers.shift();
    }
    
    // Determine action based on severity
    let actionTaken: 'PAUSE' | 'COOLDOWN' = 'COOLDOWN';
    
    if (severity === 'CRITICAL') {
      actionTaken = 'PAUSE';
      this.safetyState.isPaused = true;
      this.safetyState.lastTrigger = timestamp;
      this.safetyState.cooldownUntil = timestamp + 300000; // 5 minute cooldown
    } else if (severity === 'HIGH') {
      actionTaken = 'COOLDOWN';
      this.safetyState.cooldownUntil = timestamp + 60000; // 1 minute cooldown
    }
    
    // Emit safety triggered event
    this.eventBus.appendEvent({
      event_type: 'safety.triggered',
      event_version: '1.0',
      source: 'system',
      severity: severity.toLowerCase() as any,
      payload: {
        trigger_type: (type === 'MONITOR_ERROR' ? 'REVERT_STREAK' : type) as 'GAS_SPIKE' | 'MEV_RISK' | 'REVERT_STREAK',
        threshold: `${data.threshold || 'unknown'}`,
        action_taken: actionTaken
      }
    });
    
    logger.warn(`Safety triggered: ${type} (${severity}) - Action: ${actionTaken}`, data);
  }

  private updateSafetyMetrics(): void {
    // Update current gas price (mock)
    if (this.eventBuffers.gasPrices.length > 0) {
      this.safetyMetrics.currentGasPrice = this.eventBuffers.gasPrices[this.eventBuffers.gasPrices.length - 1];
    }
    
    // Clean old triggers
    const oneHourAgo = Date.now() - 3600000;
    this.safetyState.triggers = this.safetyState.triggers.filter(t => t.timestamp > oneHourAgo);
  }

  private cleanEventBuffers(): void {
    const maxBufferSize = 100;
    const oneHourAgo = Date.now() - 3600000;
    
    // Clean gas prices
    if (this.eventBuffers.gasPrices.length > maxBufferSize) {
      this.eventBuffers.gasPrices = this.eventBuffers.gasPrices.slice(-maxBufferSize);
    }
    
    // Clean execution latencies (these are timestamps)
    this.eventBuffers.executionLatencies = this.eventBuffers.executionLatencies.filter(
      t => t > oneHourAgo
    );
    
    // Clean profits
    if (this.eventBuffers.profits.length > maxBufferSize) {
      this.eventBuffers.profits = this.eventBuffers.profits.slice(-maxBufferSize);
    }
    
    // Clean reverts
    this.eventBuffers.reverts = this.eventBuffers.reverts.filter(
      r => r.timestamp > oneHourAgo
    );
  }

  private calculateMovingAverage(current: number, newValue: number, windowSize: number): number {
    return (current * (windowSize - 1) + newValue) / windowSize;
  }

  /**
   * Get current safety metrics
   */
  getSafetyMetrics(): SafetyMetrics {
    return { ...this.safetyMetrics };
  }

  /**
   * Get safety thresholds
   */
  getSafetyThresholds(): SafetyThresholds {
    return { ...this.safetyThresholds };
  }

  /**
   * Get safety state
   */
  getSafetyState(): {
    isPaused: boolean;
    lastTrigger: number;
    cooldownUntil: number;
    recentTriggers: Array<{
      timestamp: number;
      type: string;
      severity: string;
      value: any;
    }>;
  } {
    return {
      isPaused: this.safetyState.isPaused,
      lastTrigger: this.safetyState.lastTrigger,
      cooldownUntil: this.safetyState.cooldownUntil,
      recentTriggers: this.safetyState.triggers.slice(-10)
    };
  }

  /**
   * Manual safety reset (for admin use)
   */
  async resetSafety(): Promise<void> {
    this.safetyState.isPaused = false;
    this.safetyState.lastTrigger = 0;
    this.safetyState.cooldownUntil = 0;
    this.safetyState.triggers = [];
    
    logger.info('Safety state reset manually');
  }

  /**
   * Get service status
   */
  getStatus(): {
    isRunning: boolean;
    metrics: SafetyMetrics;
    state: any;
  } {
    return {
      isRunning: this.isRunning,
      metrics: this.getSafetyMetrics(),
      state: this.getSafetyState()
    };
  }
}