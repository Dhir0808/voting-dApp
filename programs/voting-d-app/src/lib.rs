use anchor_lang::prelude::*;

declare_id!("i2oJay4YSQQB4A9eH7uDZ9V57VszTH7VN6sASHaiNiv");

#[program]
pub mod voting_d_app {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]

pub struct Initialize {}
