import { Book, FileText, Notebook } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface Document {
  id: string;
  title: string;
  type: 'paper' | 'book' | 'notes';
  icon: LucideIcon;
  createdAt: string;
  content: string;
}

const documents: Document[] = [
  {
    id: '1',
    title: 'The Future of Neural Networks',
    type: 'paper',
    icon: FileText,
    createdAt: '2023-10-26',
    content: `Abstract: This paper explores the trajectory of neural network development, focusing on advancements in transformer architectures and their implications for natural language processing. We discuss the potential for few-shot learning models to revolutionize data-scarce domains. We cite the seminal work of Vaswani et al. (2017) on Attention Is All You Need. Further, we project future trends, including the integration of symbolic reasoning with deep learning frameworks. The ethical considerations of large-scale language models are also examined, referencing the principles outlined by Smith & Jones (2021). Our analysis suggests a paradigm shift towards more efficient and context-aware AI systems.`,
  },
  {
    id: '2',
    title: 'Quantum Computing Principles',
    type: 'book',
    icon: Book,
    createdAt: '2023-10-25',
    content: `Chapter 1: Introduction to Quantum Mechanics. Quantum computing harnesses the principles of quantum mechanics to process information in fundamentally new ways. Unlike classical bits, which can be either 0 or 1, a quantum bit, or qubit, can exist in a superposition of both states simultaneously. This property, along with entanglement, allows quantum computers to perform certain calculations exponentially faster than any classical computer. Key concepts include superposition, entanglement, and quantum gates. As noted by Feynman (1982), simulating quantum systems is a primary application. We will delve into the mathematical formalism, including Hilbert spaces and Dirac notation, to build a solid foundation.`,
  },
  {
    id: '3',
    title: 'Personal Study Notes on AI Ethics',
    type: 'notes',
    icon: Notebook,
    createdAt: '2023-10-24',
    content: `Meeting Summary: Discussed the framework for responsible AI development. Key points: 1. Fairness: AI systems should not perpetuate or amplify societal biases. We must audit datasets for bias (see O'Neil, 2016, "Weapons of Math Destruction"). 2. Transparency: Models, especially deep learning models, are often "black boxes." Need for explainable AI (XAI) techniques to understand their decision-making processes. 3. Accountability: Who is responsible when an AI system fails? Clear lines of accountability must be established. The GDPR provides a legal framework for data protection that is relevant here. The discussion also touched upon the dual-use problem, where benevolent AI technology could be repurposed for malicious intent.`,
  },
  {
    id: '4',
    title: 'A Brief History of Cryptography',
    type: 'paper',
    icon: FileText,
    createdAt: '2023-10-22',
    content: `From the Caesar cipher to modern public-key cryptography, the art of secret communication has evolved dramatically. This paper provides a historical overview of major cryptographic milestones. We begin with simple substitution ciphers and their vulnerability to frequency analysis. The invention of the Vigenère cipher represented a significant step forward. The 20th century saw the mechanization of cryptography with devices like the Enigma machine, famously broken by Allied cryptanalysts during World War II (Kahn, 1967). The modern era was ushered in by the Diffie-Hellman key exchange protocol and the RSA algorithm, which form the bedrock of today's secure internet communications.`,
  },
];

export async function getDocuments(): Promise<Document[]> {
  // Simulate an async API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(documents);
    }, 500);
  });
}

export async function getDocument(id: string): Promise<Document | undefined> {
   // Simulate an async API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(documents.find((doc) => doc.id === id));
    }, 300);
  });
}
