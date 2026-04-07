# HealthPilot Demo Script (~90 seconds)

---

## SCENE 1: Introduction (10s)

_[Host on camera, HealthPilot UI visible]_

**HOST:**
"Meet HealthPilot — a secure AI health agent. The difference? Zero credential exposure, explicit consent on every action, and document-level access control."

---

## SCENE 2: Credentials Never Touched (20s)

_[Host types: "Show me my prescriptions"]_

**HOST:**
"Ask about prescriptions. Agent accesses CVS through Auth0 Token Vault — credentials never leave the vault."

_[UI shows prescription list appears]_

"Notice: no API keys in code. Short-lived tokens only."

---

## SCENE 3: CIBA Approval (25s)

_[Host types: "Refill my Lisinopril"]_

**HOST:**
"Now the consequential part — refill request."

_[Phone notification appears on screen]_

"This went to my phone. CIBA requires explicit approval. Agent can't proceed without it."

_[Simulate approval tap]_

"Approved. Only now does the action complete."

---

## SCENE 4: FGA Document Filtering (20s)

_[Host types: "Show my cardiac records"]_

**HOST:**
"Records via MyChart. But here's the key — FGA checks permissions before the LLM sees anything."

_[(Show schematic: query → FGA check → filtered results → LLM)]_

"Retrieval-layer filtering. Model can't hallucinate from unauthorized data."

---

## SCENE 5: Closing (15s)

_[Host on camera]_

"Token Vault for credentials. CIBA for consent. FGA for access control."

"That's what production-ready healthcare AI looks like."

_[Beat]_

"Questions?"

---

## PRODUCTION NOTES

- Live demo only — no fake UI
- Show real phone CIBA notification if possible
- Keep each section punchy, under 25s each
- End on the security value proposition
