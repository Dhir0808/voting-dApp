export enum ErrorCode {
  // Wallet Errors
  WALLET_NOT_CONNECTED = 'WALLET_NOT_CONNECTED',
  WALLET_CONNECTION_FAILED = 'WALLET_CONNECTION_FAILED',
  WALLET_DISCONNECTED = 'WALLET_DISCONNECTED',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',

  // Transaction Errors
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  TRANSACTION_TIMEOUT = 'TRANSACTION_TIMEOUT',
  TRANSACTION_REJECTED = 'TRANSACTION_REJECTED',
  TRANSACTION_INVALID = 'TRANSACTION_INVALID',

  // Program Errors
  PROGRAM_NOT_INITIALIZED = 'PROGRAM_NOT_INITIALIZED',
  INVALID_PROGRAM_ID = 'INVALID_PROGRAM_ID',
  INVALID_ACCOUNT = 'INVALID_ACCOUNT',
  INVALID_INSTRUCTION = 'INVALID_INSTRUCTION',

  // Proposal Errors
  PROPOSAL_NOT_FOUND = 'PROPOSAL_NOT_FOUND',
  PROPOSAL_ALREADY_EXISTS = 'PROPOSAL_ALREADY_EXISTS',
  PROPOSAL_ENDED = 'PROPOSAL_ENDED',
  PROPOSAL_NOT_STARTED = 'PROPOSAL_NOT_STARTED',
  INVALID_PROPOSAL_PARAMS = 'INVALID_PROPOSAL_PARAMS',

  // Vote Errors
  VOTE_NOT_ALLOWED = 'VOTE_NOT_ALLOWED',
  ALREADY_VOTED = 'ALREADY_VOTED',
  INVALID_VOTE_OPTION = 'INVALID_VOTE_OPTION',

  // Network Errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  RPC_ERROR = 'RPC_ERROR',
  TIMEOUT = 'TIMEOUT',

  // Validation Errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  REQUIRED_FIELD = 'REQUIRED_FIELD',

  // General Errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

export interface AppError {
  message: string;
  details?: string;
  code?: string;
  severity?: 'error' | 'warning' | 'info';
}

export interface ErrorHandler {
  handle(error: AppError): void;
  log(error: AppError): void;
  display(error: AppError): void;
}

export interface ErrorContext {
  component?: string;
  action?: string;
  params?: Record<string, any>;
} 