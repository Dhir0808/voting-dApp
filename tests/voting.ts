import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { VotingDApp } from "../target/types/voting_d_app";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { assert } from "chai";

describe("voting-d-app", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.VotingDApp as Program<VotingDApp>;

  // Test data
  const title = "Test Proposal";
  const description = "This is a test proposal";
  const options = ["Option 1", "Option 2", "Option 3"];
  const startTime = new anchor.BN(Math.floor(Date.now() / 1000) + 1); // 1 second in the future
  const endTime = new anchor.BN(Math.floor(Date.now() / 1000) + 3600); // 1 hour from now

  let proposalPda: PublicKey;
  let globalState: PublicKey;
  let userProfile: PublicKey;
  let votePda: PublicKey;
  let proposalCounter: anchor.BN;

  before(async () => {
    // Find PDA addresses
    [globalState] = PublicKey.findProgramAddressSync(
      [Buffer.from("global_state")],
      program.programId
    );

    [userProfile] = PublicKey.findProgramAddressSync(
      [Buffer.from("user_profile"), provider.wallet.publicKey.toBuffer()],
      program.programId
    );

    // Initialize the program if not already initialized
    try {
      const tx = await program.methods
        .initialize()
        .accounts({
          authority: provider.wallet.publicKey,
          globalState,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      
      // Wait for transaction confirmation
      await provider.connection.confirmTransaction(tx);
      console.log("Program initialized successfully");
    } catch (e) {
      console.log("Program already initialized or error:", e);
    }

    // Initialize user profile if not already initialized
    try {
      const tx = await program.methods
        .initializeUserProfile("Test User")
        .accounts({
          authority: provider.wallet.publicKey,
          userProfile,
          globalState,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      // Wait for transaction confirmation
      await provider.connection.confirmTransaction(tx);
      console.log("User profile initialized successfully");
    } catch (e) {
      console.log("User profile already initialized or error:", e);
    }

    // Small delay to ensure accounts are available
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get the current proposal counter and calculate the proposal PDA
    try {
      const globalStateAccount = await program.account.globalState.fetch(globalState);
      proposalCounter = globalStateAccount.totalProposals;

      [proposalPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("proposal"),
          provider.wallet.publicKey.toBuffer(),
          proposalCounter.toArrayLike(Buffer, "le", 8)
        ],
        program.programId
      );
    } catch (e) {
      console.error("Error fetching global state:", e);
      throw e;
    }
  });

  it("Creates a new proposal", async () => {
    try {
      const tx = await program.methods
        .createProposal(title, description, options, startTime, endTime)
        .accounts({
          authority: provider.wallet.publicKey,
          proposal: proposalPda,
          globalState,
          userProfile,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      // Wait for transaction confirmation
      await provider.connection.confirmTransaction(tx);

      const proposal = await program.account.proposal.fetch(proposalPda);
      assert.equal(proposal.title, title);
      assert.equal(proposal.description, description);
      assert.deepEqual(proposal.options, options);
      assert.equal(proposal.startTime.toNumber(), startTime.toNumber());
      assert.equal(proposal.endTime.toNumber(), endTime.toNumber());
      assert.equal(proposal.authority.toString(), provider.wallet.publicKey.toString());
    } catch (e) {
      console.error("Error creating proposal:", e);
      throw e;
    }
  });

  it("Casts a vote on the proposal", async () => {
    try {
      [votePda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("vote"),
          provider.wallet.publicKey.toBuffer(),
          proposalPda.toBuffer(),
        ],
        program.programId
      );

      const optionIndex = 0;
      const voteWeight = new anchor.BN(1);

      const tx = await program.methods
        .castVote(optionIndex, voteWeight)
        .accounts({
          voter: provider.wallet.publicKey,
          proposal: proposalPda,
          vote: votePda,
          userProfile,
          globalState,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      // Wait for transaction confirmation
      await provider.connection.confirmTransaction(tx);

      const voteData = await program.account.vote.fetch(votePda);
      assert.equal(voteData.voter.toString(), provider.wallet.publicKey.toString());
      assert.equal(voteData.proposal.toString(), proposalPda.toString());
      assert.equal(voteData.optionIndex, optionIndex);
      assert.equal(voteData.voteWeight.toNumber(), voteWeight.toNumber());
    } catch (e) {
      console.error("Error casting vote:", e);
      throw e;
    }
  });

  it("Prevents double voting", async () => {
    try {
      const optionIndex = 1;
      const voteWeight = new anchor.BN(1);

      await program.methods
        .castVote(optionIndex, voteWeight)
        .accounts({
          voter: provider.wallet.publicKey,
          proposal: proposalPda,
          vote: votePda,
          userProfile,
          globalState,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      
      assert.fail("Should not be able to vote twice");
    } catch (e: any) {
      // The error message should indicate that the vote account already exists
      assert.include(e.message, "already in use");
    }
  });

  it("Prevents voting after proposal end time", async () => {
    try {
      // Create a proposal that has already ended
      const pastStartTime = new anchor.BN(Math.floor(Date.now() / 1000) - 7200); // 2 hours ago
      const pastEndTime = new anchor.BN(Math.floor(Date.now() / 1000) - 3600); // 1 hour ago

      // Get the updated proposal counter
      const globalStateAccount = await program.account.globalState.fetch(globalState);
      const newProposalCounter = globalStateAccount.totalProposals;

      // Calculate the new proposal PDA
      const [endedProposalPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("proposal"),
          provider.wallet.publicKey.toBuffer(),
          newProposalCounter.toArrayLike(Buffer, "le", 8)
        ],
        program.programId
      );

      const tx = await program.methods
        .createProposal(title, description, options, pastStartTime, pastEndTime)
        .accounts({
          authority: provider.wallet.publicKey,
          proposal: endedProposalPda,
          globalState,
          userProfile,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      // Wait for transaction confirmation
      await provider.connection.confirmTransaction(tx);

      // Try to vote on ended proposal
      const [endedVotePda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("vote"),
          provider.wallet.publicKey.toBuffer(),
          endedProposalPda.toBuffer(),
        ],
        program.programId
      );

      try {
        await program.methods
          .castVote(0, new anchor.BN(1))
          .accounts({
            voter: provider.wallet.publicKey,
            proposal: endedProposalPda,
            vote: endedVotePda,
            userProfile,
            globalState,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        assert.fail("Should not be able to vote on ended proposal");
      } catch (e: any) {
        assert.include(e.message, "InvalidStartTime");
      }
    } catch (e) {
      console.error("Error in ended proposal test:", e);
      throw e;
    }
  });
}); 