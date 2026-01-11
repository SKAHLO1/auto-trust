import { Request } from 'express';

// User and Auth types
export interface AuthenticatedRequest extends Request {
  userId?: string;
}

// Task types
export interface Milestone {
  title: string;
  description: string;
  amount: number;
  deadline?: string;
}

export interface VerificationCriteria {
  requirements: string[];
  qualityThreshold: number;
  additionalNotes?: string;
}

export interface Task {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  milestones: Milestone[];
  totalBudget: number;
  verificationCriteria: VerificationCriteria;
  status: 'active' | 'completed' | 'cancelled' | 'disputed' | 'submitted' | 'pending_deposit';
  escrowAmount: number;
  escrowStatus: 'pending' | 'locked' | 'released' | 'refunded';
  paymentMethod?: 'MNEE' | 'ETH';
  deliverableType?: string;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
  mneeWalletAddress?: string;
  mneeTransactionId?: string;
  cancelReason?: string;
}

// Submission types
export interface SubmissionData {
  [key: string]: any;
}

export interface Submission {
  id: string;
  taskId: string;
  submitterId: string;
  type: string;
  data: SubmissionData;
  status: 'pending' | 'approved' | 'rejected';
  verificationStatus: 'processing' | 'completed' | 'failed';
  verificationResult: VerificationResult | null;
  submittedAt: string;
  updatedAt: string;
}

// Verification types
export interface VerificationResult {
  verdict: 'passed' | 'failed';
  score: number;
  feedback: string;
  details: string[];
  analyzedAt: string;
}

// Escrow types
export interface Escrow {
  id: string;
  taskId: string;
  depositorId: string;
  amount: number;
  status: 'locked' | 'released' | 'refunded';
  mneeTransactionId: string;
  mneeTicketId?: string;
  deposittedAt: string;
  releasedAt: string | null;
  senderAddress?: string;
  recipientAddress?: string;
}

// MNEE specific types
export interface MNEEWallet {
  address: string;
  privateKey: string;
  mnemonic?: string;
}

export interface MNEETransferParams {
  recipients: Array<{
    address: string;
    amount: number;
  }>;
  senderPrivateKey: string;
  broadcast?: boolean;
  callbackUrl?: string;
}

export interface MNEETransferResult {
  ticketId?: string;
  rawtx?: string;
  txId?: string;
  status?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Config types
export interface AppConfig {
  port: number;
  environment: 'production' | 'sandbox';
  mneeApiKey?: string;
  geminiApiKey: string;
  firebaseConfig: {
    databaseURL: string;
  };
  allowedOrigins: string[];
}
