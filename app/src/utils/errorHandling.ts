// Error types
export enum ErrorType {
  WALLET = 'WALLET',
  NETWORK = 'NETWORK',
  TRANSACTION = 'TRANSACTION',
  VALIDATION = 'VALIDATION',
  UNKNOWN = 'UNKNOWN',
}

// Error categories
export enum ErrorCategory {
  USER = 'USER',
  SYSTEM = 'SYSTEM',
  BLOCKCHAIN = 'BLOCKCHAIN',
}

// Custom error class
export class AppError extends Error {
  type: ErrorType;
  category: ErrorCategory;
  code: string;
  details?: any;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    category: ErrorCategory = ErrorCategory.SYSTEM,
    code: string = 'UNKNOWN_ERROR',
    details?: any
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.category = category;
    this.code = code;
    this.details = details;
  }
}

// Error codes
export const ErrorCodes = {
  // Wallet errors
  WALLET_NOT_CONNECTED: 'WALLET_NOT_CONNECTED',
  WALLET_CONNECTION_FAILED: 'WALLET_CONNECTION_FAILED',
  WALLET_DISCONNECTED: 'WALLET_DISCONNECTED',
  WALLET_REJECTED: 'WALLET_REJECTED',
  
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  RPC_ERROR: 'RPC_ERROR',
  TIMEOUT: 'TIMEOUT',
  
  // Transaction errors
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  TRANSACTION_REJECTED: 'TRANSACTION_REJECTED',
  
  // Validation errors
  INVALID_INPUT: 'INVALID_INPUT',
  INVALID_STATE: 'INVALID_STATE',
  INVALID_PARAMETERS: 'INVALID_PARAMETERS',
  
  // Unknown errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

// Error messages
export const ErrorMessages = {
  [ErrorCodes.WALLET_NOT_CONNECTED]: 'Wallet is not connected. Please connect your wallet to continue.',
  [ErrorCodes.WALLET_CONNECTION_FAILED]: 'Failed to connect wallet. Please try again.',
  [ErrorCodes.WALLET_DISCONNECTED]: 'Wallet disconnected. Please reconnect to continue.',
  [ErrorCodes.WALLET_REJECTED]: 'Wallet operation was rejected by the user.',
  
  [ErrorCodes.NETWORK_ERROR]: 'Network error occurred. Please check your connection and try again.',
  [ErrorCodes.RPC_ERROR]: 'Error communicating with the blockchain. Please try again later.',
  [ErrorCodes.TIMEOUT]: 'Operation timed out. Please try again.',
  
  [ErrorCodes.TRANSACTION_FAILED]: 'Transaction failed. Please try again.',
  [ErrorCodes.INSUFFICIENT_FUNDS]: 'Insufficient funds to complete the transaction.',
  [ErrorCodes.TRANSACTION_REJECTED]: 'Transaction was rejected.',
  
  [ErrorCodes.INVALID_INPUT]: 'Invalid input provided.',
  [ErrorCodes.INVALID_STATE]: 'Invalid application state.',
  [ErrorCodes.INVALID_PARAMETERS]: 'Invalid parameters provided.',
  
  [ErrorCodes.UNKNOWN_ERROR]: 'An unknown error occurred. Please try again.',
};

// Error handler function
export function handleError(error: any): AppError {
  console.error('Error caught by handler:', error);
  
  // If it's already an AppError, return it
  if (error instanceof AppError) {
    return error;
  }
  
  // Handle specific error types
  if (error.message?.includes('wallet')) {
    return new AppError(
      ErrorMessages[ErrorCodes.WALLET_NOT_CONNECTED],
      ErrorType.WALLET,
      ErrorCategory.USER,
      ErrorCodes.WALLET_NOT_CONNECTED,
      error
    );
  }
  
  if (error.message?.includes('network') || error.message?.includes('fetch')) {
    return new AppError(
      ErrorMessages[ErrorCodes.NETWORK_ERROR],
      ErrorType.NETWORK,
      ErrorCategory.SYSTEM,
      ErrorCodes.NETWORK_ERROR,
      error
    );
  }
  
  if (error.message?.includes('transaction') || error.message?.includes('solana')) {
    return new AppError(
      ErrorMessages[ErrorCodes.TRANSACTION_FAILED],
      ErrorType.TRANSACTION,
      ErrorCategory.BLOCKCHAIN,
      ErrorCodes.TRANSACTION_FAILED,
      error
    );
  }
  
  // Default to unknown error
  return new AppError(
    ErrorMessages[ErrorCodes.UNKNOWN_ERROR],
    ErrorType.UNKNOWN,
    ErrorCategory.SYSTEM,
    ErrorCodes.UNKNOWN_ERROR,
    error
  );
}

// Error display component props
export interface ErrorDisplayProps {
  error: AppError;
  onRetry?: () => void;
  onDismiss?: () => void;
} 