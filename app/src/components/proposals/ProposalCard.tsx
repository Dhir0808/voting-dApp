import { useState } from "react";
import { useProgram } from "../../hooks/useProgram";
import { Proposal } from "../../types/proposal";
import { useWallet } from "@solana/wallet-adapter-react";

interface ProposalCardProps {
  proposal: Proposal;
}

export function ProposalCard({ proposal }: ProposalCardProps) {
  const { vote, isLoading, error } = useProgram();
  const { publicKey } = useWallet();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const now = Date.now() / 1000;
  const isActive = proposal.startTime <= now && proposal.endTime > now;
  const hasEnded = proposal.endTime <= now;

  const handleVote = async () => {
    if (selectedOption === null || !publicKey) return;

    try {
      await vote(proposal.publicKey, selectedOption);
      setSelectedOption(null);
    } catch (err) {
      console.error("Error voting:", err);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-medium text-gray-900">{proposal.title}</h3>
        <span
          className={`px-2 py-1 text-xs rounded ${
            isActive
              ? "bg-green-100 text-green-800"
              : hasEnded
              ? "bg-gray-100 text-gray-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {isActive ? "Active" : hasEnded ? "Ended" : "Upcoming"}
        </span>
      </div>

      <p className="mt-2 text-sm text-gray-600">{proposal.description}</p>

      <div className="mt-4 space-y-2">
        {proposal.options.map((option, index) => (
          <div
            key={index}
            className={`p-2 rounded cursor-pointer ${
              selectedOption === index
                ? "bg-primary text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
            onClick={() => isActive && setSelectedOption(index)}
          >
            {option}
          </div>
        ))}
      </div>

      <div className="mt-4 text-sm text-gray-500">
        <div>Start: {formatDate(proposal.startTime)}</div>
        <div>End: {formatDate(proposal.endTime)}</div>
      </div>

      {isActive && publicKey && (
        <button
          onClick={handleVote}
          disabled={selectedOption === null || isLoading}
          className={`mt-4 w-full py-2 px-4 rounded ${
            selectedOption === null || isLoading
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-primary text-white hover:bg-primary-dark"
          }`}
        >
          {isLoading ? "Voting..." : "Vote"}
        </button>
      )}

      {error && <div className="mt-2 text-sm text-red-600">Error: {error}</div>}
    </div>
  );
}
