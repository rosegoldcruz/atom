'use client'

export default function PricingPage(){
  return (
    <main className="mx-auto max-w-5xl px-6 py-16 text-white">
      <h1 className="text-3xl font-bold mb-8">Pricing</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {t:'Starter',p:'$0/mo',d:'Sandbox access, delayed data'},
          {t:'Pro',p:'$99/mo',d:'Real-time agents, email support'},
          {t:'Enterprise',p:'Contact',d:'SLAs, custom integrations'},
        ].map((x)=> (
          <div key={x.t} className="rounded-xl border border-white/10 p-6 bg-white/5">
            <h3 className="text-xl font-bold">{x.t}</h3>
            <div className="text-3xl mt-2">{x.p}</div>
            <p className="text-zinc-300 mt-2">{x.d}</p>
          </div>
        ))}
      </div>
    </main>
  )
} 