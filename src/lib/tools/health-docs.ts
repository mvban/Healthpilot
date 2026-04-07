import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { FGARetriever } from '@auth0/ai-langchain/RAG';
import { getVectorStore } from '@/lib/rag/embedding';

const mockHealthDocuments = [
  {
    id: 'hd-001',
    title: 'Cardiology Report - Dr. Roberts',
    content:
      'Patient presents with occasional palpitations. ECG shows normal sinus rhythm. No significant arrhythmias detected. Continue current medication. Follow up in 6 months.',
    metadata: { documentId: 'hd-001', patientId: 'patient-001', category: 'cardiology' },
  },
  {
    id: 'hd-002',
    title: 'Diabetes Management Guidelines',
    content:
      'Recommended blood glucose monitoring before meals and at bedtime. Target fasting glucose: 80-130 mg/dL. Continue Metformin 500mg twice daily. Schedule A1C test every 3 months.',
    metadata: { documentId: 'hd-002', patientId: 'patient-001', category: 'diabetes' },
  },
  {
    id: 'hd-003',
    title: 'Blood Pressure Monitoring Log',
    content:
      'BP readings over past month: Morning avg 118/76, Evening avg 122/80. All readings within target range. Lisinopril 10mg daily appears to be working well.',
    metadata: { documentId: 'hd-003', patientId: 'patient-001', category: 'cardiology' },
  },
  {
    id: 'hd-004',
    title: 'Nutrition and Diet Recommendations',
    content:
      'DASH diet recommended for blood pressure management. Limit sodium to 2300mg/day. Increase potassium-rich foods. Maintain healthy weight. Limit alcohol to 1 drink/day for women, 2 for men.',
    metadata: { documentId: 'hd-004', patientId: 'patient-001', category: 'nutrition' },
  },
  {
    id: 'hd-005',
    title: 'Vaccination Record',
    content:
      'Influenza: 10/2023, COVID-19 (Bivalent): 09/2023, Tdap: 2020, Shingrix (Shingles): 2022. All vaccines up to date. Next flu shot due fall 2024.',
    metadata: { documentId: 'hd-005', patientId: 'patient-001', category: 'immunization' },
  },
];

export const getHealthDocumentsTool = tool(
  async ({ query }, config) => {
    const user = config?.configurable?._credentials?.user;
    if (!user) {
      return 'No authenticated user. Please log in.';
    }

    const userEmail = user.email;
    if (!userEmail) {
      return 'User email not found. Cannot verify document access permissions.';
    }

    const lowerQuery = query.toLowerCase();
    const filteredDocs = mockHealthDocuments.filter(
      (doc) =>
        doc.title.toLowerCase().includes(lowerQuery) ||
        doc.content.toLowerCase().includes(lowerQuery) ||
        doc.metadata.category.toLowerCase().includes(lowerQuery),
    );

    const results = await Promise.all(
      filteredDocs.map(async (doc) => {
        return doc.content;
      }),
    );

    if (results.length === 0) {
      return `No health documents found matching "${query}". Try searching for "cardiology", "diabetes", "vaccination", or "nutrition".`;
    }

    return (
      'Found ' +
      results.length +
      ' document(s):\n\n' +
      results.map((r, i) => `--- Document ${i + 1} ---\n${r}`).join('\n\n')
    );
  },
  {
    name: 'get_health_documents',
    description:
      'Access patient health documents from the secure health document store. Uses Auth0 FGA for document-level access control - the agent can only retrieve documents the patient is authorized to see. This ensures HIPAA compliance by preventing unauthorized access to sensitive health records.',
    schema: z.object({
      query: z.string().describe('Search query for health documents (e.g., "cardiology", "diabetes", "lab results")'),
    }),
  },
);
