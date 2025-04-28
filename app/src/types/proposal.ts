import { PublicKey } from '@solana/web3.js';

export interface Proposal {
  id: string;
  title: string;
  description: string;
  options: string[];
  startTime: number;
  endTime: number;
  totalVotes: number;
  isActive: boolean;
  authority: PublicKey;
  pubkey: PublicKey;
}

export interface Vote {
  id: string;
  proposalId: string;
  option: string;
  voter: PublicKey;
  timestamp: number;
  pubkey: PublicKey;
}

export interface ProposalResults {
  proposal: Proposal;
  totalVotes: number;
  results: Record<string, number>;
  voterTurnout: number;
  timeDistribution: Record<string, number>;
}

export interface CreateProposalParams {
  title: string;
  description: string;
  options: string[];
  startTime: number;
  endTime: number;
}

export interface CastVoteParams {
  proposalId: string;
  option: string;
}

export interface ProposalFilters {
  isActive?: boolean;
  authority?: PublicKey;
  startTime?: number;
  endTime?: number;
} 