import { Program, AnchorProvider, web3 } from '@project-serum/anchor';
import { useWallet } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';

// Import your program's IDL
// This will be generated when you build your program
const PROGRAM_ID = new web3.PublicKey('your_program_id_here');

export function useAnchorProgram() {
  const { wallet, connection } = useWallet();

  const provider = useMemo(() => {
    if (!wallet) return null;
    return new AnchorProvider(connection, wallet, {
      preflightCommitment: 'processed',
    });
  }, [wallet, connection]);

  const program = useMemo(() => {
    if (!provider) return null;
    return new Program(IDL, PROGRAM_ID, provider);
  }, [provider]);

  return program;
}

// Helper function to get program accounts
export async function getProgramAccounts(program: Program, filters: any[] = []) {
  try {
    const accounts = await program.account.proposal.all(filters);
    return accounts;
  } catch (error) {
    console.error('Error fetching program accounts:', error);
    return [];
  }
}

// Helper function to create a new proposal
export async function createProposal(
  program: Program,
  title: string,
  description: string,
  options: string[],
  startTime: number,
  endTime: number
) {
  try {
    const proposal = web3.Keypair.generate();
    
    await program.methods
      .createProposal(title, description, options, startTime, endTime)
      .accounts({
        proposal: proposal.publicKey,
        authority: program.provider.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([proposal])
      .rpc();

    return proposal.publicKey;
  } catch (error) {
    console.error('Error creating proposal:', error);
    throw error;
  }
}

// Helper function to cast a vote
export async function castVote(
  program: Program,
  proposalPubkey: web3.PublicKey,
  option: string
) {
  try {
    const vote = web3.Keypair.generate();
    
    await program.methods
      .castVote(option)
      .accounts({
        proposal: proposalPubkey,
        vote: vote.publicKey,
        voter: program.provider.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([vote])
      .rpc();

    return vote.publicKey;
  } catch (error) {
    console.error('Error casting vote:', error);
    throw error;
  }
}

// Helper function to get proposal results
export async function getProposalResults(
  program: Program,
  proposalPubkey: web3.PublicKey
) {
  try {
    const proposal = await program.account.proposal.fetch(proposalPubkey);
    const votes = await program.account.vote.all([
      { memcmp: { offset: 8, bytes: proposalPubkey.toBase58() } }
    ]);

    const results = votes.reduce((acc, { account }) => {
      acc[account.option] = (acc[account.option] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      ...proposal,
      totalVotes: votes.length,
      results
    };
  } catch (error) {
    console.error('Error fetching proposal results:', error);
    throw error;
  }
} 