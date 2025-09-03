'use client'

export default function SecurityPage(){
  return (
    <main className="mx-auto max-w-5xl px-6 py-16 text-white">
      <h1 className="text-3xl font-bold mb-4">Security</h1>
      <ul className="list-disc pl-6 space-y-2 text-zinc-300">
        <li>JWT authentication and IP-allowlisted health checks</li>
        <li>Redis with credentials; circuit breakers and retries</li>
        <li>MEV-guard strategies and execution audits</li>
      </ul>
    </main>
  )
} 