import { tool } from '@langchain/core/tools';
import { z } from 'zod';

const mockMedicalRecords = [
  {
    id: 'mr-001',
    type: 'Lab Result',
    date: '2024-03-15',
    title: 'Complete Blood Count (CBC)',
    summary: 'All values within normal range. WBC: 7.2, RBC: 4.8, Hemoglobin: 14.2, Hematocrit: 42%',
    provider: 'Mayo Clinic',
  },
  {
    id: 'mr-002',
    type: 'Lab Result',
    date: '2024-02-28',
    title: 'Lipid Panel',
    summary: 'Total Cholesterol: 195 mg/dL, LDL: 110 mg/dL, HDL: 55 mg/dL, Triglycerides: 120 mg/dL',
    provider: 'Mayo Clinic',
  },
  {
    id: 'mr-003',
    type: 'Visit Note',
    date: '2024-01-10',
    title: 'Annual Physical Examination',
    summary: 'Patient in good overall health. Blood pressure 118/76, heart rate 72. Continue current medications.',
    provider: 'Dr. Sarah Chen',
  },
  {
    id: 'mr-004',
    type: 'Imaging',
    date: '2023-12-05',
    title: 'Chest X-Ray',
    summary: 'No acute cardiopulmonary abnormality. Heart size normal. Lungs clear.',
    provider: 'Mayo Clinic Radiology',
  },
];

export const getMedicalRecordsTool = tool(
  async ({ query }, config) => {
    const user = config?.configurable?._credentials?.user;
    if (!user) {
      return 'No authenticated user. Please log in.';
    }

    const lowerQuery = query.toLowerCase();
    const results = mockMedicalRecords.filter(
      (record) =>
        record.title.toLowerCase().includes(lowerQuery) ||
        record.type.toLowerCase().includes(lowerQuery) ||
        record.summary.toLowerCase().includes(lowerQuery),
    );

    if (results.length === 0) {
      return `No medical records found matching "${query}". Try searching for "lab results", "visits", or "imaging".`;
    }

    return results
      .map((r) => `[${r.type}] ${r.title} (${r.date})\nProvider: ${r.provider}\nSummary: ${r.summary}`)
      .join('\n\n---\n\n');
  },
  {
    name: 'get_medical_records',
    description:
      'Access patient medical records from MyChart (Epic). Use this to retrieve lab results, visit notes, imaging reports, and other health documents. Always respect patient privacy - only retrieve records for the authenticated patient.',
    schema: z.object({
      query: z.string().describe('Search query for medical records (e.g., "lab results", "cardiology", "2024")'),
    }),
  },
);

export const getAppointmentsTool = tool(
  async ({ status }, config) => {
    const user = config?.configurable?._credentials?.user;
    if (!user) {
      return 'No authenticated user. Please log in.';
    }

    const mockAppointments = [
      {
        id: 'apt-001',
        type: 'Upcoming',
        date: '2024-04-20',
        time: '10:00 AM',
        provider: 'Dr. Sarah Chen',
        specialty: 'Primary Care',
        location: 'Mayo Clinic - Building A, Room 302',
        notes: 'Annual physical examination',
      },
      {
        id: 'apt-002',
        type: 'Upcoming',
        date: '2024-05-15',
        time: '2:30 PM',
        provider: 'Dr. Michael Roberts',
        specialty: 'Cardiology',
        location: 'Mayo Clinic - Heart Center, Room 410',
        notes: 'Follow-up on ECG results',
      },
      {
        id: 'apt-003',
        type: 'Past',
        date: '2024-01-10',
        time: '9:00 AM',
        provider: 'Dr. Sarah Chen',
        specialty: 'Primary Care',
        location: 'Mayo Clinic - Building A, Room 302',
        notes: 'Annual physical - all clear',
      },
    ];

    const filtered = status
      ? mockAppointments.filter((a) => a.type.toLowerCase() === status.toLowerCase())
      : mockAppointments;

    if (filtered.length === 0) {
      return status ? `No ${status} appointments found.` : 'No appointments found.';
    }

    return filtered
      .map(
        (a) =>
          `${a.type}: ${a.date} at ${a.time}\nProvider: ${a.provider} (${a.specialty})\nLocation: ${a.location}\nNotes: ${a.notes}`,
      )
      .join('\n\n---\n\n');
  },
  {
    name: 'get_appointments',
    description:
      'Retrieve patient appointments from MyChart. Can filter by status (upcoming/past) and provides details about scheduled visits, follow-ups, and past medical appointments.',
    schema: z.object({
      status: z.enum(['upcoming', 'past']).optional().describe('Filter by appointment status'),
    }),
  },
);

export const bookAppointmentTool = tool(
  async ({ specialty, preferredDate, reason }, config) => {
    const user = config?.configurable?._credentials?.user;
    if (!user) {
      return 'No authenticated user. Please log in.';
    }

    return `Appointment request submitted:\n- Specialty: ${specialty}\n- Preferred Date: ${preferredDate}\n- Reason: ${reason}\n\nThis action requires your explicit approval via CIBA. You will receive a notification on your device to confirm this appointment booking.`;
  },
  {
    name: 'book_appointment',
    description:
      'Request a new medical appointment. Requires user confirmation via CIBA before execution. The patient must approve the appointment booking from their mobile device.',
    schema: z.object({
      specialty: z.string().describe('Medical specialty (e.g., "Primary Care", "Cardiology", "Dermatology")'),
      preferredDate: z.string().describe('Preferred appointment date (YYYY-MM-DD format)'),
      reason: z.string().describe('Reason for visit'),
    }),
  },
);
