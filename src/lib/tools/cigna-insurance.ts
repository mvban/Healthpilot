import { tool } from '@langchain/core/tools';
import { z } from 'zod';

const mockInsurance = {
  memberId: 'CIG-123456789',
  planType: 'PPO Gold Plan',
  effectiveDate: '2024-01-01',
  status: 'Active',
  groupNumber: 'GRP-987654',
  employer: 'Acme Corporation',
};

const mockCoverage = {
  medical: {
    deductible: 1500,
    deductibleMet: 850,
    outOfPocketMax: 6000,
    outOfPocketMet: 1200,
    coinsurance: '20%',
    copay: {
      primaryCare: 25,
      specialist: 50,
      urgentCare: 75,
      emergencyRoom: 250,
    },
  },
  prescription: {
    tier1: 10,
    tier2: 35,
    tier3: 60,
    tier4: 100,
  },
};

const mockClaims = [
  {
    id: 'CLM-001',
    date: '2024-03-15',
    provider: 'Mayo Clinic',
    service: 'Lab Work - Complete Blood Count',
    amount: 285.0,
    covered: 228.0,
    youOwe: 57.0,
    status: 'Processed',
    appliedToDeductible: 57.0,
  },
  {
    id: 'CLM-002',
    date: '2024-02-28',
    provider: 'Mayo Clinic',
    service: 'Office Visit - Primary Care',
    amount: 175.0,
    covered: 150.0,
    youOwe: 25.0,
    status: 'Processed',
    appliedToDeductible: 25.0,
  },
  {
    id: 'CLM-003',
    date: '2024-02-10',
    provider: 'CVS Pharmacy',
    service: 'Prescription - Lisinopril 10mg',
    amount: 15.0,
    covered: 13.5,
    youOwe: 1.5,
    status: 'Processed',
    appliedToDeductible: 0,
  },
  {
    id: 'CLM-004',
    date: '2024-01-20',
    provider: 'Mayo Clinic - Emergency',
    service: 'Emergency Room Visit',
    amount: 1250.0,
    covered: 800.0,
    youOwe: 450.0,
    status: 'Processed',
    appliedToDeductible: 450.0,
  },
];

export const getInsuranceInfoTool = tool(
  async (_, config) => {
    const user = config?.configurable?._credentials?.user;
    if (!user) {
      return 'No authenticated user. Please log in.';
    }

    return `Insurance Information:\n- Member ID: ${mockInsurance.memberId}\n- Plan Type: ${mockInsurance.planType}\n- Status: ${mockInsurance.status}\n- Effective Date: ${mockInsurance.effectiveDate}\n- Group Number: ${mockInsurance.groupNumber}\n- Employer: ${mockInsurance.employer}`;
  },
  {
    name: 'get_insurance_info',
    description:
      'Retrieve basic insurance information from Cigna, including member ID, plan type, and coverage status.',
    schema: z.object({}),
  },
);

export const getCoverageDetailsTool = tool(
  async (_, config) => {
    const user = config?.configurable?._credentials?.user;
    if (!user) {
      return 'No authenticated user. Please log in.';
    }

    const med = mockCoverage.medical;
    const rx = mockCoverage.prescription;

    return `Coverage Details:

MEDICAL:
Deductible: $${med.deductible} ($${med.deductibleMet} met)
Out-of-Pocket Maximum: $${med.outOfPocketMax} ($${med.outOfPocketMet} met)
Coinsurance: ${med.coinsurance}

Copays:
- Primary Care: $${med.copay.primaryCare}
- Specialist: $${med.copay.specialist}
- Urgent Care: $${med.copay.urgentCare}
- Emergency Room: $${med.copay.emergencyRoom}

PRESCRIPTION:
- Tier 1 (Generic): $${rx.tier1}
- Tier 2 (Preferred): $${rx.tier2}
- Tier 3 (Non-Preferred): $${rx.tier3}
- Tier 4 (Specialty): $${rx.tier4}`;
  },
  {
    name: 'get_coverage_details',
    description:
      'Retrieve detailed coverage information from Cigna, including deductibles, copays, and out-of-pocket maximums.',
    schema: z.object({}),
  },
);

export const getClaimsTool = tool(
  async ({ status, limit }, config) => {
    const user = config?.configurable?._credentials?.user;
    if (!user) {
      return 'No authenticated user. Please log in.';
    }

    let claims = mockClaims;
    if (status === 'pending') {
      claims = mockClaims.filter((c) => c.status === 'Pending');
    }

    const displayClaims = claims.slice(0, limit || 10);

    return displayClaims
      .map(
        (c) =>
          `[${c.status}] ${c.date}\nProvider: ${c.provider}\nService: ${c.service}\nTotal Amount: $${c.amount}\nCovered: $${c.covered}\nYou Owe: $${c.youOwe}`,
      )
      .join('\n\n---\n\n');
  },
  {
    name: 'get_claims',
    description:
      'Retrieve insurance claims from Cigna. Shows claim status, amounts, and what has been applied to deductibles.',
    schema: z.object({
      status: z.enum(['all', 'pending']).optional().describe('Filter by claim status'),
      limit: z.number().optional().describe('Maximum number of claims to return'),
    }),
  },
);

export const checkEligibilityTool = tool(
  async ({ serviceCode }, config) => {
    const user = config?.configurable?._credentials?.user;
    if (!user) {
      return 'No authenticated user. Please log in.';
    }

    const eligibilityMatrix: Record<string, { covered: boolean; copay: number; notes: string }> = {
      'annual-checkup': {
        covered: true,
        copay: 0,
        notes: 'Covered at 100% as preventive care',
      },
      'specialist-visit': {
        covered: true,
        copay: 50,
        notes: 'Requires PCP referral for in-network',
      },
      'lab-work': {
        covered: true,
        copay: 0,
        notes: 'Covered at 100% when ordered by provider',
      },
      'imaging-mri': {
        covered: true,
        copay: 150,
        notes: 'Pre-authorization required',
      },
      'imaging-ct': {
        covered: true,
        copay: 150,
        notes: 'Pre-authorization required',
      },
      'prescription-generic': {
        covered: true,
        copay: 10,
        notes: 'Tier 1 copay',
      },
      'prescription-brand': {
        covered: true,
        copay: 60,
        notes: 'Tier 3 copay - may have generic equivalent',
      },
      'mental-health': {
        covered: true,
        copay: 25,
        notes: 'Covered as any other medical service',
      },
      'physical-therapy': {
        covered: true,
        copay: 50,
        notes: 'Pre-authorization required after 20 visits',
      },
    };

    const eligibility = eligibilityMatrix[serviceCode];
    if (!eligibility) {
      return `Service code "${serviceCode}" not recognized. Try one of: ${Object.keys(eligibilityMatrix).join(', ')}`;
    }

    return `Eligibility Check for ${serviceCode}:\n- Covered: ${eligibility.covered ? 'Yes' : 'No'}\n- Your Copay: $${eligibility.copay}\n- Notes: ${eligibility.notes}`;
  },
  {
    name: 'check_eligibility',
    description:
      'Check if a specific medical service or procedure is covered by Cigna. Enter service codes like "annual-checkup", "lab-work", "specialist-visit", etc.',
    schema: z.object({
      serviceCode: z
        .string()
        .describe(
          'Service code to check (e.g., "annual-checkup", "lab-work", "specialist-visit", "prescription-generic")',
        ),
    }),
  },
);
