'use client'

export default function HowItWorks(){
  return (
    <main className="mx-auto max-w-5xl px-6 py-16 text-white">
      <h1 className="text-3xl font-bold mb-6">How It Works</h1>

      <div className="space-y-6 text-zinc-300">
        <div>
          <h2 className="text-xl font-semibold text-white">1) Market Scan & Signal Detection</h2>
          <p>Autonomous agents continuously scan DEX quotes, pools and mempools across chains to spot price dislocations and slippage‑heavy trades that can be safely captured.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">2) Validation & Risk Gating</h2>
          <p>Each candidate route is validated with AMM invariants (Curve/Balancer math), expected gas costs, and ROI‑after‑gas checks. Circuit breakers and MEV‑guard rules filter unsafe routes.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">3) Flash‑Loan Execution & Routing</h2>
          <p>When a route passes checks, the system borrows via flash loan, executes the atomic multi‑DEX swaps, repays the loan within the same transaction, and locks slippage.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">4) Settlement, Metrics & Audit Trail</h2>
          <p>Profits are realized on‑chain, positions are cleared, and detailed metrics are pushed to the dashboard. Every run is logged for auditability and post‑trade analysis.</p>
        </div>
      </div>
    </main>
  )
} 