"use strict";
/**
 * ATOM Event Schema Specification (Authoritative)
 * This defines every event that feeds the ATOM dashboard
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVENT_SCHEMAS = exports.ProfitRealizedSchema = exports.BotStateChangedSchema = exports.StrategyStateChangedSchema = exports.SafetyTriggeredSchema = exports.ExecutionRevertedSchema = exports.ExecutionConfirmedSchema = exports.ExecutionSubmittedSchema = exports.SimulationCompletedSchema = exports.SimulationStartedSchema = exports.OpportunityDetectedSchema = exports.SystemStatusChangedSchema = exports.EventEnvelopeSchema = void 0;
const zod_1 = require("zod");
// Global Event Envelope - ALL EVENTS must conform to this
exports.EventEnvelopeSchema = zod_1.z.object({
    event_id: zod_1.z.string().uuid(), // UUID v7 for ordering
    event_type: zod_1.z.string(),
    event_version: zod_1.z.string().default("1.0"),
    source: zod_1.z.enum(["onchain", "agent", "bot", "orchestrator", "system"]),
    timestamp: zod_1.z.object({
        iso: zod_1.z.string().datetime(),
        unix_ms: zod_1.z.number().int(),
        block_number: zod_1.z.number().int().optional(),
        tx_hash: zod_1.z.string().regex(/^0x[a-fA-F0-9]{64}$/).optional()
    }),
    user_id: zod_1.z.string().uuid().optional(),
    strategy_id: zod_1.z.string().optional(),
    bot_id: zod_1.z.string().optional(),
    severity: zod_1.z.enum(["info", "success", "warning", "error", "critical"]),
    payload: zod_1.z.record(zod_1.z.any())
});
// System Events
exports.SystemStatusChangedSchema = exports.EventEnvelopeSchema.extend({
    event_type: zod_1.z.literal("system.status.changed"),
    payload: zod_1.z.object({
        previous_status: zod_1.z.enum(["LIVE", "PAUSED", "DEGRADED", "PROTECTED"]),
        current_status: zod_1.z.enum(["LIVE", "PAUSED", "DEGRADED", "PROTECTED"]),
        reason: zod_1.z.string(),
        initiated_by: zod_1.z.enum(["system", "human", "safety_rule"])
    })
});
// Market & Opportunity Events
exports.OpportunityDetectedSchema = exports.EventEnvelopeSchema.extend({
    event_type: zod_1.z.literal("opportunity.detected"),
    payload: zod_1.z.object({
        opportunity_id: zod_1.z.string().uuid(),
        chain: zod_1.z.enum(["ethereum", "arbitrum", "base", "polygon"]),
        dex_path: zod_1.z.array(zod_1.z.string()),
        asset_in: zod_1.z.string(),
        asset_out: zod_1.z.string(),
        spread_bps: zod_1.z.number(),
        liquidity_estimate: zod_1.z.number(),
        confidence_score: zod_1.z.number().min(0).max(1)
    })
});
// Simulation Events
exports.SimulationStartedSchema = exports.EventEnvelopeSchema.extend({
    event_type: zod_1.z.literal("simulation.started"),
    payload: zod_1.z.object({
        opportunity_id: zod_1.z.string().uuid(),
        strategy_parameters: zod_1.z.object({
            slippage: zod_1.z.number(),
            gas_cap: zod_1.z.number()
        })
    })
});
exports.SimulationCompletedSchema = exports.EventEnvelopeSchema.extend({
    event_type: zod_1.z.literal("simulation.completed"),
    payload: zod_1.z.object({
        opportunity_id: zod_1.z.string().uuid(),
        expected_profit: zod_1.z.number(),
        expected_gas: zod_1.z.number(),
        expected_flash_fee: zod_1.z.number(),
        net_expected_profit: zod_1.z.number(),
        passes_constraints: zod_1.z.boolean()
    })
});
// Execution Events
exports.ExecutionSubmittedSchema = exports.EventEnvelopeSchema.extend({
    event_type: zod_1.z.literal("execution.submitted"),
    payload: zod_1.z.object({
        opportunity_id: zod_1.z.string().uuid(),
        execution_id: zod_1.z.string().uuid(),
        flash_provider: zod_1.z.enum(["AAVE", "UNISWAP", "BALANCER"]),
        loan_amount: zod_1.z.number(),
        asset: zod_1.z.string(),
        gas_estimate: zod_1.z.number()
    })
});
exports.ExecutionConfirmedSchema = exports.EventEnvelopeSchema.extend({
    event_type: zod_1.z.literal("execution.confirmed"),
    payload: zod_1.z.object({
        execution_id: zod_1.z.string().uuid(),
        actual_profit: zod_1.z.number(),
        actual_gas: zod_1.z.number(),
        fees: zod_1.z.object({
            flash: zod_1.z.number(),
            protocol: zod_1.z.number(),
            platform: zod_1.z.number()
        })
    })
});
exports.ExecutionRevertedSchema = exports.EventEnvelopeSchema.extend({
    event_type: zod_1.z.literal("execution.reverted"),
    payload: zod_1.z.object({
        execution_id: zod_1.z.string().uuid(),
        revert_reason: zod_1.z.enum(["SLIPPAGE_EXCEEDED", "GAS_SPIKE", "PROFIT_CHECK_FAILED"]),
        gas_used: zod_1.z.number()
    })
});
// Safety & Protection Events
exports.SafetyTriggeredSchema = exports.EventEnvelopeSchema.extend({
    event_type: zod_1.z.literal("safety.triggered"),
    payload: zod_1.z.object({
        trigger_type: zod_1.z.enum(["GAS_SPIKE", "MEV_RISK", "REVERT_STREAK"]),
        threshold: zod_1.z.string(),
        action_taken: zod_1.z.enum(["PAUSE", "COOLDOWN"])
    })
});
// Strategy Lifecycle Events
exports.StrategyStateChangedSchema = exports.EventEnvelopeSchema.extend({
    event_type: zod_1.z.literal("strategy.state.changed"),
    payload: zod_1.z.object({
        strategy_id: zod_1.z.string(),
        previous_state: zod_1.z.enum(["ACTIVE", "PAUSED", "COOLDOWN"]),
        current_state: zod_1.z.enum(["ACTIVE", "PAUSED", "COOLDOWN"]),
        reason: zod_1.z.string()
    })
});
// Bot Lifecycle Events
exports.BotStateChangedSchema = exports.EventEnvelopeSchema.extend({
    event_type: zod_1.z.literal("bot.state.changed"),
    payload: zod_1.z.object({
        bot_id: zod_1.z.string(),
        previous_state: zod_1.z.enum(["IDLE", "EXECUTING", "ERROR"]),
        current_state: zod_1.z.enum(["IDLE", "EXECUTING", "ERROR"]),
        health_score: zod_1.z.number().min(0).max(1)
    })
});
// Financial Events
exports.ProfitRealizedSchema = exports.EventEnvelopeSchema.extend({
    event_type: zod_1.z.literal("profit.realized"),
    payload: zod_1.z.object({
        execution_id: zod_1.z.string().uuid(),
        gross_profit: zod_1.z.number(),
        net_profit: zod_1.z.number(),
        currency: zod_1.z.string()
    })
});
// Event Type Registry
exports.EVENT_SCHEMAS = {
    "system.status.changed": exports.SystemStatusChangedSchema,
    "opportunity.detected": exports.OpportunityDetectedSchema,
    "simulation.started": exports.SimulationStartedSchema,
    "simulation.completed": exports.SimulationCompletedSchema,
    "execution.submitted": exports.ExecutionSubmittedSchema,
    "execution.confirmed": exports.ExecutionConfirmedSchema,
    "execution.reverted": exports.ExecutionRevertedSchema,
    "safety.triggered": exports.SafetyTriggeredSchema,
    "strategy.state.changed": exports.StrategyStateChangedSchema,
    "bot.state.changed": exports.BotStateChangedSchema,
    "profit.realized": exports.ProfitRealizedSchema
};
//# sourceMappingURL=event-schema.js.map