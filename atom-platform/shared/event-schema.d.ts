/**
 * ATOM Event Schema Specification (Authoritative)
 * This defines every event that feeds the ATOM dashboard
 */
import { z } from 'zod';
export declare const EventEnvelopeSchema: z.ZodObject<{
    event_id: z.ZodString;
    event_type: z.ZodString;
    event_version: z.ZodDefault<z.ZodString>;
    source: z.ZodEnum<["onchain", "agent", "bot", "orchestrator", "system"]>;
    timestamp: z.ZodObject<{
        iso: z.ZodString;
        unix_ms: z.ZodNumber;
        block_number: z.ZodOptional<z.ZodNumber>;
        tx_hash: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        iso: string;
        unix_ms: number;
        block_number?: number | undefined;
        tx_hash?: string | undefined;
    }, {
        iso: string;
        unix_ms: number;
        block_number?: number | undefined;
        tx_hash?: string | undefined;
    }>;
    user_id: z.ZodOptional<z.ZodString>;
    strategy_id: z.ZodOptional<z.ZodString>;
    bot_id: z.ZodOptional<z.ZodString>;
    severity: z.ZodEnum<["info", "success", "warning", "error", "critical"]>;
    payload: z.ZodRecord<z.ZodString, z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    timestamp: {
        iso: string;
        unix_ms: number;
        block_number?: number | undefined;
        tx_hash?: string | undefined;
    };
    event_id: string;
    event_type: string;
    event_version: string;
    source: "onchain" | "agent" | "bot" | "orchestrator" | "system";
    severity: "info" | "error" | "success" | "warning" | "critical";
    payload: Record<string, any>;
    user_id?: string | undefined;
    strategy_id?: string | undefined;
    bot_id?: string | undefined;
}, {
    timestamp: {
        iso: string;
        unix_ms: number;
        block_number?: number | undefined;
        tx_hash?: string | undefined;
    };
    event_id: string;
    event_type: string;
    source: "onchain" | "agent" | "bot" | "orchestrator" | "system";
    severity: "info" | "error" | "success" | "warning" | "critical";
    payload: Record<string, any>;
    event_version?: string | undefined;
    user_id?: string | undefined;
    strategy_id?: string | undefined;
    bot_id?: string | undefined;
}>;
export type EventEnvelope = z.infer<typeof EventEnvelopeSchema>;
export declare const SystemStatusChangedSchema: z.ZodObject<{
    event_id: z.ZodString;
    event_version: z.ZodDefault<z.ZodString>;
    source: z.ZodEnum<["onchain", "agent", "bot", "orchestrator", "system"]>;
    timestamp: z.ZodObject<{
        iso: z.ZodString;
        unix_ms: z.ZodNumber;
        block_number: z.ZodOptional<z.ZodNumber>;
        tx_hash: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        iso: string;
        unix_ms: number;
        block_number?: number | undefined;
        tx_hash?: string | undefined;
    }, {
        iso: string;
        unix_ms: number;
        block_number?: number | undefined;
        tx_hash?: string | undefined;
    }>;
    user_id: z.ZodOptional<z.ZodString>;
    strategy_id: z.ZodOptional<z.ZodString>;
    bot_id: z.ZodOptional<z.ZodString>;
    severity: z.ZodEnum<["info", "success", "warning", "error", "critical"]>;
} & {
    event_type: z.ZodLiteral<"system.status.changed">;
    payload: z.ZodObject<{
        previous_status: z.ZodEnum<["LIVE", "PAUSED", "DEGRADED", "PROTECTED"]>;
        current_status: z.ZodEnum<["LIVE", "PAUSED", "DEGRADED", "PROTECTED"]>;
        reason: z.ZodString;
        initiated_by: z.ZodEnum<["system", "human", "safety_rule"]>;
    }, "strip", z.ZodTypeAny, {
        previous_status: "LIVE" | "PAUSED" | "DEGRADED" | "PROTECTED";
        current_status: "LIVE" | "PAUSED" | "DEGRADED" | "PROTECTED";
        reason: string;
        initiated_by: "system" | "human" | "safety_rule";
    }, {
        previous_status: "LIVE" | "PAUSED" | "DEGRADED" | "PROTECTED";
        current_status: "LIVE" | "PAUSED" | "DEGRADED" | "PROTECTED";
        reason: string;
        initiated_by: "system" | "human" | "safety_rule";
    }>;
}, "strip", z.ZodTypeAny, {
    timestamp: {
        iso: string;
        unix_ms: number;
        block_number?: number | undefined;
        tx_hash?: string | undefined;
    };
    event_id: string;
    event_type: "system.status.changed";
    event_version: string;
    source: "onchain" | "agent" | "bot" | "orchestrator" | "system";
    severity: "info" | "error" | "success" | "warning" | "critical";
    payload: {
        previous_status: "LIVE" | "PAUSED" | "DEGRADED" | "PROTECTED";
        current_status: "LIVE" | "PAUSED" | "DEGRADED" | "PROTECTED";
        reason: string;
        initiated_by: "system" | "human" | "safety_rule";
    };
    user_id?: string | undefined;
    strategy_id?: string | undefined;
    bot_id?: string | undefined;
}, {
    timestamp: {
        iso: string;
        unix_ms: number;
        block_number?: number | undefined;
        tx_hash?: string | undefined;
    };
    event_id: string;
    event_type: "system.status.changed";
    source: "onchain" | "agent" | "bot" | "orchestrator" | "system";
    severity: "info" | "error" | "success" | "warning" | "critical";
    payload: {
        previous_status: "LIVE" | "PAUSED" | "DEGRADED" | "PROTECTED";
        current_status: "LIVE" | "PAUSED" | "DEGRADED" | "PROTECTED";
        reason: string;
        initiated_by: "system" | "human" | "safety_rule";
    };
    event_version?: string | undefined;
    user_id?: string | undefined;
    strategy_id?: string | undefined;
    bot_id?: string | undefined;
}>;
export declare const OpportunityDetectedSchema: z.ZodObject<{
    event_id: z.ZodString;
    event_version: z.ZodDefault<z.ZodString>;
    source: z.ZodEnum<["onchain", "agent", "bot", "orchestrator", "system"]>;
    timestamp: z.ZodObject<{
        iso: z.ZodString;
        unix_ms: z.ZodNumber;
        block_number: z.ZodOptional<z.ZodNumber>;
        tx_hash: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        iso: string;
        unix_ms: number;
        block_number?: number | undefined;
        tx_hash?: string | undefined;
    }, {
        iso: string;
        unix_ms: number;
        block_number?: number | undefined;
        tx_hash?: string | undefined;
    }>;
    user_id: z.ZodOptional<z.ZodString>;
    strategy_id: z.ZodOptional<z.ZodString>;
    bot_id: z.ZodOptional<z.ZodString>;
    severity: z.ZodEnum<["info", "success", "warning", "error", "critical"]>;
} & {
    event_type: z.ZodLiteral<"opportunity.detected">;
    payload: z.ZodObject<{
        opportunity_id: z.ZodString;
        chain: z.ZodEnum<["ethereum", "arbitrum", "base", "polygon"]>;
        dex_path: z.ZodArray<z.ZodString, "many">;
        asset_in: z.ZodString;
        asset_out: z.ZodString;
        spread_bps: z.ZodNumber;
        liquidity_estimate: z.ZodNumber;
        confidence_score: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        opportunity_id: string;
        chain: "ethereum" | "arbitrum" | "base" | "polygon";
        dex_path: string[];
        asset_in: string;
        asset_out: string;
        spread_bps: number;
        liquidity_estimate: number;
        confidence_score: number;
    }, {
        opportunity_id: string;
        chain: "ethereum" | "arbitrum" | "base" | "polygon";
        dex_path: string[];
        asset_in: string;
        asset_out: string;
        spread_bps: number;
        liquidity_estimate: number;
        confidence_score: number;
    }>;
}, "strip", z.ZodTypeAny, {
    timestamp: {
        iso: string;
        unix_ms: number;
        block_number?: number | undefined;
        tx_hash?: string | undefined;
    };
    event_id: string;
    event_type: "opportunity.detected";
    event_version: string;
    source: "onchain" | "agent" | "bot" | "orchestrator" | "system";
    severity: "info" | "error" | "success" | "warning" | "critical";
    payload: {
        opportunity_id: string;
        chain: "ethereum" | "arbitrum" | "base" | "polygon";
        dex_path: string[];
        asset_in: string;
        asset_out: string;
        spread_bps: number;
        liquidity_estimate: number;
        confidence_score: number;
    };
    user_id?: string | undefined;
    strategy_id?: string | undefined;
    bot_id?: string | undefined;
}, {
    timestamp: {
        iso: string;
        unix_ms: number;
        block_number?: number | undefined;
        tx_hash?: string | undefined;
    };
    event_id: string;
    event_type: "opportunity.detected";
    source: "onchain" | "agent" | "bot" | "orchestrator" | "system";
    severity: "info" | "error" | "success" | "warning" | "critical";
    payload: {
        opportunity_id: string;
        chain: "ethereum" | "arbitrum" | "base" | "polygon";
        dex_path: string[];
        asset_in: string;
        asset_out: string;
        spread_bps: number;
        liquidity_estimate: number;
        confidence_score: number;
    };
    event_version?: string | undefined;
    user_id?: string | undefined;
    strategy_id?: string | undefined;
    bot_id?: string | undefined;
}>;
export declare const SimulationStartedSchema: z.ZodObject<{
    event_id: z.ZodString;
    event_version: z.ZodDefault<z.ZodString>;
    source: z.ZodEnum<["onchain", "agent", "bot", "orchestrator", "system"]>;
    timestamp: z.ZodObject<{
        iso: z.ZodString;
        unix_ms: z.ZodNumber;
        block_number: z.ZodOptional<z.ZodNumber>;
        tx_hash: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        iso: string;
        unix_ms: number;
        block_number?: number | undefined;
        tx_hash?: string | undefined;
    }, {
        iso: string;
        unix_ms: number;
        block_number?: number | undefined;
        tx_hash?: string | undefined;
    }>;
    user_id: z.ZodOptional<z.ZodString>;
    strategy_id: z.ZodOptional<z.ZodString>;
    bot_id: z.ZodOptional<z.ZodString>;
    severity: z.ZodEnum<["info", "success", "warning", "error", "critical"]>;
} & {
    event_type: z.ZodLiteral<"simulation.started">;
    payload: z.ZodObject<{
        opportunity_id: z.ZodString;
        strategy_parameters: z.ZodObject<{
            slippage: z.ZodNumber;
            gas_cap: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            slippage: number;
            gas_cap: number;
        }, {
            slippage: number;
            gas_cap: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        opportunity_id: string;
        strategy_parameters: {
            slippage: number;
            gas_cap: number;
        };
    }, {
        opportunity_id: string;
        strategy_parameters: {
            slippage: number;
            gas_cap: number;
        };
    }>;
}, "strip", z.ZodTypeAny, {
    timestamp: {
        iso: string;
        unix_ms: number;
        block_number?: number | undefined;
        tx_hash?: string | undefined;
    };
    event_id: string;
    event_type: "simulation.started";
    event_version: string;
    source: "onchain" | "agent" | "bot" | "orchestrator" | "system";
    severity: "info" | "error" | "success" | "warning" | "critical";
    payload: {
        opportunity_id: string;
        strategy_parameters: {
            slippage: number;
            gas_cap: number;
        };
    };
    user_id?: string | undefined;
    strategy_id?: string | undefined;
    bot_id?: string | undefined;
}, {
    timestamp: {
        iso: string;
        unix_ms: number;
        block_number?: number | undefined;
        tx_hash?: string | undefined;
    };
    event_id: string;
    event_type: "simulation.started";
    source: "onchain" | "agent" | "bot" | "orchestrator" | "system";
    severity: "info" | "error" | "success" | "warning" | "critical";
    payload: {
        opportunity_id: string;
        strategy_parameters: {
            slippage: number;
            gas_cap: number;
        };
    };
    event_version?: string | undefined;
    user_id?: string | undefined;
    strategy_id?: string | undefined;
    bot_id?: string | undefined;
}>;
export declare const SimulationCompletedSchema: z.ZodObject<{
    event_id: z.ZodString;
    event_version: z.ZodDefault<z.ZodString>;
    source: z.ZodEnum<["onchain", "agent", "bot", "orchestrator", "system"]>;
    timestamp: z.ZodObject<{
        iso: z.ZodString;
        unix_ms: z.ZodNumber;
        block_number: z.ZodOptional<z.ZodNumber>;
        tx_hash: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        iso: string;
        unix_ms: number;
        block_number?: number | undefined;
        tx_hash?: string | undefined;
    }, {
        iso: string;
        unix_ms: number;
        block_number?: number | undefined;
        tx_hash?: string | undefined;
    }>;
    user_id: z.ZodOptional<z.ZodString>;
    strategy_id: z.ZodOptional<z.ZodString>;
    bot_id: z.ZodOptional<z.ZodString>;
    severity: z.ZodEnum<["info", "success", "warning", "error", "critical"]>;
} & {
    event_type: z.ZodLiteral<"simulation.completed">;
    payload: z.ZodObject<{
        opportunity_id: z.ZodString;
        expected_profit: z.ZodNumber;
        expected_gas: z.ZodNumber;
        expected_flash_fee: z.ZodNumber;
        net_expected_profit: z.ZodNumber;
        passes_constraints: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        opportunity_id: string;
        expected_profit: number;
        expected_gas: number;
        expected_flash_fee: number;
        net_expected_profit: number;
        passes_constraints: boolean;
    }, {
        opportunity_id: string;
        expected_profit: number;
        expected_gas: number;
        expected_flash_fee: number;
        net_expected_profit: number;
        passes_constraints: boolean;
    }>;
}, "strip", z.ZodTypeAny, {
    timestamp: {
        iso: string;
        unix_ms: number;
        block_number?: number | undefined;
        tx_hash?: string | undefined;
    };
    event_id: string;
    event_type: "simulation.completed";
    event_version: string;
    source: "onchain" | "agent" | "bot" | "orchestrator" | "system";
    severity: "info" | "error" | "success" | "warning" | "critical";
    payload: {
        opportunity_id: string;
        expected_profit: number;
        expected_gas: number;
        expected_flash_fee: number;
        net_expected_profit: number;
        passes_constraints: boolean;
    };
    user_id?: string | undefined;
    strategy_id?: string | undefined;
    bot_id?: string | undefined;
}, {
    timestamp: {
        iso: string;
        unix_ms: number;
        block_number?: number | undefined;
        tx_hash?: string | undefined;
    };
    event_id: string;
    event_type: "simulation.completed";
    source: "onchain" | "agent" | "bot" | "orchestrator" | "system";
    severity: "info" | "error" | "success" | "warning" | "critical";
    payload: {
        opportunity_id: string;
        expected_profit: number;
        expected_gas: number;
        expected_flash_fee: number;
        net_expected_profit: number;
        passes_constraints: boolean;
    };
    event_version?: string | undefined;
    user_id?: string | undefined;
    strategy_id?: string | undefined;
    bot_id?: string | undefined;
}>;
export declare const ExecutionSubmittedSchema: z.ZodObject<{
    event_id: z.ZodString;
    event_version: z.ZodDefault<z.ZodString>;
    source: z.ZodEnum<["onchain", "agent", "bot", "orchestrator", "system"]>;
    timestamp: z.ZodObject<{
        iso: z.ZodString;
        unix_ms: z.ZodNumber;
        block_number: z.ZodOptional<z.ZodNumber>;
        tx_hash: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        iso: string;
        unix_ms: number;
        block_number?: number | undefined;
        tx_hash?: string | undefined;
    }, {
        iso: string;
        unix_ms: number;
        block_number?: number | undefined;
        tx_hash?: string | undefined;
    }>;
    user_id: z.ZodOptional<z.ZodString>;
    strategy_id: z.ZodOptional<z.ZodString>;
    bot_id: z.ZodOptional<z.ZodString>;
    severity: z.ZodEnum<["info", "success", "warning", "error", "critical"]>;
} & {
    event_type: z.ZodLiteral<"execution.submitted">;
    payload: z.ZodObject<{
        opportunity_id: z.ZodString;
        execution_id: z.ZodString;
        flash_provider: z.ZodEnum<["AAVE", "UNISWAP", "BALANCER"]>;
        loan_amount: z.ZodNumber;
        asset: z.ZodString;
        gas_estimate: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        opportunity_id: string;
        execution_id: string;
        flash_provider: "AAVE" | "UNISWAP" | "BALANCER";
        loan_amount: number;
        asset: string;
        gas_estimate: number;
    }, {
        opportunity_id: string;
        execution_id: string;
        flash_provider: "AAVE" | "UNISWAP" | "BALANCER";
        loan_amount: number;
        asset: string;
        gas_estimate: number;
    }>;
}, "strip", z.ZodTypeAny, {
    timestamp: {
        iso: string;
        unix_ms: number;
        block_number?: number | undefined;
        tx_hash?: string | undefined;
    };
    event_id: string;
    event_type: "execution.submitted";
    event_version: string;
    source: "onchain" | "agent" | "bot" | "orchestrator" | "system";
    severity: "info" | "error" | "success" | "warning" | "critical";
    payload: {
        opportunity_id: string;
        execution_id: string;
        flash_provider: "AAVE" | "UNISWAP" | "BALANCER";
        loan_amount: number;
        asset: string;
        gas_estimate: number;
    };
    user_id?: string | undefined;
    strategy_id?: string | undefined;
    bot_id?: string | undefined;
}, {
    timestamp: {
        iso: string;
        unix_ms: number;
        block_number?: number | undefined;
        tx_hash?: string | undefined;
    };
    event_id: string;
    event_type: "execution.submitted";
    source: "onchain" | "agent" | "bot" | "orchestrator" | "system";
    severity: "info" | "error" | "success" | "warning" | "critical";
    payload: {
        opportunity_id: string;
        execution_id: string;
        flash_provider: "AAVE" | "UNISWAP" | "BALANCER";
        loan_amount: number;
        asset: string;
        gas_estimate: number;
    };
    event_version?: string | undefined;
    user_id?: string | undefined;
    strategy_id?: string | undefined;
    bot_id?: string | undefined;
}>;
export declare const ExecutionConfirmedSchema: z.ZodObject<{
    event_id: z.ZodString;
    event_version: z.ZodDefault<z.ZodString>;
    source: z.ZodEnum<["onchain", "agent", "bot", "orchestrator", "system"]>;
    timestamp: z.ZodObject<{
        iso: z.ZodString;
        unix_ms: z.ZodNumber;
        block_number: z.ZodOptional<z.ZodNumber>;
        tx_hash: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        iso: string;
        unix_ms: number;
        block_number?: number | undefined;
        tx_hash?: string | undefined;
    }, {
        iso: string;
        unix_ms: number;
        block_number?: number | undefined;
        tx_hash?: string | undefined;
    }>;
    user_id: z.ZodOptional<z.ZodString>;
    strategy_id: z.ZodOptional<z.ZodString>;
    bot_id: z.ZodOptional<z.ZodString>;
    severity: z.ZodEnum<["info", "success", "warning", "error", "critical"]>;
} & {
    event_type: z.ZodLiteral<"execution.confirmed">;
    payload: z.ZodObject<{
        execution_id: z.ZodString;
        actual_profit: z.ZodNumber;
        actual_gas: z.ZodNumber;
        fees: z.ZodObject<{
            flash: z.ZodNumber;
            protocol: z.ZodNumber;
            platform: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            flash: number;
            protocol: number;
            platform: number;
        }, {
            flash: number;
            protocol: number;
            platform: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        execution_id: string;
        actual_profit: number;
        actual_gas: number;
        fees: {
            flash: number;
            protocol: number;
            platform: number;
        };
    }, {
        execution_id: string;
        actual_profit: number;
        actual_gas: number;
        fees: {
            flash: number;
            protocol: number;
            platform: number;
        };
    }>;
}, "strip", z.ZodTypeAny, {
    timestamp: {
        iso: string;
        unix_ms: number;
        block_number?: number | undefined;
        tx_hash?: string | undefined;
    };
    event_id: string;
    event_type: "execution.confirmed";
    event_version: string;
    source: "onchain" | "agent" | "bot" | "orchestrator" | "system";
    severity: "info" | "error" | "success" | "warning" | "critical";
    payload: {
        execution_id: string;
        actual_profit: number;
        actual_gas: number;
        fees: {
            flash: number;
            protocol: number;
            platform: number;
        };
    };
    user_id?: string | undefined;
    strategy_id?: string | undefined;
    bot_id?: string | undefined;
}, {
    timestamp: {
        iso: string;
        unix_ms: number;
        block_number?: number | undefined;
        tx_hash?: string | undefined;
    };
    event_id: string;
    event_type: "execution.confirmed";
    source: "onchain" | "agent" | "bot" | "orchestrator" | "system";
    severity: "info" | "error" | "success" | "warning" | "critical";
    payload: {
        execution_id: string;
        actual_profit: number;
        actual_gas: number;
        fees: {
            flash: number;
            protocol: number;
            platform: number;
        };
    };
    event_version?: string | undefined;
    user_id?: string | undefined;
    strategy_id?: string | undefined;
    bot_id?: string | undefined;
}>;
export declare const ExecutionRevertedSchema: z.ZodObject<{
    event_id: z.ZodString;
    event_version: z.ZodDefault<z.ZodString>;
    source: z.ZodEnum<["onchain", "agent", "bot", "orchestrator", "system"]>;
    timestamp: z.ZodObject<{
        iso: z.ZodString;
        unix_ms: z.ZodNumber;
        block_number: z.ZodOptional<z.ZodNumber>;
        tx_hash: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        iso: string;
        unix_ms: number;
        block_number?: number | undefined;
        tx_hash?: string | undefined;
    }, {
        iso: string;
        unix_ms: number;
        block_number?: number | undefined;
        tx_hash?: string | undefined;
    }>;
    user_id: z.ZodOptional<z.ZodString>;
    strategy_id: z.ZodOptional<z.ZodString>;
    bot_id: z.ZodOptional<z.ZodString>;
    severity: z.ZodEnum<["info", "success", "warning", "error", "critical"]>;
} & {
    event_type: z.ZodLiteral<"execution.reverted">;
    payload: z.ZodObject<{
        execution_id: z.ZodString;
        revert_reason: z.ZodEnum<["SLIPPAGE_EXCEEDED", "GAS_SPIKE", "PROFIT_CHECK_FAILED"]>;
        gas_used: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        execution_id: string;
        revert_reason: "SLIPPAGE_EXCEEDED" | "GAS_SPIKE" | "PROFIT_CHECK_FAILED";
        gas_used: number;
    }, {
        execution_id: string;
        revert_reason: "SLIPPAGE_EXCEEDED" | "GAS_SPIKE" | "PROFIT_CHECK_FAILED";
        gas_used: number;
    }>;
}, "strip", z.ZodTypeAny, {
    timestamp: {
        iso: string;
        unix_ms: number;
        block_number?: number | undefined;
        tx_hash?: string | undefined;
    };
    event_id: string;
    event_type: "execution.reverted";
    event_version: string;
    source: "onchain" | "agent" | "bot" | "orchestrator" | "system";
    severity: "info" | "error" | "success" | "warning" | "critical";
    payload: {
        execution_id: string;
        revert_reason: "SLIPPAGE_EXCEEDED" | "GAS_SPIKE" | "PROFIT_CHECK_FAILED";
        gas_used: number;
    };
    user_id?: string | undefined;
    strategy_id?: string | undefined;
    bot_id?: string | undefined;
}, {
    timestamp: {
        iso: string;
        unix_ms: number;
        block_number?: number | undefined;
        tx_hash?: string | undefined;
    };
    event_id: string;
    event_type: "execution.reverted";
    source: "onchain" | "agent" | "bot" | "orchestrator" | "system";
    severity: "info" | "error" | "success" | "warning" | "critical";
    payload: {
        execution_id: string;
        revert_reason: "SLIPPAGE_EXCEEDED" | "GAS_SPIKE" | "PROFIT_CHECK_FAILED";
        gas_used: number;
    };
    event_version?: string | undefined;
    user_id?: string | undefined;
    strategy_id?: string | undefined;
    bot_id?: string | undefined;
}>;
export declare const SafetyTriggeredSchema: z.ZodObject<{
    event_id: z.ZodString;
    event_version: z.ZodDefault<z.ZodString>;
    source: z.ZodEnum<["onchain", "agent", "bot", "orchestrator", "system"]>;
    timestamp: z.ZodObject<{
        iso: z.ZodString;
        unix_ms: z.ZodNumber;
        block_number: z.ZodOptional<z.ZodNumber>;
        tx_hash: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        iso: string;
        unix_ms: number;
        block_number?: number | undefined;
        tx_hash?: string | undefined;
    }, {
        iso: string;
        unix_ms: number;
        block_number?: number | undefined;
        tx_hash?: string | undefined;
    }>;
    user_id: z.ZodOptional<z.ZodString>;
    strategy_id: z.ZodOptional<z.ZodString>;
    bot_id: z.ZodOptional<z.ZodString>;
    severity: z.ZodEnum<["info", "success", "warning", "error", "critical"]>;
} & {
    event_type: z.ZodLiteral<"safety.triggered">;
    payload: z.ZodObject<{
        trigger_type: z.ZodEnum<["GAS_SPIKE", "MEV_RISK", "REVERT_STREAK"]>;
        threshold: z.ZodString;
        action_taken: z.ZodEnum<["PAUSE", "COOLDOWN"]>;
    }, "strip", z.ZodTypeAny, {
        trigger_type: "GAS_SPIKE" | "MEV_RISK" | "REVERT_STREAK";
        threshold: string;
        action_taken: "PAUSE" | "COOLDOWN";
    }, {
        trigger_type: "GAS_SPIKE" | "MEV_RISK" | "REVERT_STREAK";
        threshold: string;
        action_taken: "PAUSE" | "COOLDOWN";
    }>;
}, "strip", z.ZodTypeAny, {
    timestamp: {
        iso: string;
        unix_ms: number;
        block_number?: number | undefined;
        tx_hash?: string | undefined;
    };
    event_id: string;
    event_type: "safety.triggered";
    event_version: string;
    source: "onchain" | "agent" | "bot" | "orchestrator" | "system";
    severity: "info" | "error" | "success" | "warning" | "critical";
    payload: {
        trigger_type: "GAS_SPIKE" | "MEV_RISK" | "REVERT_STREAK";
        threshold: string;
        action_taken: "PAUSE" | "COOLDOWN";
    };
    user_id?: string | undefined;
    strategy_id?: string | undefined;
    bot_id?: string | undefined;
}, {
    timestamp: {
        iso: string;
        unix_ms: number;
        block_number?: number | undefined;
        tx_hash?: string | undefined;
    };
    event_id: string;
    event_type: "safety.triggered";
    source: "onchain" | "agent" | "bot" | "orchestrator" | "system";
    severity: "info" | "error" | "success" | "warning" | "critical";
    payload: {
        trigger_type: "GAS_SPIKE" | "MEV_RISK" | "REVERT_STREAK";
        threshold: string;
        action_taken: "PAUSE" | "COOLDOWN";
    };
    event_version?: string | undefined;
    user_id?: string | undefined;
    strategy_id?: string | undefined;
    bot_id?: string | undefined;
}>;
export declare const StrategyStateChangedSchema: z.ZodObject<{
    event_id: z.ZodString;
    event_version: z.ZodDefault<z.ZodString>;
    source: z.ZodEnum<["onchain", "agent", "bot", "orchestrator", "system"]>;
    timestamp: z.ZodObject<{
        iso: z.ZodString;
        unix_ms: z.ZodNumber;
        block_number: z.ZodOptional<z.ZodNumber>;
        tx_hash: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        iso: string;
        unix_ms: number;
        block_number?: number | undefined;
        tx_hash?: string | undefined;
    }, {
        iso: string;
        unix_ms: number;
        block_number?: number | undefined;
        tx_hash?: string | undefined;
    }>;
    user_id: z.ZodOptional<z.ZodString>;
    strategy_id: z.ZodOptional<z.ZodString>;
    bot_id: z.ZodOptional<z.ZodString>;
    severity: z.ZodEnum<["info", "success", "warning", "error", "critical"]>;
} & {
    event_type: z.ZodLiteral<"strategy.state.changed">;
    payload: z.ZodObject<{
        strategy_id: z.ZodString;
        previous_state: z.ZodEnum<["ACTIVE", "PAUSED", "COOLDOWN"]>;
        current_state: z.ZodEnum<["ACTIVE", "PAUSED", "COOLDOWN"]>;
        reason: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        strategy_id: string;
        reason: string;
        previous_state: "PAUSED" | "COOLDOWN" | "ACTIVE";
        current_state: "PAUSED" | "COOLDOWN" | "ACTIVE";
    }, {
        strategy_id: string;
        reason: string;
        previous_state: "PAUSED" | "COOLDOWN" | "ACTIVE";
        current_state: "PAUSED" | "COOLDOWN" | "ACTIVE";
    }>;
}, "strip", z.ZodTypeAny, {
    timestamp: {
        iso: string;
        unix_ms: number;
        block_number?: number | undefined;
        tx_hash?: string | undefined;
    };
    event_id: string;
    event_type: "strategy.state.changed";
    event_version: string;
    source: "onchain" | "agent" | "bot" | "orchestrator" | "system";
    severity: "info" | "error" | "success" | "warning" | "critical";
    payload: {
        strategy_id: string;
        reason: string;
        previous_state: "PAUSED" | "COOLDOWN" | "ACTIVE";
        current_state: "PAUSED" | "COOLDOWN" | "ACTIVE";
    };
    user_id?: string | undefined;
    strategy_id?: string | undefined;
    bot_id?: string | undefined;
}, {
    timestamp: {
        iso: string;
        unix_ms: number;
        block_number?: number | undefined;
        tx_hash?: string | undefined;
    };
    event_id: string;
    event_type: "strategy.state.changed";
    source: "onchain" | "agent" | "bot" | "orchestrator" | "system";
    severity: "info" | "error" | "success" | "warning" | "critical";
    payload: {
        strategy_id: string;
        reason: string;
        previous_state: "PAUSED" | "COOLDOWN" | "ACTIVE";
        current_state: "PAUSED" | "COOLDOWN" | "ACTIVE";
    };
    event_version?: string | undefined;
    user_id?: string | undefined;
    strategy_id?: string | undefined;
    bot_id?: string | undefined;
}>;
export declare const BotStateChangedSchema: z.ZodObject<{
    event_id: z.ZodString;
    event_version: z.ZodDefault<z.ZodString>;
    source: z.ZodEnum<["onchain", "agent", "bot", "orchestrator", "system"]>;
    timestamp: z.ZodObject<{
        iso: z.ZodString;
        unix_ms: z.ZodNumber;
        block_number: z.ZodOptional<z.ZodNumber>;
        tx_hash: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        iso: string;
        unix_ms: number;
        block_number?: number | undefined;
        tx_hash?: string | undefined;
    }, {
        iso: string;
        unix_ms: number;
        block_number?: number | undefined;
        tx_hash?: string | undefined;
    }>;
    user_id: z.ZodOptional<z.ZodString>;
    strategy_id: z.ZodOptional<z.ZodString>;
    bot_id: z.ZodOptional<z.ZodString>;
    severity: z.ZodEnum<["info", "success", "warning", "error", "critical"]>;
} & {
    event_type: z.ZodLiteral<"bot.state.changed">;
    payload: z.ZodObject<{
        bot_id: z.ZodString;
        previous_state: z.ZodEnum<["IDLE", "EXECUTING", "ERROR"]>;
        current_state: z.ZodEnum<["IDLE", "EXECUTING", "ERROR"]>;
        health_score: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        bot_id: string;
        previous_state: "IDLE" | "EXECUTING" | "ERROR";
        current_state: "IDLE" | "EXECUTING" | "ERROR";
        health_score: number;
    }, {
        bot_id: string;
        previous_state: "IDLE" | "EXECUTING" | "ERROR";
        current_state: "IDLE" | "EXECUTING" | "ERROR";
        health_score: number;
    }>;
}, "strip", z.ZodTypeAny, {
    timestamp: {
        iso: string;
        unix_ms: number;
        block_number?: number | undefined;
        tx_hash?: string | undefined;
    };
    event_id: string;
    event_type: "bot.state.changed";
    event_version: string;
    source: "onchain" | "agent" | "bot" | "orchestrator" | "system";
    severity: "info" | "error" | "success" | "warning" | "critical";
    payload: {
        bot_id: string;
        previous_state: "IDLE" | "EXECUTING" | "ERROR";
        current_state: "IDLE" | "EXECUTING" | "ERROR";
        health_score: number;
    };
    user_id?: string | undefined;
    strategy_id?: string | undefined;
    bot_id?: string | undefined;
}, {
    timestamp: {
        iso: string;
        unix_ms: number;
        block_number?: number | undefined;
        tx_hash?: string | undefined;
    };
    event_id: string;
    event_type: "bot.state.changed";
    source: "onchain" | "agent" | "bot" | "orchestrator" | "system";
    severity: "info" | "error" | "success" | "warning" | "critical";
    payload: {
        bot_id: string;
        previous_state: "IDLE" | "EXECUTING" | "ERROR";
        current_state: "IDLE" | "EXECUTING" | "ERROR";
        health_score: number;
    };
    event_version?: string | undefined;
    user_id?: string | undefined;
    strategy_id?: string | undefined;
    bot_id?: string | undefined;
}>;
export declare const ProfitRealizedSchema: z.ZodObject<{
    event_id: z.ZodString;
    event_version: z.ZodDefault<z.ZodString>;
    source: z.ZodEnum<["onchain", "agent", "bot", "orchestrator", "system"]>;
    timestamp: z.ZodObject<{
        iso: z.ZodString;
        unix_ms: z.ZodNumber;
        block_number: z.ZodOptional<z.ZodNumber>;
        tx_hash: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        iso: string;
        unix_ms: number;
        block_number?: number | undefined;
        tx_hash?: string | undefined;
    }, {
        iso: string;
        unix_ms: number;
        block_number?: number | undefined;
        tx_hash?: string | undefined;
    }>;
    user_id: z.ZodOptional<z.ZodString>;
    strategy_id: z.ZodOptional<z.ZodString>;
    bot_id: z.ZodOptional<z.ZodString>;
    severity: z.ZodEnum<["info", "success", "warning", "error", "critical"]>;
} & {
    event_type: z.ZodLiteral<"profit.realized">;
    payload: z.ZodObject<{
        execution_id: z.ZodString;
        gross_profit: z.ZodNumber;
        net_profit: z.ZodNumber;
        currency: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        execution_id: string;
        gross_profit: number;
        net_profit: number;
        currency: string;
    }, {
        execution_id: string;
        gross_profit: number;
        net_profit: number;
        currency: string;
    }>;
}, "strip", z.ZodTypeAny, {
    timestamp: {
        iso: string;
        unix_ms: number;
        block_number?: number | undefined;
        tx_hash?: string | undefined;
    };
    event_id: string;
    event_type: "profit.realized";
    event_version: string;
    source: "onchain" | "agent" | "bot" | "orchestrator" | "system";
    severity: "info" | "error" | "success" | "warning" | "critical";
    payload: {
        execution_id: string;
        gross_profit: number;
        net_profit: number;
        currency: string;
    };
    user_id?: string | undefined;
    strategy_id?: string | undefined;
    bot_id?: string | undefined;
}, {
    timestamp: {
        iso: string;
        unix_ms: number;
        block_number?: number | undefined;
        tx_hash?: string | undefined;
    };
    event_id: string;
    event_type: "profit.realized";
    source: "onchain" | "agent" | "bot" | "orchestrator" | "system";
    severity: "info" | "error" | "success" | "warning" | "critical";
    payload: {
        execution_id: string;
        gross_profit: number;
        net_profit: number;
        currency: string;
    };
    event_version?: string | undefined;
    user_id?: string | undefined;
    strategy_id?: string | undefined;
    bot_id?: string | undefined;
}>;
export type AtomEvent = z.infer<typeof SystemStatusChangedSchema> | z.infer<typeof OpportunityDetectedSchema> | z.infer<typeof SimulationStartedSchema> | z.infer<typeof SimulationCompletedSchema> | z.infer<typeof ExecutionSubmittedSchema> | z.infer<typeof ExecutionConfirmedSchema> | z.infer<typeof ExecutionRevertedSchema> | z.infer<typeof SafetyTriggeredSchema> | z.infer<typeof StrategyStateChangedSchema> | z.infer<typeof BotStateChangedSchema> | z.infer<typeof ProfitRealizedSchema>;
export declare const EVENT_SCHEMAS: {
    readonly "system.status.changed": z.ZodObject<{
        event_id: z.ZodString;
        event_version: z.ZodDefault<z.ZodString>;
        source: z.ZodEnum<["onchain", "agent", "bot", "orchestrator", "system"]>;
        timestamp: z.ZodObject<{
            iso: z.ZodString;
            unix_ms: z.ZodNumber;
            block_number: z.ZodOptional<z.ZodNumber>;
            tx_hash: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            iso: string;
            unix_ms: number;
            block_number?: number | undefined;
            tx_hash?: string | undefined;
        }, {
            iso: string;
            unix_ms: number;
            block_number?: number | undefined;
            tx_hash?: string | undefined;
        }>;
        user_id: z.ZodOptional<z.ZodString>;
        strategy_id: z.ZodOptional<z.ZodString>;
        bot_id: z.ZodOptional<z.ZodString>;
        severity: z.ZodEnum<["info", "success", "warning", "error", "critical"]>;
    } & {
        event_type: z.ZodLiteral<"system.status.changed">;
        payload: z.ZodObject<{
            previous_status: z.ZodEnum<["LIVE", "PAUSED", "DEGRADED", "PROTECTED"]>;
            current_status: z.ZodEnum<["LIVE", "PAUSED", "DEGRADED", "PROTECTED"]>;
            reason: z.ZodString;
            initiated_by: z.ZodEnum<["system", "human", "safety_rule"]>;
        }, "strip", z.ZodTypeAny, {
            previous_status: "LIVE" | "PAUSED" | "DEGRADED" | "PROTECTED";
            current_status: "LIVE" | "PAUSED" | "DEGRADED" | "PROTECTED";
            reason: string;
            initiated_by: "system" | "human" | "safety_rule";
        }, {
            previous_status: "LIVE" | "PAUSED" | "DEGRADED" | "PROTECTED";
            current_status: "LIVE" | "PAUSED" | "DEGRADED" | "PROTECTED";
            reason: string;
            initiated_by: "system" | "human" | "safety_rule";
        }>;
    }, "strip", z.ZodTypeAny, {
        timestamp: {
            iso: string;
            unix_ms: number;
            block_number?: number | undefined;
            tx_hash?: string | undefined;
        };
        event_id: string;
        event_type: "system.status.changed";
        event_version: string;
        source: "onchain" | "agent" | "bot" | "orchestrator" | "system";
        severity: "info" | "error" | "success" | "warning" | "critical";
        payload: {
            previous_status: "LIVE" | "PAUSED" | "DEGRADED" | "PROTECTED";
            current_status: "LIVE" | "PAUSED" | "DEGRADED" | "PROTECTED";
            reason: string;
            initiated_by: "system" | "human" | "safety_rule";
        };
        user_id?: string | undefined;
        strategy_id?: string | undefined;
        bot_id?: string | undefined;
    }, {
        timestamp: {
            iso: string;
            unix_ms: number;
            block_number?: number | undefined;
            tx_hash?: string | undefined;
        };
        event_id: string;
        event_type: "system.status.changed";
        source: "onchain" | "agent" | "bot" | "orchestrator" | "system";
        severity: "info" | "error" | "success" | "warning" | "critical";
        payload: {
            previous_status: "LIVE" | "PAUSED" | "DEGRADED" | "PROTECTED";
            current_status: "LIVE" | "PAUSED" | "DEGRADED" | "PROTECTED";
            reason: string;
            initiated_by: "system" | "human" | "safety_rule";
        };
        event_version?: string | undefined;
        user_id?: string | undefined;
        strategy_id?: string | undefined;
        bot_id?: string | undefined;
    }>;
    readonly "opportunity.detected": z.ZodObject<{
        event_id: z.ZodString;
        event_version: z.ZodDefault<z.ZodString>;
        source: z.ZodEnum<["onchain", "agent", "bot", "orchestrator", "system"]>;
        timestamp: z.ZodObject<{
            iso: z.ZodString;
            unix_ms: z.ZodNumber;
            block_number: z.ZodOptional<z.ZodNumber>;
            tx_hash: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            iso: string;
            unix_ms: number;
            block_number?: number | undefined;
            tx_hash?: string | undefined;
        }, {
            iso: string;
            unix_ms: number;
            block_number?: number | undefined;
            tx_hash?: string | undefined;
        }>;
        user_id: z.ZodOptional<z.ZodString>;
        strategy_id: z.ZodOptional<z.ZodString>;
        bot_id: z.ZodOptional<z.ZodString>;
        severity: z.ZodEnum<["info", "success", "warning", "error", "critical"]>;
    } & {
        event_type: z.ZodLiteral<"opportunity.detected">;
        payload: z.ZodObject<{
            opportunity_id: z.ZodString;
            chain: z.ZodEnum<["ethereum", "arbitrum", "base", "polygon"]>;
            dex_path: z.ZodArray<z.ZodString, "many">;
            asset_in: z.ZodString;
            asset_out: z.ZodString;
            spread_bps: z.ZodNumber;
            liquidity_estimate: z.ZodNumber;
            confidence_score: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            opportunity_id: string;
            chain: "ethereum" | "arbitrum" | "base" | "polygon";
            dex_path: string[];
            asset_in: string;
            asset_out: string;
            spread_bps: number;
            liquidity_estimate: number;
            confidence_score: number;
        }, {
            opportunity_id: string;
            chain: "ethereum" | "arbitrum" | "base" | "polygon";
            dex_path: string[];
            asset_in: string;
            asset_out: string;
            spread_bps: number;
            liquidity_estimate: number;
            confidence_score: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        timestamp: {
            iso: string;
            unix_ms: number;
            block_number?: number | undefined;
            tx_hash?: string | undefined;
        };
        event_id: string;
        event_type: "opportunity.detected";
        event_version: string;
        source: "onchain" | "agent" | "bot" | "orchestrator" | "system";
        severity: "info" | "error" | "success" | "warning" | "critical";
        payload: {
            opportunity_id: string;
            chain: "ethereum" | "arbitrum" | "base" | "polygon";
            dex_path: string[];
            asset_in: string;
            asset_out: string;
            spread_bps: number;
            liquidity_estimate: number;
            confidence_score: number;
        };
        user_id?: string | undefined;
        strategy_id?: string | undefined;
        bot_id?: string | undefined;
    }, {
        timestamp: {
            iso: string;
            unix_ms: number;
            block_number?: number | undefined;
            tx_hash?: string | undefined;
        };
        event_id: string;
        event_type: "opportunity.detected";
        source: "onchain" | "agent" | "bot" | "orchestrator" | "system";
        severity: "info" | "error" | "success" | "warning" | "critical";
        payload: {
            opportunity_id: string;
            chain: "ethereum" | "arbitrum" | "base" | "polygon";
            dex_path: string[];
            asset_in: string;
            asset_out: string;
            spread_bps: number;
            liquidity_estimate: number;
            confidence_score: number;
        };
        event_version?: string | undefined;
        user_id?: string | undefined;
        strategy_id?: string | undefined;
        bot_id?: string | undefined;
    }>;
    readonly "simulation.started": z.ZodObject<{
        event_id: z.ZodString;
        event_version: z.ZodDefault<z.ZodString>;
        source: z.ZodEnum<["onchain", "agent", "bot", "orchestrator", "system"]>;
        timestamp: z.ZodObject<{
            iso: z.ZodString;
            unix_ms: z.ZodNumber;
            block_number: z.ZodOptional<z.ZodNumber>;
            tx_hash: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            iso: string;
            unix_ms: number;
            block_number?: number | undefined;
            tx_hash?: string | undefined;
        }, {
            iso: string;
            unix_ms: number;
            block_number?: number | undefined;
            tx_hash?: string | undefined;
        }>;
        user_id: z.ZodOptional<z.ZodString>;
        strategy_id: z.ZodOptional<z.ZodString>;
        bot_id: z.ZodOptional<z.ZodString>;
        severity: z.ZodEnum<["info", "success", "warning", "error", "critical"]>;
    } & {
        event_type: z.ZodLiteral<"simulation.started">;
        payload: z.ZodObject<{
            opportunity_id: z.ZodString;
            strategy_parameters: z.ZodObject<{
                slippage: z.ZodNumber;
                gas_cap: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                slippage: number;
                gas_cap: number;
            }, {
                slippage: number;
                gas_cap: number;
            }>;
        }, "strip", z.ZodTypeAny, {
            opportunity_id: string;
            strategy_parameters: {
                slippage: number;
                gas_cap: number;
            };
        }, {
            opportunity_id: string;
            strategy_parameters: {
                slippage: number;
                gas_cap: number;
            };
        }>;
    }, "strip", z.ZodTypeAny, {
        timestamp: {
            iso: string;
            unix_ms: number;
            block_number?: number | undefined;
            tx_hash?: string | undefined;
        };
        event_id: string;
        event_type: "simulation.started";
        event_version: string;
        source: "onchain" | "agent" | "bot" | "orchestrator" | "system";
        severity: "info" | "error" | "success" | "warning" | "critical";
        payload: {
            opportunity_id: string;
            strategy_parameters: {
                slippage: number;
                gas_cap: number;
            };
        };
        user_id?: string | undefined;
        strategy_id?: string | undefined;
        bot_id?: string | undefined;
    }, {
        timestamp: {
            iso: string;
            unix_ms: number;
            block_number?: number | undefined;
            tx_hash?: string | undefined;
        };
        event_id: string;
        event_type: "simulation.started";
        source: "onchain" | "agent" | "bot" | "orchestrator" | "system";
        severity: "info" | "error" | "success" | "warning" | "critical";
        payload: {
            opportunity_id: string;
            strategy_parameters: {
                slippage: number;
                gas_cap: number;
            };
        };
        event_version?: string | undefined;
        user_id?: string | undefined;
        strategy_id?: string | undefined;
        bot_id?: string | undefined;
    }>;
    readonly "simulation.completed": z.ZodObject<{
        event_id: z.ZodString;
        event_version: z.ZodDefault<z.ZodString>;
        source: z.ZodEnum<["onchain", "agent", "bot", "orchestrator", "system"]>;
        timestamp: z.ZodObject<{
            iso: z.ZodString;
            unix_ms: z.ZodNumber;
            block_number: z.ZodOptional<z.ZodNumber>;
            tx_hash: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            iso: string;
            unix_ms: number;
            block_number?: number | undefined;
            tx_hash?: string | undefined;
        }, {
            iso: string;
            unix_ms: number;
            block_number?: number | undefined;
            tx_hash?: string | undefined;
        }>;
        user_id: z.ZodOptional<z.ZodString>;
        strategy_id: z.ZodOptional<z.ZodString>;
        bot_id: z.ZodOptional<z.ZodString>;
        severity: z.ZodEnum<["info", "success", "warning", "error", "critical"]>;
    } & {
        event_type: z.ZodLiteral<"simulation.completed">;
        payload: z.ZodObject<{
            opportunity_id: z.ZodString;
            expected_profit: z.ZodNumber;
            expected_gas: z.ZodNumber;
            expected_flash_fee: z.ZodNumber;
            net_expected_profit: z.ZodNumber;
            passes_constraints: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            opportunity_id: string;
            expected_profit: number;
            expected_gas: number;
            expected_flash_fee: number;
            net_expected_profit: number;
            passes_constraints: boolean;
        }, {
            opportunity_id: string;
            expected_profit: number;
            expected_gas: number;
            expected_flash_fee: number;
            net_expected_profit: number;
            passes_constraints: boolean;
        }>;
    }, "strip", z.ZodTypeAny, {
        timestamp: {
            iso: string;
            unix_ms: number;
            block_number?: number | undefined;
            tx_hash?: string | undefined;
        };
        event_id: string;
        event_type: "simulation.completed";
        event_version: string;
        source: "onchain" | "agent" | "bot" | "orchestrator" | "system";
        severity: "info" | "error" | "success" | "warning" | "critical";
        payload: {
            opportunity_id: string;
            expected_profit: number;
            expected_gas: number;
            expected_flash_fee: number;
            net_expected_profit: number;
            passes_constraints: boolean;
        };
        user_id?: string | undefined;
        strategy_id?: string | undefined;
        bot_id?: string | undefined;
    }, {
        timestamp: {
            iso: string;
            unix_ms: number;
            block_number?: number | undefined;
            tx_hash?: string | undefined;
        };
        event_id: string;
        event_type: "simulation.completed";
        source: "onchain" | "agent" | "bot" | "orchestrator" | "system";
        severity: "info" | "error" | "success" | "warning" | "critical";
        payload: {
            opportunity_id: string;
            expected_profit: number;
            expected_gas: number;
            expected_flash_fee: number;
            net_expected_profit: number;
            passes_constraints: boolean;
        };
        event_version?: string | undefined;
        user_id?: string | undefined;
        strategy_id?: string | undefined;
        bot_id?: string | undefined;
    }>;
    readonly "execution.submitted": z.ZodObject<{
        event_id: z.ZodString;
        event_version: z.ZodDefault<z.ZodString>;
        source: z.ZodEnum<["onchain", "agent", "bot", "orchestrator", "system"]>;
        timestamp: z.ZodObject<{
            iso: z.ZodString;
            unix_ms: z.ZodNumber;
            block_number: z.ZodOptional<z.ZodNumber>;
            tx_hash: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            iso: string;
            unix_ms: number;
            block_number?: number | undefined;
            tx_hash?: string | undefined;
        }, {
            iso: string;
            unix_ms: number;
            block_number?: number | undefined;
            tx_hash?: string | undefined;
        }>;
        user_id: z.ZodOptional<z.ZodString>;
        strategy_id: z.ZodOptional<z.ZodString>;
        bot_id: z.ZodOptional<z.ZodString>;
        severity: z.ZodEnum<["info", "success", "warning", "error", "critical"]>;
    } & {
        event_type: z.ZodLiteral<"execution.submitted">;
        payload: z.ZodObject<{
            opportunity_id: z.ZodString;
            execution_id: z.ZodString;
            flash_provider: z.ZodEnum<["AAVE", "UNISWAP", "BALANCER"]>;
            loan_amount: z.ZodNumber;
            asset: z.ZodString;
            gas_estimate: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            opportunity_id: string;
            execution_id: string;
            flash_provider: "AAVE" | "UNISWAP" | "BALANCER";
            loan_amount: number;
            asset: string;
            gas_estimate: number;
        }, {
            opportunity_id: string;
            execution_id: string;
            flash_provider: "AAVE" | "UNISWAP" | "BALANCER";
            loan_amount: number;
            asset: string;
            gas_estimate: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        timestamp: {
            iso: string;
            unix_ms: number;
            block_number?: number | undefined;
            tx_hash?: string | undefined;
        };
        event_id: string;
        event_type: "execution.submitted";
        event_version: string;
        source: "onchain" | "agent" | "bot" | "orchestrator" | "system";
        severity: "info" | "error" | "success" | "warning" | "critical";
        payload: {
            opportunity_id: string;
            execution_id: string;
            flash_provider: "AAVE" | "UNISWAP" | "BALANCER";
            loan_amount: number;
            asset: string;
            gas_estimate: number;
        };
        user_id?: string | undefined;
        strategy_id?: string | undefined;
        bot_id?: string | undefined;
    }, {
        timestamp: {
            iso: string;
            unix_ms: number;
            block_number?: number | undefined;
            tx_hash?: string | undefined;
        };
        event_id: string;
        event_type: "execution.submitted";
        source: "onchain" | "agent" | "bot" | "orchestrator" | "system";
        severity: "info" | "error" | "success" | "warning" | "critical";
        payload: {
            opportunity_id: string;
            execution_id: string;
            flash_provider: "AAVE" | "UNISWAP" | "BALANCER";
            loan_amount: number;
            asset: string;
            gas_estimate: number;
        };
        event_version?: string | undefined;
        user_id?: string | undefined;
        strategy_id?: string | undefined;
        bot_id?: string | undefined;
    }>;
    readonly "execution.confirmed": z.ZodObject<{
        event_id: z.ZodString;
        event_version: z.ZodDefault<z.ZodString>;
        source: z.ZodEnum<["onchain", "agent", "bot", "orchestrator", "system"]>;
        timestamp: z.ZodObject<{
            iso: z.ZodString;
            unix_ms: z.ZodNumber;
            block_number: z.ZodOptional<z.ZodNumber>;
            tx_hash: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            iso: string;
            unix_ms: number;
            block_number?: number | undefined;
            tx_hash?: string | undefined;
        }, {
            iso: string;
            unix_ms: number;
            block_number?: number | undefined;
            tx_hash?: string | undefined;
        }>;
        user_id: z.ZodOptional<z.ZodString>;
        strategy_id: z.ZodOptional<z.ZodString>;
        bot_id: z.ZodOptional<z.ZodString>;
        severity: z.ZodEnum<["info", "success", "warning", "error", "critical"]>;
    } & {
        event_type: z.ZodLiteral<"execution.confirmed">;
        payload: z.ZodObject<{
            execution_id: z.ZodString;
            actual_profit: z.ZodNumber;
            actual_gas: z.ZodNumber;
            fees: z.ZodObject<{
                flash: z.ZodNumber;
                protocol: z.ZodNumber;
                platform: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                flash: number;
                protocol: number;
                platform: number;
            }, {
                flash: number;
                protocol: number;
                platform: number;
            }>;
        }, "strip", z.ZodTypeAny, {
            execution_id: string;
            actual_profit: number;
            actual_gas: number;
            fees: {
                flash: number;
                protocol: number;
                platform: number;
            };
        }, {
            execution_id: string;
            actual_profit: number;
            actual_gas: number;
            fees: {
                flash: number;
                protocol: number;
                platform: number;
            };
        }>;
    }, "strip", z.ZodTypeAny, {
        timestamp: {
            iso: string;
            unix_ms: number;
            block_number?: number | undefined;
            tx_hash?: string | undefined;
        };
        event_id: string;
        event_type: "execution.confirmed";
        event_version: string;
        source: "onchain" | "agent" | "bot" | "orchestrator" | "system";
        severity: "info" | "error" | "success" | "warning" | "critical";
        payload: {
            execution_id: string;
            actual_profit: number;
            actual_gas: number;
            fees: {
                flash: number;
                protocol: number;
                platform: number;
            };
        };
        user_id?: string | undefined;
        strategy_id?: string | undefined;
        bot_id?: string | undefined;
    }, {
        timestamp: {
            iso: string;
            unix_ms: number;
            block_number?: number | undefined;
            tx_hash?: string | undefined;
        };
        event_id: string;
        event_type: "execution.confirmed";
        source: "onchain" | "agent" | "bot" | "orchestrator" | "system";
        severity: "info" | "error" | "success" | "warning" | "critical";
        payload: {
            execution_id: string;
            actual_profit: number;
            actual_gas: number;
            fees: {
                flash: number;
                protocol: number;
                platform: number;
            };
        };
        event_version?: string | undefined;
        user_id?: string | undefined;
        strategy_id?: string | undefined;
        bot_id?: string | undefined;
    }>;
    readonly "execution.reverted": z.ZodObject<{
        event_id: z.ZodString;
        event_version: z.ZodDefault<z.ZodString>;
        source: z.ZodEnum<["onchain", "agent", "bot", "orchestrator", "system"]>;
        timestamp: z.ZodObject<{
            iso: z.ZodString;
            unix_ms: z.ZodNumber;
            block_number: z.ZodOptional<z.ZodNumber>;
            tx_hash: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            iso: string;
            unix_ms: number;
            block_number?: number | undefined;
            tx_hash?: string | undefined;
        }, {
            iso: string;
            unix_ms: number;
            block_number?: number | undefined;
            tx_hash?: string | undefined;
        }>;
        user_id: z.ZodOptional<z.ZodString>;
        strategy_id: z.ZodOptional<z.ZodString>;
        bot_id: z.ZodOptional<z.ZodString>;
        severity: z.ZodEnum<["info", "success", "warning", "error", "critical"]>;
    } & {
        event_type: z.ZodLiteral<"execution.reverted">;
        payload: z.ZodObject<{
            execution_id: z.ZodString;
            revert_reason: z.ZodEnum<["SLIPPAGE_EXCEEDED", "GAS_SPIKE", "PROFIT_CHECK_FAILED"]>;
            gas_used: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            execution_id: string;
            revert_reason: "SLIPPAGE_EXCEEDED" | "GAS_SPIKE" | "PROFIT_CHECK_FAILED";
            gas_used: number;
        }, {
            execution_id: string;
            revert_reason: "SLIPPAGE_EXCEEDED" | "GAS_SPIKE" | "PROFIT_CHECK_FAILED";
            gas_used: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        timestamp: {
            iso: string;
            unix_ms: number;
            block_number?: number | undefined;
            tx_hash?: string | undefined;
        };
        event_id: string;
        event_type: "execution.reverted";
        event_version: string;
        source: "onchain" | "agent" | "bot" | "orchestrator" | "system";
        severity: "info" | "error" | "success" | "warning" | "critical";
        payload: {
            execution_id: string;
            revert_reason: "SLIPPAGE_EXCEEDED" | "GAS_SPIKE" | "PROFIT_CHECK_FAILED";
            gas_used: number;
        };
        user_id?: string | undefined;
        strategy_id?: string | undefined;
        bot_id?: string | undefined;
    }, {
        timestamp: {
            iso: string;
            unix_ms: number;
            block_number?: number | undefined;
            tx_hash?: string | undefined;
        };
        event_id: string;
        event_type: "execution.reverted";
        source: "onchain" | "agent" | "bot" | "orchestrator" | "system";
        severity: "info" | "error" | "success" | "warning" | "critical";
        payload: {
            execution_id: string;
            revert_reason: "SLIPPAGE_EXCEEDED" | "GAS_SPIKE" | "PROFIT_CHECK_FAILED";
            gas_used: number;
        };
        event_version?: string | undefined;
        user_id?: string | undefined;
        strategy_id?: string | undefined;
        bot_id?: string | undefined;
    }>;
    readonly "safety.triggered": z.ZodObject<{
        event_id: z.ZodString;
        event_version: z.ZodDefault<z.ZodString>;
        source: z.ZodEnum<["onchain", "agent", "bot", "orchestrator", "system"]>;
        timestamp: z.ZodObject<{
            iso: z.ZodString;
            unix_ms: z.ZodNumber;
            block_number: z.ZodOptional<z.ZodNumber>;
            tx_hash: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            iso: string;
            unix_ms: number;
            block_number?: number | undefined;
            tx_hash?: string | undefined;
        }, {
            iso: string;
            unix_ms: number;
            block_number?: number | undefined;
            tx_hash?: string | undefined;
        }>;
        user_id: z.ZodOptional<z.ZodString>;
        strategy_id: z.ZodOptional<z.ZodString>;
        bot_id: z.ZodOptional<z.ZodString>;
        severity: z.ZodEnum<["info", "success", "warning", "error", "critical"]>;
    } & {
        event_type: z.ZodLiteral<"safety.triggered">;
        payload: z.ZodObject<{
            trigger_type: z.ZodEnum<["GAS_SPIKE", "MEV_RISK", "REVERT_STREAK"]>;
            threshold: z.ZodString;
            action_taken: z.ZodEnum<["PAUSE", "COOLDOWN"]>;
        }, "strip", z.ZodTypeAny, {
            trigger_type: "GAS_SPIKE" | "MEV_RISK" | "REVERT_STREAK";
            threshold: string;
            action_taken: "PAUSE" | "COOLDOWN";
        }, {
            trigger_type: "GAS_SPIKE" | "MEV_RISK" | "REVERT_STREAK";
            threshold: string;
            action_taken: "PAUSE" | "COOLDOWN";
        }>;
    }, "strip", z.ZodTypeAny, {
        timestamp: {
            iso: string;
            unix_ms: number;
            block_number?: number | undefined;
            tx_hash?: string | undefined;
        };
        event_id: string;
        event_type: "safety.triggered";
        event_version: string;
        source: "onchain" | "agent" | "bot" | "orchestrator" | "system";
        severity: "info" | "error" | "success" | "warning" | "critical";
        payload: {
            trigger_type: "GAS_SPIKE" | "MEV_RISK" | "REVERT_STREAK";
            threshold: string;
            action_taken: "PAUSE" | "COOLDOWN";
        };
        user_id?: string | undefined;
        strategy_id?: string | undefined;
        bot_id?: string | undefined;
    }, {
        timestamp: {
            iso: string;
            unix_ms: number;
            block_number?: number | undefined;
            tx_hash?: string | undefined;
        };
        event_id: string;
        event_type: "safety.triggered";
        source: "onchain" | "agent" | "bot" | "orchestrator" | "system";
        severity: "info" | "error" | "success" | "warning" | "critical";
        payload: {
            trigger_type: "GAS_SPIKE" | "MEV_RISK" | "REVERT_STREAK";
            threshold: string;
            action_taken: "PAUSE" | "COOLDOWN";
        };
        event_version?: string | undefined;
        user_id?: string | undefined;
        strategy_id?: string | undefined;
        bot_id?: string | undefined;
    }>;
    readonly "strategy.state.changed": z.ZodObject<{
        event_id: z.ZodString;
        event_version: z.ZodDefault<z.ZodString>;
        source: z.ZodEnum<["onchain", "agent", "bot", "orchestrator", "system"]>;
        timestamp: z.ZodObject<{
            iso: z.ZodString;
            unix_ms: z.ZodNumber;
            block_number: z.ZodOptional<z.ZodNumber>;
            tx_hash: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            iso: string;
            unix_ms: number;
            block_number?: number | undefined;
            tx_hash?: string | undefined;
        }, {
            iso: string;
            unix_ms: number;
            block_number?: number | undefined;
            tx_hash?: string | undefined;
        }>;
        user_id: z.ZodOptional<z.ZodString>;
        strategy_id: z.ZodOptional<z.ZodString>;
        bot_id: z.ZodOptional<z.ZodString>;
        severity: z.ZodEnum<["info", "success", "warning", "error", "critical"]>;
    } & {
        event_type: z.ZodLiteral<"strategy.state.changed">;
        payload: z.ZodObject<{
            strategy_id: z.ZodString;
            previous_state: z.ZodEnum<["ACTIVE", "PAUSED", "COOLDOWN"]>;
            current_state: z.ZodEnum<["ACTIVE", "PAUSED", "COOLDOWN"]>;
            reason: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            strategy_id: string;
            reason: string;
            previous_state: "PAUSED" | "COOLDOWN" | "ACTIVE";
            current_state: "PAUSED" | "COOLDOWN" | "ACTIVE";
        }, {
            strategy_id: string;
            reason: string;
            previous_state: "PAUSED" | "COOLDOWN" | "ACTIVE";
            current_state: "PAUSED" | "COOLDOWN" | "ACTIVE";
        }>;
    }, "strip", z.ZodTypeAny, {
        timestamp: {
            iso: string;
            unix_ms: number;
            block_number?: number | undefined;
            tx_hash?: string | undefined;
        };
        event_id: string;
        event_type: "strategy.state.changed";
        event_version: string;
        source: "onchain" | "agent" | "bot" | "orchestrator" | "system";
        severity: "info" | "error" | "success" | "warning" | "critical";
        payload: {
            strategy_id: string;
            reason: string;
            previous_state: "PAUSED" | "COOLDOWN" | "ACTIVE";
            current_state: "PAUSED" | "COOLDOWN" | "ACTIVE";
        };
        user_id?: string | undefined;
        strategy_id?: string | undefined;
        bot_id?: string | undefined;
    }, {
        timestamp: {
            iso: string;
            unix_ms: number;
            block_number?: number | undefined;
            tx_hash?: string | undefined;
        };
        event_id: string;
        event_type: "strategy.state.changed";
        source: "onchain" | "agent" | "bot" | "orchestrator" | "system";
        severity: "info" | "error" | "success" | "warning" | "critical";
        payload: {
            strategy_id: string;
            reason: string;
            previous_state: "PAUSED" | "COOLDOWN" | "ACTIVE";
            current_state: "PAUSED" | "COOLDOWN" | "ACTIVE";
        };
        event_version?: string | undefined;
        user_id?: string | undefined;
        strategy_id?: string | undefined;
        bot_id?: string | undefined;
    }>;
    readonly "bot.state.changed": z.ZodObject<{
        event_id: z.ZodString;
        event_version: z.ZodDefault<z.ZodString>;
        source: z.ZodEnum<["onchain", "agent", "bot", "orchestrator", "system"]>;
        timestamp: z.ZodObject<{
            iso: z.ZodString;
            unix_ms: z.ZodNumber;
            block_number: z.ZodOptional<z.ZodNumber>;
            tx_hash: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            iso: string;
            unix_ms: number;
            block_number?: number | undefined;
            tx_hash?: string | undefined;
        }, {
            iso: string;
            unix_ms: number;
            block_number?: number | undefined;
            tx_hash?: string | undefined;
        }>;
        user_id: z.ZodOptional<z.ZodString>;
        strategy_id: z.ZodOptional<z.ZodString>;
        bot_id: z.ZodOptional<z.ZodString>;
        severity: z.ZodEnum<["info", "success", "warning", "error", "critical"]>;
    } & {
        event_type: z.ZodLiteral<"bot.state.changed">;
        payload: z.ZodObject<{
            bot_id: z.ZodString;
            previous_state: z.ZodEnum<["IDLE", "EXECUTING", "ERROR"]>;
            current_state: z.ZodEnum<["IDLE", "EXECUTING", "ERROR"]>;
            health_score: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            bot_id: string;
            previous_state: "IDLE" | "EXECUTING" | "ERROR";
            current_state: "IDLE" | "EXECUTING" | "ERROR";
            health_score: number;
        }, {
            bot_id: string;
            previous_state: "IDLE" | "EXECUTING" | "ERROR";
            current_state: "IDLE" | "EXECUTING" | "ERROR";
            health_score: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        timestamp: {
            iso: string;
            unix_ms: number;
            block_number?: number | undefined;
            tx_hash?: string | undefined;
        };
        event_id: string;
        event_type: "bot.state.changed";
        event_version: string;
        source: "onchain" | "agent" | "bot" | "orchestrator" | "system";
        severity: "info" | "error" | "success" | "warning" | "critical";
        payload: {
            bot_id: string;
            previous_state: "IDLE" | "EXECUTING" | "ERROR";
            current_state: "IDLE" | "EXECUTING" | "ERROR";
            health_score: number;
        };
        user_id?: string | undefined;
        strategy_id?: string | undefined;
        bot_id?: string | undefined;
    }, {
        timestamp: {
            iso: string;
            unix_ms: number;
            block_number?: number | undefined;
            tx_hash?: string | undefined;
        };
        event_id: string;
        event_type: "bot.state.changed";
        source: "onchain" | "agent" | "bot" | "orchestrator" | "system";
        severity: "info" | "error" | "success" | "warning" | "critical";
        payload: {
            bot_id: string;
            previous_state: "IDLE" | "EXECUTING" | "ERROR";
            current_state: "IDLE" | "EXECUTING" | "ERROR";
            health_score: number;
        };
        event_version?: string | undefined;
        user_id?: string | undefined;
        strategy_id?: string | undefined;
        bot_id?: string | undefined;
    }>;
    readonly "profit.realized": z.ZodObject<{
        event_id: z.ZodString;
        event_version: z.ZodDefault<z.ZodString>;
        source: z.ZodEnum<["onchain", "agent", "bot", "orchestrator", "system"]>;
        timestamp: z.ZodObject<{
            iso: z.ZodString;
            unix_ms: z.ZodNumber;
            block_number: z.ZodOptional<z.ZodNumber>;
            tx_hash: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            iso: string;
            unix_ms: number;
            block_number?: number | undefined;
            tx_hash?: string | undefined;
        }, {
            iso: string;
            unix_ms: number;
            block_number?: number | undefined;
            tx_hash?: string | undefined;
        }>;
        user_id: z.ZodOptional<z.ZodString>;
        strategy_id: z.ZodOptional<z.ZodString>;
        bot_id: z.ZodOptional<z.ZodString>;
        severity: z.ZodEnum<["info", "success", "warning", "error", "critical"]>;
    } & {
        event_type: z.ZodLiteral<"profit.realized">;
        payload: z.ZodObject<{
            execution_id: z.ZodString;
            gross_profit: z.ZodNumber;
            net_profit: z.ZodNumber;
            currency: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            execution_id: string;
            gross_profit: number;
            net_profit: number;
            currency: string;
        }, {
            execution_id: string;
            gross_profit: number;
            net_profit: number;
            currency: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        timestamp: {
            iso: string;
            unix_ms: number;
            block_number?: number | undefined;
            tx_hash?: string | undefined;
        };
        event_id: string;
        event_type: "profit.realized";
        event_version: string;
        source: "onchain" | "agent" | "bot" | "orchestrator" | "system";
        severity: "info" | "error" | "success" | "warning" | "critical";
        payload: {
            execution_id: string;
            gross_profit: number;
            net_profit: number;
            currency: string;
        };
        user_id?: string | undefined;
        strategy_id?: string | undefined;
        bot_id?: string | undefined;
    }, {
        timestamp: {
            iso: string;
            unix_ms: number;
            block_number?: number | undefined;
            tx_hash?: string | undefined;
        };
        event_id: string;
        event_type: "profit.realized";
        source: "onchain" | "agent" | "bot" | "orchestrator" | "system";
        severity: "info" | "error" | "success" | "warning" | "critical";
        payload: {
            execution_id: string;
            gross_profit: number;
            net_profit: number;
            currency: string;
        };
        event_version?: string | undefined;
        user_id?: string | undefined;
        strategy_id?: string | undefined;
        bot_id?: string | undefined;
    }>;
};
export type EventType = keyof typeof EVENT_SCHEMAS;
//# sourceMappingURL=event-schema.d.ts.map