import { tool } from '@langchain/core/tools';
import { z } from 'zod';

const mockPrescriptions = [
  {
    id: 'rx-001',
    name: 'Lisinopril 10mg',
    dosage: '10mg',
    frequency: 'Once daily',
    refillsRemaining: 3,
    lastFilled: '2024-03-01',
    pharmacy: 'CVS Pharmacy - Main St',
    status: 'Active',
    instructions: 'Take one tablet by mouth daily in the morning',
  },
  {
    id: 'rx-002',
    name: 'Metformin 500mg',
    dosage: '500mg',
    frequency: 'Twice daily',
    refillsRemaining: 5,
    lastFilled: '2024-03-10',
    pharmacy: 'CVS Pharmacy - Main St',
    status: 'Active',
    instructions: 'Take one tablet by mouth twice daily with meals',
  },
  {
    id: 'rx-003',
    name: 'Atorvastatin 20mg',
    dosage: '20mg',
    frequency: 'Once daily at bedtime',
    refillsRemaining: 2,
    lastFilled: '2024-02-20',
    pharmacy: 'CVS Pharmacy - Main St',
    status: 'Active',
    instructions: 'Take one tablet by mouth at bedtime',
  },
  {
    id: 'rx-004',
    name: 'Aspirin 81mg',
    dosage: '81mg',
    frequency: 'Once daily',
    refillsRemaining: 0,
    lastFilled: '2024-01-15',
    pharmacy: 'CVS Pharmacy - Main St',
    status: 'Needs Refill',
    instructions: 'Take one tablet by mouth daily',
  },
];

export const getPrescriptionsTool = tool(
  async ({ filter }, config) => {
    const user = config?.configurable?._credentials?.user;
    if (!user) {
      return 'No authenticated user. Please log in.';
    }

    let prescriptions = mockPrescriptions;
    if (filter === 'needs-refill') {
      prescriptions = mockPrescriptions.filter((p) => p.refillsRemaining === 0);
    } else if (filter === 'active') {
      prescriptions = mockPrescriptions.filter((p) => p.status === 'Active');
    }

    if (prescriptions.length === 0) {
      return filter === 'needs-refill' ? 'No prescriptions currently need refilling.' : 'No prescriptions found.';
    }

    return prescriptions
      .map(
        (p) =>
          `[${p.status}] ${p.name} (${p.dosage})\nFrequency: ${p.frequency}\nRefills Remaining: ${p.refillsRemaining}\nLast Filled: ${p.lastFilled}\nPharmacy: ${p.pharmacy}\nInstructions: ${p.instructions}`,
      )
      .join('\n\n---\n\n');
  },
  {
    name: 'get_prescriptions',
    description:
      'Retrieve current prescriptions from CVS Pharmacy. Shows medication details, refill status, and pharmacy information. Can filter by status (active/needs-refill).',
    schema: z.object({
      filter: z.enum(['all', 'active', 'needs-refill']).optional().describe('Filter prescriptions by status'),
    }),
  },
);

export const refillPrescriptionTool = tool(
  async ({ prescriptionId }, config) => {
    const user = config?.configurable?._credentials?.user;
    if (!user) {
      return 'No authenticated user. Please log in.';
    }

    const prescription = mockPrescriptions.find((p) => p.id === prescriptionId);
    if (!prescription) {
      return `Prescription ${prescriptionId} not found.`;
    }

    if (prescription.refillsRemaining <= 0) {
      return `Cannot refill ${prescription.name} - no refills remaining. Please contact your provider for a new prescription.`;
    }

    return `Refill request submitted for ${prescription.name}.\n\nThis action requires your explicit approval via CIBA. You will receive a notification on your device to confirm this refill request.\n\nPrescription Details:\n- Medication: ${prescription.name} ${prescription.dosage}\n- Pharmacy: ${prescription.pharmacy}\n- Refills remaining after this: ${prescription.refillsRemaining - 1}`;
  },
  {
    name: 'refill_prescription',
    description:
      'Request a prescription refill from CVS Pharmacy. Requires user confirmation via CIBA before execution. The patient must approve the refill request from their mobile device.',
    schema: z.object({
      prescriptionId: z.string().describe('The prescription ID to refill (from get_prescriptions)'),
    }),
  },
);

export const findPharmacyTool = tool(
  async ({ zipCode, service }, config) => {
    const user = config?.configurable?._credentials?.user;
    if (!user) {
      return 'No authenticated user. Please log in.';
    }

    const pharmacies = [
      {
        id: 'ph-001',
        name: 'CVS Pharmacy - Main St',
        address: '123 Main Street, Rochester, MN 55901',
        phone: '(507) 555-0100',
        hours: 'Mon-Fri 8am-9pm, Sat-Sun 9am-6pm',
        services: ['Drive-thru', '24-hour', 'Immunizations'],
        distance: '0.3 miles',
      },
      {
        id: 'ph-002',
        name: 'CVS Pharmacy - Downtown',
        address: '456 Center St, Rochester, MN 55902',
        phone: '(507) 555-0200',
        hours: 'Mon-Fri 7am-10pm, Sat 8am-8pm, Sun 9am-6pm',
        services: ['24-hour', 'MinuteClinic', 'Immunizations'],
        distance: '1.2 miles',
      },
      {
        id: 'ph-003',
        name: 'CVS Pharmacy - Eastgate',
        address: '789 Eastgate Dr, Rochester, MN 55904',
        phone: '(507) 555-0300',
        hours: 'Mon-Fri 9am-9pm, Sat 9am-6pm, Sun 10am-5pm',
        services: ['Drive-thru', 'Immunizations', 'Photo Services'],
        distance: '2.5 miles',
      },
    ];

    return pharmacies
      .map(
        (p) =>
          `${p.name}\nAddress: ${p.address}\nPhone: ${p.phone}\nHours: ${p.hours}\nServices: ${p.services.join(', ')}\nDistance: ${p.distance}`,
      )
      .join('\n\n---\n\n');
  },
  {
    name: 'find_pharmacy',
    description:
      'Find nearby CVS Pharmacy locations. Shows address, hours, phone number, and available services like drive-thru, 24-hour, and MinuteClinic.',
    schema: z.object({
      zipCode: z.string().optional().describe('Zip code to search near'),
      service: z.string().optional().describe('Filter by service (e.g., "24-hour", "drive-thru")'),
    }),
  },
);
