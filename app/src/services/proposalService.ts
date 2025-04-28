import { Program, web3 } from '@project-serum/anchor';
import { useProgram } from '../hooks/useProgram';
import {
  Proposal,
  Vote,
  ProposalResults,
  CreateProposalParams,
  CastVoteParams,
  ProposalFilters
} from '../types/proposal';

export class ProposalService {
  private program: Program;

  constructor(program: Program) {
    this.program = program;
  }

  async createProposal(params: CreateProposalParams): Promise<PublicKey> {
    const proposal = web3.Keypair.generate();
    
    await this.program.methods
      .createProposal(
        params.title,
        params.description,
        params.options,
        params.startTime,
        params.endTime
      )
      .accounts({
        proposal: proposal.publicKey,
        authority: this.program.provider.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([proposal])
      .rpc();

    return proposal.publicKey;
  }

  async castVote(params: CastVoteParams): Promise<PublicKey> {
    const vote = web3.Keypair.generate();
    const proposalPubkey = new web3.PublicKey(params.proposalId);
    
    await this.program.methods
      .castVote(params.option)
      .accounts({
        proposal: proposalPubkey,
        vote: vote.publicKey,
        voter: this.program.provider.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([vote])
      .rpc();

    return vote.publicKey;
  }

  async getProposal(proposalId: string): Promise<Proposal | null> {
    try {
      const proposalPubkey = new web3.PublicKey(proposalId);
      const proposal = await this.program.account.proposal.fetch(proposalPubkey);
      
      return {
        id: proposalId,
        title: proposal.title,
        description: proposal.description,
        options: proposal.options,
        startTime: proposal.startTime.toNumber(),
        endTime: proposal.endTime.toNumber(),
        totalVotes: proposal.totalVotes.toNumber(),
        isActive: proposal.isActive,
        authority: proposal.authority,
        pubkey: proposalPubkey
      };
    } catch (error) {
      console.error('Error fetching proposal:', error);
      return null;
    }
  }

  async getAllProposals(filters?: ProposalFilters): Promise<Proposal[]> {
    try {
      const filterArray = [];
      
      if (filters?.isActive !== undefined) {
        filterArray.push({
          memcmp: {
            offset: 8, // Adjust based on your account structure
            bytes: filters.isActive ? '1' : '0'
          }
        });
      }

      const proposals = await this.program.account.proposal.all(filterArray);
      
      return proposals.map(({ account, publicKey }) => ({
        id: publicKey.toString(),
        title: account.title,
        description: account.description,
        options: account.options,
        startTime: account.startTime.toNumber(),
        endTime: account.endTime.toNumber(),
        totalVotes: account.totalVotes.toNumber(),
        isActive: account.isActive,
        authority: account.authority,
        pubkey: publicKey
      }));
    } catch (error) {
      console.error('Error fetching proposals:', error);
      return [];
    }
  }

  async getProposalResults(proposalId: string): Promise<ProposalResults | null> {
    try {
      const proposal = await this.getProposal(proposalId);
      if (!proposal) return null;

      const proposalPubkey = new web3.PublicKey(proposalId);
      const votes = await this.program.account.vote.all([
        { memcmp: { offset: 8, bytes: proposalId } }
      ]);

      const results = votes.reduce((acc, { account }) => {
        acc[account.option] = (acc[account.option] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Calculate time distribution
      const timeDistribution = votes.reduce((acc, { account }) => {
        const day = new Date(account.timestamp.toNumber() * 1000).toLocaleDateString();
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Calculate voter turnout (mock data for now)
      const voterTurnout = 65; // This should be calculated based on total eligible voters

      return {
        proposal,
        totalVotes: votes.length,
        results,
        voterTurnout,
        timeDistribution
      };
    } catch (error) {
      console.error('Error fetching proposal results:', error);
      return null;
    }
  }

  async getVotes(proposalId: string): Promise<Vote[]> {
    try {
      const votes = await this.program.account.vote.all([
        { memcmp: { offset: 8, bytes: proposalId } }
      ]);

      return votes.map(({ account, publicKey }) => ({
        id: publicKey.toString(),
        proposalId,
        option: account.option,
        voter: account.voter,
        timestamp: account.timestamp.toNumber(),
        pubkey: publicKey
      }));
    } catch (error) {
      console.error('Error fetching votes:', error);
      return [];
    }
  }
}

// Hook to use the proposal service
export function useProposalService() {
  const { program } = useProgram();
  
  if (!program) {
    throw new Error('Program not initialized');
  }

  return new ProposalService(program);
} 