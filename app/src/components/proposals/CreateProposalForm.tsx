"use client";

import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useProgram } from "../../hooks/useProgram";
import { useError } from "../../contexts/ErrorContext";
import {
  ErrorType,
  ErrorCategory,
  ErrorCodes,
} from "../../utils/errorHandling";
import { TransactionDialog } from "../common/TransactionDialog";

export const CreateProposalForm: React.FC = () => {
  const { publicKey } = useWallet();
  const { createNewProposal, isLoading } = useProgram();
  const { addError } = useError();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<
    "pending" | "success" | "error"
  >("pending");
  const [transactionMessage, setTransactionMessage] = useState("");
  const [transactionHash, setTransactionHash] = useState<string>();
  const [showDialog, setShowDialog] = useState(false);

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!title.trim()) {
      addError({
        message: "Please enter a title",
        type: ErrorType.VALIDATION,
        category: ErrorCategory.USER,
        code: ErrorCodes.INVALID_INPUT,
      });
      return;
    }

    if (!description.trim()) {
      addError({
        message: "Please enter a description",
        type: ErrorType.VALIDATION,
        category: ErrorCategory.USER,
        code: ErrorCodes.INVALID_INPUT,
      });
      return;
    }

    if (options.some((option) => !option.trim())) {
      addError({
        message: "Please fill in all options",
        type: ErrorType.VALIDATION,
        category: ErrorCategory.USER,
        code: ErrorCodes.INVALID_INPUT,
      });
      return;
    }

    const startTimestamp = Math.floor(new Date(startTime).getTime() / 1000);
    const endTimestamp = Math.floor(new Date(endTime).getTime() / 1000);

    if (startTimestamp >= endTimestamp) {
      addError({
        message: "End time must be after start time",
        type: ErrorType.VALIDATION,
        category: ErrorCategory.USER,
        code: ErrorCodes.INVALID_INPUT,
      });
      return;
    }

    setIsSubmitting(true);
    setShowDialog(true);
    setTransactionStatus("pending");
    setTransactionMessage("Creating your proposal...");

    try {
      const result = await createNewProposal(
        title,
        description,
        options,
        startTimestamp,
        endTimestamp
      );

      if (result.success) {
        setTransactionStatus("success");
        setTransactionMessage("Your proposal has been successfully created!");
        setTransactionHash(result.transactionHash);
        // Reset form
        setTitle("");
        setDescription("");
        setOptions(["", ""]);
        setStartTime("");
        setEndTime("");
      } else {
        setTransactionStatus("error");
        setTransactionMessage(
          "Failed to create your proposal. Please try again."
        );
      }
    } catch (error) {
      setTransactionStatus("error");
      setTransactionMessage("An error occurred while creating your proposal.");
      addError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    setShowDialog(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter proposal title"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter proposal description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Options
          </label>
          {options.map((option, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder={`Option ${index + 1}`}
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleRemoveOption(index)}
                  className="ml-2 p-2 text-red-500 hover:text-red-700"
                >
                  <svg
                    className="h-5 w-5"
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
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddOption}
            className="mt-2 text-sm text-blue-500 hover:text-blue-700"
          >
            + Add Option
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="startTime"
              className="block text-sm font-medium text-gray-700"
            >
              Start Time
            </label>
            <input
              type="datetime-local"
              id="startTime"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="endTime"
              className="block text-sm font-medium text-gray-700"
            >
              End Time
            </label>
            <input
              type="datetime-local"
              id="endTime"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className={`w-full py-2 px-4 rounded-lg text-white font-medium ${
            isSubmitting || isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isSubmitting || isLoading
            ? "Creating Proposal..."
            : "Create Proposal"}
        </button>
      </form>

      <TransactionDialog
        isOpen={showDialog}
        onClose={handleDialogClose}
        title="Proposal Creation"
        status={transactionStatus}
        message={transactionMessage}
        transactionHash={transactionHash}
      />
    </>
  );
};
