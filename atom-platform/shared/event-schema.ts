/**
 * ATOM Event Schema Specification (Authoritative)
 * This defines every event that feeds the ATOM dashboard
 */

import { z } from 'zod';

// Global Event Envelope - ALL EVENTS must conform to this
export const EventEnvelopeSchema = z.object({
  event_id: z.string().uuid(), // UUID v7 for ordering
  event_type: z.string(),
  event_version: z.string().default("1.0"),
  source: z.enum(["onchain", "agent", "bot", "orchestrator", "system"]),
  timestamp: z.object({
    iso: z.string().datetime(),
    unix_ms: z.number().int(),
    block_number: z.number().int().optional(),
    tx_hash: z.string().regex(/^0x[a-fA-F0-9]{64}$/).optional()
  }),
  user_id: z.string().uuid().optional(),
  strategy_id: z.string().optional(),
  bot_id: z.string().optional(),
  severity: z.enum(["info", "success", "warning", "error", "critical"]),
  payload: z.record(z.any())
});

export type EventEnvelope = z.infer<typeof EventEnvelopeSchema>;

// System Events
export const SystemStatusChangedSchema = EventEnvelopeSchema.extend({
  event_type: z.literal("system.status.changed"),
  payload: z.object({
    previous_status: z.enum(["LIVE", "PAUSED", "DEGRADED", "PROTECTED"]),
    current_status: z.enum(["LIVE", "PAUSED", "DEGRADED", "PROTECTED"]),
    reason: z.string(),
    initiated_by: z.enum(["system", "human", "safety_rule"])
  })
});

// Market & Opportunity Events
export const OpportunityDetectedSchema = EventEnvelopeSchema.extend({
  event_type: z.literal("opportunity.detected"),
  payload: z.object({
    opportunity_id: z.string().uuid(),
    chain: z.enum(["ethereum", "arbitrum", "base", "polygon"]),
    dex_path: z.array(z.string()),
    asset_in: z.string(),
    asset_out: z.string(),
    spread_bps: z.number(),
    liquidity_estimate: z.number(),
    confidence_score: z.number().min(0).max(1)
  })
});

// Simulation Events
export const SimulationStartedSchema = EventEnvelopeSchema.extend({
  event_type: z.literal("simulation.started"),
  payload: z.object({
    opportunity_id: z.string().uuid(),
    strategy_parameters: z.object({
      slippage: z.number(),
      gas_cap: z.number()
    })
  })
});

export const SimulationCompletedSchema = EventEnvelopeSchema.extend({
  event_type: z.literal("simulation.completed"),
  payload: z.object({
    opportunity_id: z.string().uuid(),
    expected_profit: z.number(),
    expected_gas: z.number(),
    expected_flash_fee: z.number(),
    net_expected_profit: z.number(),
    passes_constraints: z.boolean()
  })
});

// Execution Events
export const ExecutionSubmittedSchema = EventEnvelopeSchema.extend({
  event_type: z.literal("execution.submitted"),
  payload: z.object({
    opportunity_id: z.string().uuid(),
    execution_id: z.string().uuid(),
    flash_provider: z.enum(["AAVE", "UNISWAP", "BALANCER"]),
    loan_amount: z.number(),
    asset: z.string(),
    gas_estimate: z.number()
  })
});

export const ExecutionConfirmedSchema = EventEnvelopeSchema.extend({
  event_type: z.literal("execution.confirmed"),
  payload: z.object({
    execution_id: z.string().uuid(),
    actual_profit: z.number(),
    actual_gas: z.number(),
    fees: z.object({
      flash: z.number(),
      protocol: z.number(),
      platform: z.number()
    })
  })
});

export const ExecutionRevertedSchema = EventEnvelopeSchema.extend({
  event_type: z.literal("execution.reverted"),
  payload: z.object({
    execution_id: z.string().uuid(),
    revert_reason: z.enum(["SLIPPAGE_EXCEEDED", "GAS_SPIKE", "PROFIT_CHECK_FAILED"]),
    gas_used: z.number()
  })
});

// Safety & Protection Events
export const SafetyTriggeredSchema = EventEnvelopeSchema.extend({
  event_type: z.literal("safety.triggered"),
  payload: z.object({
    trigger_type: z.enum(["GAS_SPIKE", "MEV_RISK", "REVERT_STREAK"]),
    threshold: z.string(),
    action_taken: z.enum(["PAUSE", "COOLDOWN"])
  })
});

// Strategy Lifecycle Events
export const StrategyStateChangedSchema = EventEnvelopeSchema.extend({
  event_type: z.literal("strategy.state.changed"),
  payload: z.object({
    strategy_id: z.string(),
    previous_state: z.enum(["ACTIVE", "PAUSED", "COOLDOWN"]),
    current_state: z.enum(["ACTIVE", "PAUSED", "COOLDOWN"]),
    reason: z.string()
  })
});

// Bot Lifecycle Events
export const BotStateChangedSchema = EventEnvelopeSchema.extend({
  event_type: z.literal("bot.state.changed"),
  payload: z.object({
    bot_id: z.string(),
    previous_state: z.enum(["IDLE", "EXECUTING", "ERROR"]),
    current_state: z.enum(["IDLE", "EXECUTING", "ERROR"]),
    health_score: z.number().min(0).max(1)
  })
});

// Financial Events
export const ProfitRealizedSchema = EventEnvelopeSchema.extend({
  event_type: z.literal("profit.realized"),
  payload: z.object({
    execution_id: z.string().uuid(),
    gross_profit: z.number(),
    net_profit: z.number(),
    currency: z.string()
  })
});

// Event Union Type
export type AtomEvent = 
  | z.infer<typeof SystemStatusChangedSchema>
  | z.infer<typeof OpportunityDetectedSchema>
  | z.infer<typeof SimulationStartedSchema>
  | z.infer<typeof SimulationCompletedSchema>
  | z.infer<typeof ExecutionSubmittedSchema>
  | z.infer<typeof ExecutionConfirmedSchema>
  | z.infer<typeof ExecutionRevertedSchema>
  | z.infer<typeof SafetyTriggeredSchema>
  | z.infer<typeof StrategyStateChangedSchema>
  | z.infer<typeof BotStateChangedSchema>
  | z.infer<typeof ProfitRealizedSchema>;

// Event Type Registry
export const EVENT_SCHEMAS = {
  "system.status.changed": SystemStatusChangedSchema,
  "opportunity.detected": OpportunityDetectedSchema,
  "simulation.started": SimulationStartedSchema,
  "simulation.completed": SimulationCompletedSchema,
  "execution.submitted": ExecutionSubmittedSchema,
  "execution.confirmed": ExecutionConfirmedSchema,
  "execution.reverted": ExecutionRevertedSchema,
  "safety.triggered": SafetyTriggeredSchema,
  "strategy.state.changed": StrategyStateChangedSchema,
  "bot.state.changed": BotStateChangedSchema,
  "profit.realized": ProfitRealizedSchema
} as const;

export type EventType = keyof typeof EVENT_SCHEMAS;