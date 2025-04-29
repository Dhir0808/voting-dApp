import { Program, web3 } from '@project-serum/anchor';
import { useWallet } from '@solana/wallet-adapter-react';
import { v4 as uuidv4 } from 'uuid';
import {
  Transaction,
  TransactionStatus,
  TransactionType,
  TransactionOptions,
  TransactionResult,
  TransactionContext
} from '../types/transaction';

export class TransactionService {
  private context: TransactionContext;
  private transactions: Map<string, Transaction>;

  constructor(context: TransactionContext) {
    this.context = context;
    this.transactions = new Map();
  }

  private async waitForConfirmation(signature: string): Promise<boolean> {
    const { connection, options } = this.context;
    const commitment = options?.commitment || 'confirmed';
    
    try {
      const confirmation = await connection.confirmTransaction(signature, commitment);
      return confirmation.value.err === null;
    } catch (error) {
      console.error('Error confirming transaction:', error);
      return false;
    }
  }

  private async retryTransaction(
    operation: () => Promise<string>,
    maxRetries: number = 3
  ): Promise<string> {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
    }
    
    throw lastError;
  }

  private createTransaction(
    type: TransactionType,
    signature: string,
    metadata?: Record<string, any>
  ): Transaction {
    const transaction: Transaction = {
      id: uuidv4(),
      type,
      status: TransactionStatus.PENDING,
      signature,
      timestamp: Date.now(),
      metadata
    };
    
    this.transactions.set(transaction.id, transaction);
    return transaction;
  }

  async sendTransaction<T>(
    type: TransactionType,
    operation: () => Promise<string>,
    metadata?: Record<string, any>
  ): Promise<TransactionResult<T>> {
    const { options } = this.context;
    const maxRetries = options?.maxRetries || 3;
    
    try {
      const signature = await this.retryTransaction(operation, maxRetries);
      const transaction = this.createTransaction(type, signature, metadata);
      
      const success = await this.waitForConfirmation(signature);
      
      if (success) {
        transaction.status = TransactionStatus.CONFIRMED;
        return {
          success: true,
          signature,
          status: TransactionStatus.CONFIRMED
        };
      } else {
        transaction.status = TransactionStatus.FAILED;
        transaction.error = 'Transaction failed to confirm';
        return {
          success: false,
          error: 'Transaction failed to confirm',
          signature,
          status: TransactionStatus.FAILED
        };
      }
    } catch (error) {
      const transaction = this.createTransaction(type, '', metadata);
      transaction.status = TransactionStatus.FAILED;
      transaction.error = error.message;
      
      return {
        success: false,
        error: error.message,
        status: TransactionStatus.FAILED
      };
    }
  }

  async createProposal(
    title: string,
    description: string,
    options: string[],
    startTime: number,
    endTime: number
  ): Promise<TransactionResult<web3.PublicKey>> {
    const { program } = this.context;
    const proposal = web3.Keypair.generate();
    
    const operation = async () => {
      return await program.methods
        .createProposal(title, description, options, startTime, endTime)
        .accounts({
          proposal: proposal.publicKey,
          authority: program.provider.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([proposal])
        .rpc();
    };

    return this.sendTransaction<web3.PublicKey>(
      TransactionType.CREATE_PROPOSAL,
      operation,
      { proposalPubkey: proposal.publicKey.toString() }
    );
  }

  async castVote(
    proposalId: string,
    option: string
  ): Promise<TransactionResult<web3.PublicKey>> {
    const { program } = this.context;
    const vote = web3.Keypair.generate();
    const proposalPubkey = new web3.PublicKey(proposalId);
    
    const operation = async () => {
      return await program.methods
        .castVote(option)
        .accounts({
          proposal: proposalPubkey,
          vote: vote.publicKey,
          voter: program.provider.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([vote])
        .rpc();
    };

    return this.sendTransaction<web3.PublicKey>(
      TransactionType.CAST_VOTE,
      operation,
      { proposalId, option }
    );
  }

  getTransaction(id: string): Transaction | undefined {
    return this.transactions.get(id);
  }

  getAllTransactions(): Transaction[] {
    return Array.from(this.transactions.values());
  }

  getTransactionsByType(type: TransactionType): Transaction[] {
    return this.getAllTransactions().filter(tx => tx.type === type);
  }

  getTransactionsByStatus(status: TransactionStatus): Transaction[] {
    return this.getAllTransactions().filter(tx => tx.status === status);
  }
}

// Hook to use the transaction service
export function useTransactionService(options?: TransactionOptions) {
  const { wallet, connection } = useWallet();
  const { program } = useProgram();
  
  if (!program || !wallet || !connection) {
    throw new Error('Required dependencies not initialized');
  }

  const context: TransactionContext = {
    program,
    wallet,
    connection,
    options
  };

  return new TransactionService(context);
} 