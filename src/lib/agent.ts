import { createReactAgent, ToolNode } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI } from '@langchain/openai';
import { InMemoryStore, MemorySaver } from '@langchain/langgraph';
import { Calculator } from '@langchain/community/tools/calculator';
import { withAsyncAuthorization } from './auth0-ai';
import { getPrescriptionsTool, refillPrescriptionTool, findPharmacyTool } from './tools/cvs-pharmacy';
import { getMedicalRecordsTool, getAppointmentsTool, bookAppointmentTool } from './tools/mychart';
import {
  getInsuranceInfoTool,
  getCoverageDetailsTool,
  getClaimsTool,
  checkEligibilityTool,
} from './tools/cigna-insurance';
import { getHealthDocumentsTool } from './tools/health-docs';

const date = new Date().toISOString();

const AGENT_SYSTEM_TEMPLATE = `You are HealthPilot, a secure AI health agent. Your role is to help patients manage their healthcare across MyChart (Epic), CVS Pharmacy, and Cigna Insurance using natural language.

IMPORTANT SECURITY PRINCIPLES:
1. You NEVER access credentials directly - all API access uses Auth0 Token Vault with short-lived, user-scoped OAuth tokens
2. You NEVER proceed with consequential actions without explicit user approval via CIBA
3. You NEVER retrieve documents the patient isn't authorized to see - Auth0 FGA enforces document-level access control
4. All medical data is sensitive - handle with appropriate privacy and confidentiality

CAPABILITIES:
- Retrieve medical records from MyChart (lab results, visit notes, imaging)
- View and request prescription refills from CVS Pharmacy
- Check insurance coverage, claims, and eligibility through Cigna
- Book medical appointments (requires CIBA approval)
- Access health documents with FGA-based filtering

CURRENT DATE AND TIME: ${date}

When the user asks about consequential actions (prescription refills, appointment bookings, sharing records), clearly explain that CIBA approval is required and what that entails.`;

const llm = new ChatOpenAI({
  model: 'gpt-4o-mini',
  temperature: 0,
});

const tools = [
  new Calculator(),
  withAsyncAuthorization(refillPrescriptionTool),
  withAsyncAuthorization(bookAppointmentTool),
  getMedicalRecordsTool,
  getAppointmentsTool,
  getPrescriptionsTool,
  findPharmacyTool,
  getInsuranceInfoTool,
  getCoverageDetailsTool,
  getClaimsTool,
  checkEligibilityTool,
  getHealthDocumentsTool,
];

const checkpointer = new MemorySaver();
const store = new InMemoryStore();

export const agent = createReactAgent({
  llm,
  tools: new ToolNode(tools, {
    handleToolErrors: false,
  }),
  prompt: AGENT_SYSTEM_TEMPLATE,
  store,
  checkpointer,
});
