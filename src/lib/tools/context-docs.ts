import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { FGARetriever } from '@auth0/ai-langchain/RAG';

import { getVectorStore } from '@/lib/rag/embedding';

export const getContextDocumentsTool = tool(
  async ({ question }, config) => {
    const user = config?.configurable?._credentials?.user;

    if (!user) {
      return 'There is no user logged in.';
    }

    if (!user?.email) {
      return 'User email not found. Cannot verify document access permissions.';
    }

    const vectorStore = await getVectorStore();

    if (!vectorStore) {
      return 'There is no vector store.';
    }

    const retriever = FGARetriever.create({
      retriever: vectorStore.asRetriever(),
      buildQuery: (doc) => ({
        user: `user:${user?.email}`,
        object: `health_document:${doc.metadata.documentId}`,
        relation: 'can_view',
      }),
    });

    const documents = await retriever.invoke(question);
    return documents.map((doc) => doc.pageContent).join('\n\n');
  },
  {
    name: 'get_context_documents',
    description:
      'Use this tool when user asks for documents stored in the health knowledge base. Uses Auth0 FGA for document-level access control - the agent can only retrieve documents the patient is authorized to see.',
    schema: z.object({
      question: z.string().describe('the users question'),
    }),
  },
);
