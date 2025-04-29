import { PublicKey } from '@solana/web3.js';

export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum TransactionType {
  CREATE_PROPOSAL = 'create_proposal',
  CAST_VOTE = 'cast_vote',
  UPDATE_PROPOSAL = 'update_proposal',
  CLOSE_PROPOSAL = 'close_proposal'
}

export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  signature: string;
  timestamp: number;
  error?: string;
  metadata?: Record<string, any>;
}

export interface TransactionOptions {
  skipPreflight?: boolean;
  maxRetries?: number;
  commitment?: 'processed' | 'confirmed' | 'finalized';
}

export interface TransactionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  signature?: string;
  status: TransactionStatus;
}

export interface TransactionContext {
  program: any;
  wallet: any;
  connection: any;
  options?: TransactionOptions;
} 