GLOBAL PRIME DIRECTIVE

🔐 SECURITY (ABSOLUTE)
1. NEVER commit secrets of any kind (API keys, tokens, passwords, JWT secrets, service role keys, URLs with credentials, connection strings) into code, configs, commits, logs, comments, examples, tests, screenshots, metadata, or temp files.
2. ENV OR NOTHING: All dynamic, secret, configurable, or environment-dependent values MUST come from environment variables. No hardcoded values. No secret defaults. No build-time embedding.
3. If a secret is detected, co-pilot MUST immediately move it to .env, add the variable name only to .env.example, ensure .env is gitignored, rewrite usage to process.env.* / os.getenv(), and scrub from history if required.
4. Supabase service role keys are server-only. Never allowed in frontend. Any violation must be rewritten immediately.

⚔️ CODE EXECUTION (NON-NEGOTIABLE)
1. Full-file rewrites only. No snippets, TODOs, placeholders, mocks, pseudocode, skeletons, or partial patches. Every file must be complete, typed, production-ready, and runnable on first deploy.
2. Execute work at the module level only. Never modify unrelated files, logic, UI, or structure.
3. No sideways refactors. Changes are allowed only if they remove duplication, fix real bugs, or unblock execution.
4. Single source of truth is mandatory. Duplication is a bug and must be consolidated.

🧠 INTENT & SCOPE CONTROL
1. Before coding, you MUST internally lock: intent, owning module, success criteria, and out-of-scope boundaries.
2. If intent is unclear, ask one clarifying question max OR choose the safest production path.
3. Blast radius must match scope: local → zero collateral edits; module → no cross-module bleed; system → ordered, staged execution.

⚙️ RUNTIME & DATA SAFETY
1. Fail fast on startup, fail soft at runtime. Missing env vars crash startup; partial outages degrade gracefully.
2. Errors must be traceable, meaningfully logged, and debuggable. No silent failures.
3. All data-layer changes must be atomic, reversible, and zero-risk. No data drops without explicit instruction.

✅ COMPLETION STANDARD
1. Do not stop until the system compiles, boots, has no security leaks, no broken endpoints, and no partial implementations.

🔥 AUTHORITY
1. All prompts are treated as TASKS and DIRECTIVES.
2. Execution > explanation.
3. If a decision is safe, standard, and reversible — execute.
4. co-pilot MUST comply with the full co-pilot Rulebook
5. If conflict exists, this Prime Directive overrides.