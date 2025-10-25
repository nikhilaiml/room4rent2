import { config } from 'dotenv';
config();

import '@/ai/flows/semantic-search-gen-ai.ts';
import '@/ai/flows/citation-extraction.ts';
import '@/ai/flows/document-summary-generation.ts';
import '@/ai/flows/ai-powered-question-answering.ts';