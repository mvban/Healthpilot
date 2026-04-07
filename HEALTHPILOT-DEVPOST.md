# HealthPilot: Secure AI Health Agent

## A DevPost Hackathon Submission

---

## The Problem

Healthcare is the highest-stakes domain for AI agents. A coding assistant that hallucinates is annoying. An AI health agent that leaks your lab results to the wrong person, requests a prescription refill without your knowledge, or shares your cardiac records with an unauthorized provider is a HIPAA violation, a safety incident, and a trust catastrophe all at once.

We kept seeing the same pattern in AI agent demos:

- Credentials hardcoded in `.env` files
- No user consent before irreversible actions
- RAG pipelines that blindly feed every document to the LLM regardless of who's asking

These aren't edge cases. They're the default.

## The Solution

What does a production-ready AI agent look like when you take security as seriously as capability?

The answer turned out to be **Auth0 for AI Agents** as the actual architecture.

- **Token Vault** meant our agent could coordinate across Epic, CVS Pharmacy, and Cigna Insurance without ever touching a credential
- **CIBA** meant a patient's phone had to be physically approved before a refill was requested
- **FGA** meant the LLM was structurally incapable of reading another patient's records

**HealthPilot** is a secure AI health agent that coordinates a patient's care across multiple healthcare systems, hospital portals, pharmacies, and insurance providers using natural language. Every Auth0 for AI Agents feature is exercised with genuine, high-stakes justification.

---

## What It Does

### 1. Token Vault · Coordinates Across Real External Systems, Never Touching a Credential

The patient connects MyChart (Epic), CVS Pharmacy, and Cigna Insurance once. The agent accesses each using short-lived, user-scoped OAuth tokens managed by Auth0 Token Vault.

```
Three separate vault entries — a breach of one pharmacy token does not compromise insurance tokens.
```

### 2. CIBA · Rich Authorization Requests Requires Explicit Approval

When the agent decides a prescription refill is needed, or wants to book a cardiology appointment, or is about to share records with a new provider, it stops. It sends a CIBA request to the patient's device with a RAR payload showing exactly what is being done and why.

```json
{
  "action": "refill_prescription",
  "medication": "Lisinopril 10mg",
  "pharmacy": "CVS Pharmacy - Main St",
  "refills_remaining": 2
}
```

The agent cannot proceed until the patient approves from their phone.

### 3. Auth0 FGA · Retrieval-Layer Filtering

Auth0 Fine-Grained Authorization checks every document against the patient's permission tuples before passing anything to the LLM.

Not prompt-level filtering — retrieval-layer filtering. The model is structurally incapable of generating a response using data the patient isn't authorized to see.

---

## Technical Architecture

### Stack

- **Frontend**: Next.js 15, Tailwind CSS
- **AI**: LangGraph.js, LangChain.js, OpenAI GPT-4o-mini
- **Auth**: Auth0 for AI Agents (Token Vault, CIBA, FGA)
- **Database**: PostgreSQL with Drizzle ORM

### Key Features Implemented

1. **Token Vault Connections** (`src/lib/auth0-ai.ts`)
   - `withMyChart()` - Epic MyChart EHR access
   - `withCVSPharmacy()` - Prescription management
   - `withCignaInsurance()` - Claims and coverage

2. **CIBA Authorization** (`src/lib/auth0-ai.ts`)
   - `withAsyncAuthorization()` wrapper for consequential actions
   - Rich Authorization Request (RAR) payloads
   - Interrupt handling with phone-based approval

3. **FGA-Enabled RAG** (`src/lib/tools/health-docs.ts`)
   - Document-level access control
   - Retrieval-layer filtering before LLM context
   - HIPAA-compliant document permissions

4. **Healthcare Tools** (`src/lib/tools/`)
   - `mychart.ts` - Medical records, appointments
   - `cvs-pharmacy.ts` - Prescriptions, refills, pharmacy finder
   - `cigna-insurance.ts` - Claims, coverage, eligibility
   - `health-docs.ts` - FGA-filtered health documents

---

## Security Model

| Feature           | Protection                                                   |
| ----------------- | ------------------------------------------------------------ |
| **Token Vault**   | Credentials never leave Auth0; short-lived OAuth tokens only |
| **CIBA**          | Patient must physically approve every refill/appointment     |
| **FGA**           | Model cannot access unauthorized documents at any layer      |
| **RAG Filtering** | Retrieval-layer rejection before LLM sees content            |

---

## Demo Scenarios

1. **"Do I have any prescriptions that need refilling?"**
   - Agent retrieves prescriptions from CVS
   - Shows which need refills
   - If user asks to refill → CIBA approval required

2. **"Book me a cardiology appointment"**
   - Agent collects specialty, date, reason
   - Sends CIBA request to phone
   - Only proceeds after explicit approval

3. **"What were my last lab results?"**
   - Agent retrieves from MyChart via Token Vault
   - FGA verifies document permissions
   - Returns only authorized results

4. **"What's my deductible?"**
   - Agent queries Cigna via Token Vault
   - Displays coverage details
   - No credentials exposed

---

## Why This Matters

This is what responsible AI agents should look like.

The difference between a flashy demo and a production-ready system isn't capability — it's security architecture that treats healthcare data like what it is: someone's life, depending on you getting it right.

**HealthPilot** demonstrates that with the right security primitives, AI agents can genuinely help patients without compromising their most sensitive information.

---

## Future Directions

- Real FHIR API integration for MyChart
- Multi-provider record sharing with granular consent
- Insurance prior authorization automation
  -Voice-based CIBA approval
- Audit logging for HIPAA compliance

---

## Try It Out

The agent is ready to handle real healthcare queries:

- Medical record lookups
- Prescription management
- Insurance inquiries
- Appointment scheduling (with proper authorization)

Every consequential action requires your explicit approval. That's not a limitation — it's the point.

---

_Built with Auth0 for AI Agents, LangGraph.js, and Next.js_
