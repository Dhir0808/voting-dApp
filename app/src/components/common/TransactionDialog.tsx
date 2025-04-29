import React from "react";
import { Dialog } from "@headlessui/react";

interface TransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  status: "pending" | "success" | "error";
  message: string;
  transactionHash?: string;
}

export const TransactionDialog: React.FC<TransactionDialogProps> = ({
  isOpen,
  onClose,
  title,
  status,
  message,
  transactionHash,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case "pending":
        return "text-blue-500";
      case "success":
        return "text-green-500";
      case "error":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "pending":
        return (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        );
      case "success":
        return (
          <svg
            className="h-8 w-8 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        );
      case "error":
        return (
          <svg
            className="h-8 w-8 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-10 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded-lg p-6 max-w-sm w-full mx-4">
          <div className="flex flex-col items-center">
            <div className={`mb-4 ${getStatusColor()}`}>{getStatusIcon()}</div>
            <Dialog.Title className="text-xl font-semibold mb-2">
              {title}
            </Dialog.Title>
            <p className="text-gray-600 text-center mb-4">{message}</p>
            {transactionHash && (
              <div className="w-full bg-gray-50 p-3 rounded-lg mb-4">
                <p className="text-sm text-gray-500 break-all">
                  Transaction: {transactionHash}
                </p>
              </div>
            )}
            <button
              className={`w-full py-2 px-4 rounded-lg text-white font-medium ${
                status === "pending"
                  ? "bg-blue-500 hover:bg-blue-600"
                  : status === "success"
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-red-500 hover:bg-red-600"
              }`}
              onClick={onClose}
            >
              {status === "pending" ? "Processing..." : "Close"}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
