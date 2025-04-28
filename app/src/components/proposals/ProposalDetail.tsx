"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

// Mock data for demonstration
const mockProposal = {
  id: "1",
  title: "Should we upgrade the community center?",
  description:
    "Proposal to upgrade the community center with new facilities. This includes adding a new gym, upgrading the kitchen, and improving the parking area. The estimated cost is $500,000.",
  options: ["Yes", "No", "Maybe"],
  startTime: Date.now() / 1000,
  endTime: (Date.now() + 7 * 24 * 60 * 60 * 1000) / 1000,
  totalVotes: 42,
  isActive: true,
  results: {
    Yes: 25,
    No: 12,
    Maybe: 5,
  },
};

export function ProposalDetail({ proposalId }: { proposalId: string }) {
  const { publicKey, connected } = useWallet();
  const [proposal, setProposal] = useState(mockProposal);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // In a real app, we would fetch the proposal from the blockchain
  useEffect(() => {
    // Fetch proposal details from the blockchain
    // setProposal(fetchedProposal);
  }, [proposalId]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleVote = async () => {
    if (!selectedOption) {
      setError("Please select an option to vote");
      return;
    }

    if (!connected) {
      setError("Please connect your wallet to vote");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // In a real app, we would call the smart contract to cast the vote
      // await castVote(proposalId, selectedOption);

      // Mock successful vote
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update the mock data
      setProposal((prev) => ({
        ...prev,
        totalVotes: prev.totalVotes + 1,
        results: {
          ...prev.results,
          [selectedOption]: (prev.results[selectedOption] || 0) + 1,
        },
      }));

      setSelectedOption(null);
    } catch (err) {
      setError("Failed to cast vote. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculatePercentage = (votes: number) => {
    return ((votes / proposal.totalVotes) * 100).toFixed(1);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-bold text-gray-900">{proposal.title}</h1>
          <span
            className={`px-3 py-1 text-sm rounded ${
              proposal.isActive
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {proposal.isActive ? "Active" : "Ended"}
          </span>
        </div>

        <p className="mt-4 text-gray-600">{proposal.description}</p>

        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4">Voting Options</h2>
          <div className="space-y-4">
            {proposal.options.map((option) => (
              <div key={option} className="relative">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id={option}
                    name="vote"
                    value={option}
                    checked={selectedOption === option}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                    disabled={!proposal.isActive || isSubmitting}
                  />
                  <label
                    htmlFor={option}
                    className="ml-3 block text-sm font-medium text-gray-700"
                  >
                    {option}
                  </label>
                </div>
                {proposal.results[option] !== undefined && (
                  <div className="mt-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{proposal.results[option]} votes</span>
                      <span>
                        {calculatePercentage(proposal.results[option])}%
                      </span>
                    </div>
                    <div className="mt-1 h-2 bg-gray-200 rounded">
                      <div
                        className="h-2 bg-primary rounded"
                        style={{
                          width: `${calculatePercentage(
                            proposal.results[option]
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {formatDate(proposal.startTime)} - {formatDate(proposal.endTime)}
          </div>
          {proposal.isActive && (
            <button
              onClick={handleVote}
              disabled={!selectedOption || isSubmitting}
              className={`px-4 py-2 rounded ${
                !selectedOption || isSubmitting
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-primary text-white hover:bg-primary-dark"
              }`}
            >
              {isSubmitting ? "Submitting..." : "Cast Vote"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
