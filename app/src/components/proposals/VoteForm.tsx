import React, { useState } from "react";
import { useProgram } from "../../hooks/useProgram";
import { Proposal } from "../../types/proposal";
import { useError } from "../../contexts/ErrorContext";
import {
  ErrorType,
  ErrorCategory,
  ErrorCodes,
} from "../../utils/errorHandling";
import { TransactionDialog } from "../common/TransactionDialog";

interface VoteFormProps {
  proposal: Proposal;
  onVoteCast: () => void;
}

export const VoteForm: React.FC<VoteFormProps> = ({ proposal, onVoteCast }) => {
  const { vote, isLoading } = useProgram();
  const { addError } = useError();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<
    "pending" | "success" | "error"
  >("pending");
  const [transactionMessage, setTransactionMessage] = useState("");
  const [transactionHash, setTransactionHash] = useState<string>();
  const [showDialog, setShowDialog] = useState(false);

  const handleVote = async () => {
    if (selectedOption === null) {
      addError({
        message: "Please select an option to vote",
        type: ErrorType.VALIDATION,
        category: ErrorCategory.USER,
        code: ErrorCodes.INVALID_INPUT,
      });
      return;
    }

    setIsSubmitting(true);
    setShowDialog(true);
    setTransactionStatus("pending");
    setTransactionMessage("Submitting your vote...");

    try {
      const result = await vote(proposal.publicKey, selectedOption);
      if (result.success) {
        setTransactionStatus("success");
        setTransactionMessage("Your vote has been successfully recorded!");
        setTransactionHash(result.transactionHash);
        onVoteCast();
        setSelectedOption(null);
      } else {
        setTransactionStatus("error");
        setTransactionMessage("Failed to submit your vote. Please try again.");
      }
    } catch (error) {
      setTransactionStatus("error");
      setTransactionMessage("An error occurred while submitting your vote.");
      addError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    setShowDialog(false);
    if (transactionStatus === "success") {
      setSelectedOption(null);
    }
  };

  const isProposalActive = () => {
    const now = Math.floor(Date.now() / 1000);
    return now >= proposal.startTime && now <= proposal.endTime;
  };

  if (!isProposalActive()) {
    return (
      <div className="bg-gray-100 p-4 rounded-lg">
        <p className="text-gray-600 text-center">
          This proposal is no longer active for voting.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Cast Your Vote</h3>
        <div className="space-y-4">
          {proposal.options.map((option, index) => (
            <div
              key={index}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedOption === index
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300"
              }`}
              onClick={() => setSelectedOption(index)}
            >
              <div className="flex items-center">
                <div
                  className={`w-5 h-5 rounded-full border-2 mr-3 ${
                    selectedOption === index
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {selectedOption === index && (
                    <div className="w-2 h-2 bg-white rounded-full m-1.5" />
                  )}
                </div>
                <span className="text-gray-700">{option}</span>
              </div>
            </div>
          ))}
        </div>
        <button
          className={`mt-6 w-full py-2 px-4 rounded-lg text-white font-medium ${
            isSubmitting || isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
          onClick={handleVote}
          disabled={isSubmitting || isLoading || selectedOption === null}
        >
          {isSubmitting || isLoading ? "Submitting Vote..." : "Submit Vote"}
        </button>
      </div>

      <TransactionDialog
        isOpen={showDialog}
        onClose={handleDialogClose}
        title="Vote Submission"
        status={transactionStatus}
        message={transactionMessage}
        transactionHash={transactionHash}
      />
    </>
  );
};
