# HealthPilot: What Responsible AI Healthcare Actually Looks Like

_A secure AI health agent that proves security and capability aren't mutually exclusive_

---

The healthcare AI demos we've all seen are impressive — until you look under the hood. Credentials in `.env` files. No consent flow before prescription refills. RAG pipelines that dump every document to the LLM regardless of who's asking.

Then someone asks: _What happens when this agent leaks your cardiac records to the wrong person?_

That's not a hypothetical. In healthcare, that's a HIPAA violation, a safety incident, and a trust catastrophe wrapped in one.

We built **HealthPilot** to answer a simpler question: _What does a production-ready AI health agent actually look like when you take security as seriously as capability?_

The answer turned out to be three Auth0 features, used exactly as intended.

## The Architecture: Token Vault, CIBA, and FGA

HealthPilot coordinates a patient's care across three healthcare systems: MyChart (Epic), CVS Pharmacy, and Cigna Insurance. Every Auth0 for AI Agents feature is exercised with genuine, high-stakes justification.

**Token Vault** handles the credential problem. The patient connects each provider once through Auth0. The agent never sees passwords, API keys, or refresh tokens. Instead, it receives short-lived OAuth tokens managed by the vault — scoped to exactly what the patient authorized, expiring automatically.

This matters because a breach of one token doesn't cascade. The CVS Pharmacy token is separate from the Cigna token. If an attacker compromises one, they get exactly one system's access — not everything.

**CIBA** handles the consent problem. Every consequential action — prescription refills, appointment bookings, record sharing — triggers a human-in-the-loop approval. The agent prepares the request, shows the patient exactly what's happening and why via Rich Authorization Requests, then waits. The patient's phone receives a notification. Only after explicit approval does the action proceed.

This isn't a confirmation dialog in a chat window. It's a separate device authentication — the same way your bank approves transfers.

**Auth0 FGA** handles the access control problem. In traditional RAG pipelines, the retriever fetches documents, then passes them to the LLM. But by that point, the model already has unauthorized data. FGA checks permissions at retrieval time — not after.

Every document in HealthPilot's health knowledge base carries permission tuples. The FGARetriever checks `user:X can_view document:Y` before the document ever reaches the model. This is retrieval-layer filtering, not prompt-level guardrails. The model is structurally incapable of generating a response using data the patient isn't authorized to see.

## What HealthPilot Actually Does

The agent handles real healthcare queries:

- **"Show me my prescriptions"** → Retrieves from CVS via Token Vault, filtered by patient
- **"Refill my Lisinopril"** → CIBA approval required, then refill processes
- **"Book a cardiology appointment"** → Collects specialty, date, reason → CIBA → booking confirmed
- **"What's my deductible?"** → Queries Cigna via Token Vault, displays coverage
- **"Show my cardiac records"** → MyChart retrieval → FGA permission check → authorized results only

Each action respects the security boundary. Credentials never touch agent code. Consequential actions require explicit device approval. Documents the patient can't see never reach the model.

## Why This Matters

The difference between a flashy demo and a production system isn't model capability — it's security architecture.

HealthPilot isn't a conceptual exercise. It's a working agent that demonstrates how to build AI healthcare tools that don't expose patients to unnecessary risk. Token Vault eliminates credential handling. CIBA ensures human oversight on sensitive actions. FGA enforces access control at the data layer.

These aren't add-ons or bolt-on security. They're foundational primitives that change what the agent is structurally capable of doing.

An agent with Token Vault cannot leak credentials — it never has them. An agent with CIBA cannot refill prescriptions without approval — the flow blocks it. An agent with FGA cannot hallucinate from unauthorized documents — the data never reaches the model.

This is what responsible AI healthcare looks like. Not because we added guardrails — because we built the architecture right from the start.

---

## The Takeaway

Healthcare is the highest-stakes domain for AI. When your AI assistant hallucinates function names, it's annoying. When it leaks lab results, requests a refill without permission, or shares records with an unauthorized provider, it's a compliance violation and a trust failure.

The tools to build secure AI health agents exist. Token Vault, CIBA, and FGA aren't experimental features — they're production-ready primitives that solve exactly these problems.

HealthPilot is one example of using them correctly. The question isn't whether security and AI healthcare can coexist — it's whether we bothered to connect the dots.

We did.

---

_HealthPilot is built with Auth0 for AI Agents, LangGraph.js, and Next.js. Try the live demo to see secure healthcare AI in action._
