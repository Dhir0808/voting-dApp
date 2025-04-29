import { ErrorCode, AppError, ErrorContext } from '../types/errors';

export class ErrorService {
  private static instance: ErrorService;
  private errorHandlers: ((error: AppError) => void)[] = [];
  private errorLog: AppError[] = [];

  private constructor() {}

  static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }

  createError(
    code: ErrorCode,
    message: string,
    context?: ErrorContext,
    details?: Record<string, any>
  ): AppError {
    const error: AppError = {
      name: code,
      message,
      code,
      details,
      timestamp: Date.now(),
      context: context ? JSON.stringify(context) : undefined,
      stack: new Error().stack
    };

    this.handleError(error);
    return error;
  }

  private handleError(error: AppError): void {
    // Log the error
    this.logError(error);

    // Notify all registered handlers
    this.errorHandlers.forEach(handler => handler(error));

    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.error('Error:', {
        code: error.code,
        message: error.message,
        context: error.context,
        details: error.details,
        timestamp: new Date(error.timestamp).toISOString()
      });
    }
  }

  private logError(error: AppError): void {
    this.errorLog.push(error);
    // In a real application, you might want to send this to a logging service
  }

  registerHandler(handler: (error: AppError) => void): void {
    this.errorHandlers.push(handler);
  }

  removeHandler(handler: (error: AppError) => void): void {
    this.errorHandlers = this.errorHandlers.filter(h => h !== handler);
  }

  getErrorLog(): AppError[] {
    return [...this.errorLog];
  }

  clearErrorLog(): void {
    this.errorLog = [];
  }

  // Helper methods for common error scenarios
  handleWalletError(error: any): AppError {
    if (!error) {
      return this.createError(
        ErrorCode.WALLET_NOT_CONNECTED,
        'Wallet is not connected'
      );
    }

    if (error.message?.includes('insufficient funds')) {
      return this.createError(
        ErrorCode.INSUFFICIENT_BALANCE,
        'Insufficient balance to complete the transaction'
      );
    }

    return this.createError(
      ErrorCode.WALLET_CONNECTION_FAILED,
      'Failed to connect to wallet',
      { originalError: error }
    );
  }

  handleTransactionError(error: any): AppError {
    if (error.message?.includes('timeout')) {
      return this.createError(
        ErrorCode.TRANSACTION_TIMEOUT,
        'Transaction timed out'
      );
    }

    if (error.message?.includes('rejected')) {
      return this.createError(
        ErrorCode.TRANSACTION_REJECTED,
        'Transaction was rejected'
      );
    }

    return this.createError(
      ErrorCode.TRANSACTION_FAILED,
      'Transaction failed',
      { originalError: error }
    );
  }

  handleProgramError(error: any): AppError {
    if (error.message?.includes('not initialized')) {
      return this.createError(
        ErrorCode.PROGRAM_NOT_INITIALIZED,
        'Program is not initialized'
      );
    }

    return this.createError(
      ErrorCode.PROGRAM_NOT_INITIALIZED,
      'Program error occurred',
      { originalError: error }
    );
  }
}

// Hook to use the error service
export function useErrorService() {
  return ErrorService.getInstance();
} 