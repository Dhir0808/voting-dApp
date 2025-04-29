import { useState, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { useError } from "../contexts/ErrorContext";
import { ErrorType, ErrorCategory, ErrorCodes } from "../utils/errorHandling";
import { Proposal } from "../types/proposal";
import { Program, AnchorProvider, web3 } from "@project-serum/anchor";
import { IDL } from "../idl/voting_d_app";

const PROGRAM_ID = new PublicKey("your_program_id_here"); // Replace with your actual program ID

interface TransactionResult {
  success: boolean;
  transactionHash?: string;
}

export function useProgram() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const { addError } = useError();
  const [isLoading, setIsLoading] = useState(false);

  const getProvider = useCallback(() => {
    if (!publicKey) return null;
    return new AnchorProvider(connection, window.solana, {});
  }, [connection, publicKey]);

  const getProgram = useCallback(() => {
    const provider = getProvider();
    if (!provider) return null;
    return new Program(IDL, PROGRAM_ID, provider);
  }, [getProvider]);

  // Create a new proposal
  const createNewProposal = useCallback(
    async (
      title: string,
      description: string,
      options: string[],
      startTime: number,
      endTime: number
    ): Promise<TransactionResult> => {
      if (!publicKey) {
        addError({
          message: "Wallet not connected",
          type: ErrorType.WALLET,
          category: ErrorCategory.USER,
          code: ErrorCodes.WALLET_NOT_CONNECTED,
        });
        return { success: false };
      }

      setIsLoading(true);
      try {
        const program = getProgram();
        if (!program) throw new Error("Program not initialized");

        const proposalKeypair = web3.Keypair.generate();
        
        const tx = await program.methods
          .createProposal(title, description, options, new web3.BN(startTime), new web3.BN(endTime))
          .accounts({
            authority: publicKey,
            proposal: proposalKeypair.publicKey,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
          })
          .signers([proposalKeypair])
          .rpc();

        return { 
          success: true,
          transactionHash: tx
        };
      } catch (error) {
        addError(error);
        return { success: false };
      } finally {
        setIsLoading(false);
      }
    },
    [publicKey, addError, getProgram]
  );

  // Vote on a proposal
  const vote = useCallback(
    async (proposalPubkey: PublicKey, optionIndex: number): Promise<TransactionResult> => {
      if (!publicKey) {
        addError({
          message: "Wallet not connected",
          type: ErrorType.WALLET,
          category: ErrorCategory.USER,
          code: ErrorCodes.WALLET_NOT_CONNECTED,
        });
        return { success: false };
      }

      setIsLoading(true);
      try {
        const program = getProgram();
        if (!program) throw new Error("Program not initialized");

        const voteKeypair = web3.Keypair.generate();
        
        const tx = await program.methods
          .castVote(new web3.BN(optionIndex))
          .accounts({
            voter: publicKey,
            proposal: proposalPubkey,
            vote: voteKeypair.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([voteKeypair])
          .rpc();

        return { 
          success: true,
          transactionHash: tx
        };
      } catch (error) {
        addError(error);
        return { success: false };
      } finally {
        setIsLoading(false);
      }
    },
    [publicKey, addError, getProgram]
  );

  // Get all proposals
  const getAllProposals = useCallback(async (): Promise<Proposal[]> => {
    setIsLoading(true);
    try {
      const program = getProgram();
      if (!program) throw new Error("Program not initialized");

      const proposals = await program.account.proposal.all();
      
      return proposals.map(proposal => ({
        publicKey: proposal.publicKey,
        title: proposal.account.title,
        description: proposal.account.description,
        options: proposal.account.options,
        startTime: proposal.account.startTime.toNumber(),
        endTime: proposal.account.endTime.toNumber(),
      }));
    } catch (error) {
      addError(error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [addError, getProgram]);

  // Get vote results for a proposal
  const getVoteResults = useCallback(
    async (proposalPubkey: PublicKey): Promise<number[]> => {
      setIsLoading(true);
      try {
        const program = getProgram();
        if (!program) throw new Error("Program not initialized");

        const proposal = await program.account.proposal.fetch(proposalPubkey);
        return proposal.voteCounts.map(count => count.toNumber());
      } catch (error) {
        addError(error);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [addError, getProgram]
  );

  return {
    createNewProposal,
    vote,
    getAllProposals,
    getVoteResults,
    isLoading,
  };
} 