'use client'

export default function FeaturesPage(){
  return (
    <main className="mx-auto max-w-5xl px-6 py-16 text-white">
      <h1 className="text-3xl font-bold mb-4">Features & Services</h1>
      <ul className="list-disc pl-6 space-y-2 text-zinc-300">
        <li>MEV-aware execution guard</li>
        <li>Volatility scanner</li>
        <li>Triangular arbitrage</li>
        <li>Stablecoin monitor</li>
        <li>Liquidity mining analysis</li>
      </ul>
    </main>
  )
} 