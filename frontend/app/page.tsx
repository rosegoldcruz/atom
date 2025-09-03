'use client'

import FoxHero from './components/FoxHero'
import AitechSections from './components/AitechSections'
import FirstVisitLoader from './components/FirstVisitLoader'

export default function Page(){
  return (
    <FirstVisitLoader>
      <main className="bg-black min-h-screen">
        {/* Hero */}
        <section className="relative pt-24 pb-10 text-center">
          <h1 className="mx-auto max-w-3xl text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Advanced Efficient Optimized Network
          </h1>
          <p className="mt-4 mx-auto max-w-2xl text-zinc-300">
            Zero-capital DeFi arbitrage powered by AI agents, flash loans and risk controls.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <a href="https://dashboard.smart4technology.com" className="rounded-md bg-blue-600 px-5 py-2.5 text-white font-semibold hover:bg-blue-500">Go to Dashboard</a>
            <a href="#learn" className="rounded-md border border-white/20 px-5 py-2.5 text-white/90 hover:bg-white/10">Learn More</a>
          </div>
        </section>

        {/* Fox hero with cursor-reactive head */}
        <FoxHero src="/33f.png" />

        {/* Features */}
        <section id="learn" className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Zero-Capital Arbitrage</h3>
              <p className="text-zinc-400">Execute flash-loan based arbitrage without upfront capital and with strict ROI gates.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Agent-Driven</h3>
              <p className="text-zinc-400">Autonomous agents scan, validate and route trades across chains and DEXs.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Enterprise Security</h3>
              <p className="text-zinc-400">Circuit breakers, MEV-guard strategies, and audited execution paths.</p>
            </div>
          </div>
        </section>

        {/* Social proof / stats */}
        <section className="mx-auto max-w-7xl px-6 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="rounded-xl border border-white/10 p-6 bg-white/5">
              <div className="text-3xl font-bold text-white">5+</div>
              <div className="text-zinc-400">Live Agents</div>
            </div>
            <div className="rounded-xl border border-white/10 p-6 bg-white/5">
              <div className="text-3xl font-bold text-white">50ms</div>
              <div className="text-zinc-400">Signal Latency</div>
            </div>
            <div className="rounded-xl border border-white/10 p-6 bg-white/5">
              <div className="text-3xl font-bold text-white">24/7</div>
              <div className="text-zinc-400">Monitoring</div>
            </div>
            <div className="rounded-xl border border-white/10 p-6 bg-white/5">
              <div className="text-3xl font-bold text-white">$0</div>
              <div className="text-zinc-400">Upfront Capital</div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-5xl px-6 pb-20 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Ready to deploy zero-capital arbitrage?</h2>
          <div className="mt-5 flex justify-center gap-3">
            <a href="https://dashboard.smart4technology.com" className="rounded-md bg-blue-600 px-5 py-2.5 text-white font-semibold hover:bg-blue-500">Login to Dashboard</a>
            <a href="/register" className="rounded-md border border-white/20 px-5 py-2.5 text-white/90 hover:bg-white/10">Create Account</a>
          </div>
        </section>
      </main>
    </FirstVisitLoader>
  )
}
