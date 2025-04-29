"use client";

import React from "react";
import {
  ErrorDisplayProps,
  ErrorType,
  ErrorCategory,
} from "../../utils/errorHandling";

export function ErrorDisplay({ error, onRetry, onDismiss }: ErrorDisplayProps) {
  // Determine the appropriate icon and color based on error type
  const getErrorStyles = () => {
    switch (error.type) {
      case ErrorType.WALLET:
        return {
          icon: "🔑",
          bgColor: "bg-yellow-50",
          textColor: "text-yellow-800",
          borderColor: "border-yellow-200",
        };
      case ErrorType.NETWORK:
        return {
          icon: "🌐",
          bgColor: "bg-blue-50",
          textColor: "text-blue-800",
          borderColor: "border-blue-200",
        };
      case ErrorType.TRANSACTION:
        return {
          icon: "💸",
          bgColor: "bg-red-50",
          textColor: "text-red-800",
          borderColor: "border-red-200",
        };
      case ErrorType.VALIDATION:
        return {
          icon: "⚠️",
          bgColor: "bg-orange-50",
          textColor: "text-orange-800",
          borderColor: "border-orange-200",
        };
      default:
        return {
          icon: "❓",
          bgColor: "bg-gray-50",
          textColor: "text-gray-800",
          borderColor: "border-gray-200",
        };
    }
  };

  const styles = getErrorStyles();

  return (
    <div
      className={`p-4 rounded-md border ${styles.bgColor} ${styles.borderColor} ${styles.textColor}`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3 text-xl">{styles.icon}</div>
        <div className="flex-1">
          <h3 className="text-sm font-medium">Error: {error.code}</h3>
          <div className="mt-1 text-sm">{error.message}</div>

          {error.details && (
            <div className="mt-2 text-xs opacity-75">
              <details>
                <summary>Technical Details</summary>
                <pre className="mt-1 p-2 bg-black bg-opacity-10 rounded overflow-auto max-h-32">
                  {JSON.stringify(error.details, null, 2)}
                </pre>
              </details>
            </div>
          )}

          <div className="mt-3 flex space-x-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-3 py-1 text-xs font-medium rounded bg-white border border-current hover:bg-opacity-10"
              >
                Try Again
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="px-3 py-1 text-xs font-medium rounded bg-white border border-current hover:bg-opacity-10"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
