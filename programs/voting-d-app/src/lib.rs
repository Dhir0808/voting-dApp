use anchor_lang::prelude::*;

declare_id!("i2oJay4YSQQB4A9eH7uDZ9V57VszTH7VN6sASHaiNiv");

#[program]
pub mod voting_d_app {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }

    pub fn create_proposal(
        ctx: Context<CreateProposal>,
        title: String,
        description: String,
        options: Vec<String>,
        start_time: i64,
        end_time: i64,
    ) -> Result<()> {
        // Validate proposal parameters
        require!(title.len() <= 100, ErrorCode::TitleTooLong);
        require!(description.len() <= 1000, ErrorCode::DescriptionTooLong);
        require!(
            options.len() >= 2 && options.len() <= 10,
            ErrorCode::InvalidOptionsCount
        );
        require!(
            start_time > Clock::get()?.unix_timestamp,
            ErrorCode::InvalidStartTime
        );
        require!(end_time > start_time, ErrorCode::InvalidEndTime);

        // Get current timestamp
        let current_time = Clock::get()?.unix_timestamp;

        // Initialize proposal account
        let proposal = &mut ctx.accounts.proposal;
        proposal.authority = ctx.accounts.authority.key();
        proposal.title = title;
        proposal.description = description;
        proposal.options = options;
        proposal.start_time = start_time;
        proposal.end_time = end_time;
        proposal.total_votes = 0;
        proposal.is_active = true;
        proposal.created_at = current_time;
        proposal.bump = ctx.bumps.proposal;

        // Update global state
        let global_state = &mut ctx.accounts.global_state;
        global_state.total_proposals = global_state.total_proposals.checked_add(1).unwrap();

        // Update user profile
        let user_profile = &mut ctx.accounts.user_profile;
        user_profile.proposals_created = user_profile.proposals_created.checked_add(1).unwrap();

        msg!("Proposal created: {}", proposal.title);
        Ok(())
    }

    pub fn cast_vote(ctx: Context<CastVote>, option_index: u8, vote_weight: u64) -> Result<()> {
        // Get current timestamp
        let current_time = Clock::get()?.unix_timestamp;

        // Validate voting time
        let proposal = &ctx.accounts.proposal;
        require!(
            current_time >= proposal.start_time,
            ErrorCode::VotingNotStarted
        );
        require!(current_time <= proposal.end_time, ErrorCode::VotingEnded);
        require!(proposal.is_active, ErrorCode::ProposalInactive);

        // Validate option index
        require!(
            (option_index as usize) < proposal.options.len(),
            ErrorCode::InvalidOptionIndex
        );

        // Validate vote weight
        require!(vote_weight > 0, ErrorCode::InvalidVoteWeight);

        // Initialize vote account
        let vote = &mut ctx.accounts.vote;
        vote.voter = ctx.accounts.voter.key();
        vote.proposal = proposal.key();
        vote.option_index = option_index;
        vote.vote_weight = vote_weight;
        vote.timestamp = current_time;
        vote.bump = ctx.bumps.vote;

        // Update proposal vote count
        let proposal = &mut ctx.accounts.proposal;
        proposal.total_votes = proposal.total_votes.checked_add(vote_weight).unwrap();

        // Update user profile
        let user_profile = &mut ctx.accounts.user_profile;
        user_profile.votes_cast = user_profile.votes_cast.checked_add(1).unwrap();

        // Update global state
        let global_state = &mut ctx.accounts.global_state;
        global_state.total_votes = global_state.total_votes.checked_add(1).unwrap();

        msg!(
            "Vote cast for option {} with weight {}",
            option_index,
            vote_weight
        );
        Ok(())
    }

    pub fn finalize_proposal(ctx: Context<FinalizeProposal>) -> Result<()> {
        // Get current timestamp
        let current_time = Clock::get()?.unix_timestamp;

        // Validate proposal can be finalized
        let proposal = &mut ctx.accounts.proposal;
        require!(proposal.is_active, ErrorCode::ProposalAlreadyFinalized);
        require!(
            current_time > proposal.end_time,
            ErrorCode::VotingStillActive
        );

        // Update proposal status
        proposal.is_active = false;
        proposal.finalized_at = Some(current_time);

        msg!("Proposal finalized. Results will be calculated off-chain.");
        Ok(())
    }

    pub fn emergency_stop(ctx: Context<EmergencyStop>) -> Result<()> {
        // Only program authority can call this
        require!(
            ctx.accounts.authority.key() == ctx.accounts.global_state.authority,
            ErrorCode::UnauthorizedAccess
        );

        // Update global state
        let global_state = &mut ctx.accounts.global_state;
        global_state.is_emergency_stopped = true;
        global_state.emergency_stop_time = Some(Clock::get()?.unix_timestamp);

        msg!("Emergency stop activated by authority");
        Ok(())
    }

    pub fn resume_operations(ctx: Context<ResumeOperations>) -> Result<()> {
        // Only program authority can call this
        require!(
            ctx.accounts.authority.key() == ctx.accounts.global_state.authority,
            ErrorCode::UnauthorizedAccess
        );

        // Update global state
        let global_state = &mut ctx.accounts.global_state;
        global_state.is_emergency_stopped = false;
        global_state.emergency_stop_time = None;

        msg!("Operations resumed by authority");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

#[derive(Accounts)]
pub struct CreateProposal<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 100 + 1000 + (10 * 100) + 8 + 8 + 8 + 1 + 8 + 1,
        seeds = [b"proposal", authority.key().as_ref(), &global_state.total_proposals.to_le_bytes()],
        bump
    )]
    pub proposal: Account<'info, Proposal>,

    #[account(
        mut,
        seeds = [b"global_state"],
        bump = global_state.bump,
        constraint = !global_state.is_emergency_stopped @ ErrorCode::EmergencyStopActive
    )]
    pub global_state: Account<'info, GlobalState>,

    #[account(
        mut,
        seeds = [b"user_profile", authority.key().as_ref()],
        bump = user_profile.bump
    )]
    pub user_profile: Account<'info, UserProfile>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CastVote<'info> {
    #[account(mut)]
    pub voter: Signer<'info>,

    #[account(
        mut,
        seeds = [b"proposal", proposal.authority.as_ref(), &proposal.created_at.to_le_bytes()],
        bump = proposal.bump,
        constraint = !global_state.is_emergency_stopped @ ErrorCode::EmergencyStopActive
    )]
    pub proposal: Account<'info, Proposal>,

    #[account(
        init,
        payer = voter,
        space = 8 + 32 + 32 + 1 + 8 + 8 + 1,
        seeds = [b"vote", voter.key().as_ref(), proposal.key().as_ref()],
        bump
    )]
    pub vote: Account<'info, Vote>,

    #[account(
        mut,
        seeds = [b"user_profile", voter.key().as_ref()],
        bump = user_profile.bump
    )]
    pub user_profile: Account<'info, UserProfile>,

    #[account(
        mut,
        seeds = [b"global_state"],
        bump = global_state.bump
    )]
    pub global_state: Account<'info, GlobalState>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct FinalizeProposal<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"proposal", proposal.authority.as_ref(), &proposal.created_at.to_le_bytes()],
        bump = proposal.bump,
        has_one = authority
    )]
    pub proposal: Account<'info, Proposal>,
}

#[derive(Accounts)]
pub struct EmergencyStop<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"global_state"],
        bump = global_state.bump
    )]
    pub global_state: Account<'info, GlobalState>,
}

#[derive(Accounts)]
pub struct ResumeOperations<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"global_state"],
        bump = global_state.bump
    )]
    pub global_state: Account<'info, GlobalState>,
}

// Account to store proposal information
#[account]
pub struct Proposal {
    pub authority: Pubkey,         // The account that created the proposal
    pub title: String,             // Title of the proposal
    pub description: String,       // Detailed description
    pub options: Vec<String>,      // List of voting options
    pub start_time: i64,           // Unix timestamp for proposal start
    pub end_time: i64,             // Unix timestamp for proposal end
    pub total_votes: u64,          // Total number of votes cast
    pub is_active: bool,           // Whether the proposal is currently active
    pub created_at: i64,           // Creation timestamp
    pub finalized_at: Option<i64>, // Timestamp when proposal was finalized
    pub bump: u8,                  // Bump seed for PDA
}

// Account to store individual votes
#[account]
pub struct Vote {
    pub voter: Pubkey,    // The account that cast the vote
    pub proposal: Pubkey, // Reference to the proposal
    pub option_index: u8, // Index of the chosen option
    pub vote_weight: u64, // Weight of the vote (for future token-weighted voting)
    pub timestamp: i64,   // When the vote was cast
    pub bump: u8,         // Bump seed for PDA
}

// Account to store user profile information
#[account]
pub struct UserProfile {
    pub authority: Pubkey,      // The wallet that owns this profile
    pub username: String,       // User's chosen username
    pub proposals_created: u64, // Number of proposals created
    pub votes_cast: u64,        // Number of votes cast
    pub reputation: u64,        // User's reputation score
    pub created_at: i64,        // Profile creation timestamp
    pub bump: u8,               // Bump seed for PDA
}

// Account to store global state
#[account]
pub struct GlobalState {
    pub authority: Pubkey,                // Program authority
    pub total_proposals: u64,             // Total number of proposals created
    pub total_votes: u64,                 // Total number of votes cast
    pub total_users: u64,                 // Total number of users
    pub minimum_voting_period: i64,       // Minimum duration for a proposal (in seconds)
    pub maximum_voting_period: i64,       // Maximum duration for a proposal (in seconds)
    pub is_emergency_stopped: bool,       // Whether the program is in emergency stop
    pub emergency_stop_time: Option<i64>, // When the emergency stop was activated
    pub bump: u8,                         // Bump seed for PDA
}

#[error_code]
pub enum ErrorCode {
    #[msg("Title must be 100 characters or less")]
    TitleTooLong,
    #[msg("Description must be 1000 characters or less")]
    DescriptionTooLong,
    #[msg("Must have between 2 and 10 options")]
    InvalidOptionsCount,
    #[msg("Start time must be in the future")]
    InvalidStartTime,
    #[msg("End time must be after start time")]
    InvalidEndTime,
    #[msg("Voting has not started yet")]
    VotingNotStarted,
    #[msg("Voting period has ended")]
    VotingEnded,
    #[msg("Proposal is not active")]
    ProposalInactive,
    #[msg("Invalid option index")]
    InvalidOptionIndex,
    #[msg("Vote weight must be greater than 0")]
    InvalidVoteWeight,
    #[msg("Proposal has already been finalized")]
    ProposalAlreadyFinalized,
    #[msg("Voting period is still active")]
    VotingStillActive,
    #[msg("Unauthorized access")]
    UnauthorizedAccess,
    #[msg("Emergency stop is active")]
    EmergencyStopActive,
}
