import { useAnchorProgram } from '../utils/anchor';
import { useState, useCallback } from 'react';
import { web3 } from '@project-serum/anchor';

export function useProgram() {
  const program = useAnchorProgram();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createNewProposal = useCallback(async (
    title: string,
    description: string,
    options: string[],
    startTime: number,
    endTime: number
  ) => {
    if (!program) {
      setError('Wallet not connected');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const proposalPubkey = await program.methods
        .createProposal(title, description, options, startTime, endTime)
        .accounts({
          proposal: web3.Keypair.generate().publicKey,
          authority: program.provider.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      return proposalPubkey;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [program]);

  const castVoteOnProposal = useCallback(async (
    proposalPubkey: web3.PublicKey,
    option: string
  ) => {
    if (!program) {
      setError('Wallet not connected');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      await program.methods
        .castVote(option)
        .accounts({
          proposal: proposalPubkey,
          vote: web3.Keypair.generate().publicKey,
          voter: program.provider.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [program]);

  const fetchProposal = useCallback(async (proposalPubkey: web3.PublicKey) => {
    if (!program) {
      setError('Wallet not connected');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const proposal = await program.account.proposal.fetch(proposalPubkey);
      return proposal;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [program]);

  const fetchAllProposals = useCallback(async () => {
    if (!program) {
      setError('Wallet not connected');
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const proposals = await program.account.proposal.all();
      return proposals;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [program]);

  return {
    program,
    isLoading,
    error,
    createNewProposal,
    castVoteOnProposal,
    fetchProposal,
    fetchAllProposals,
  };
} 