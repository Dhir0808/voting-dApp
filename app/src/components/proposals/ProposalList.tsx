"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Mock data for demonstration
const mockProposals = [
  {
    id: "1",
    title: "Should we upgrade the community center?",
    description:
      "Proposal to upgrade the community center with new facilities.",
    options: ["Yes", "No", "Maybe"],
    startTime: Date.now() / 1000,
    endTime: (Date.now() + 7 * 24 * 60 * 60 * 1000) / 1000,
    totalVotes: 42,
    isActive: true,
  },
  {
    id: "2",
    title: "New community garden project",
    description: "Creating a new community garden in the downtown area.",
    options: ["Approve", "Reject", "Modify"],
    startTime: (Date.now() - 2 * 24 * 60 * 60 * 1000) / 1000,
    endTime: (Date.now() + 5 * 24 * 60 * 60 * 1000) / 1000,
    totalVotes: 78,
    isActive: true,
  },
  {
    id: "3",
    title: "Community budget allocation 2023",
    description: "How should we allocate the community budget for 2023?",
    options: ["Education", "Infrastructure", "Healthcare", "Environment"],
    startTime: (Date.now() - 10 * 24 * 60 * 60 * 1000) / 1000,
    endTime: (Date.now() - 3 * 24 * 60 * 60 * 1000) / 1000,
    totalVotes: 156,
    isActive: false,
  },
];

export function ProposalList() {
  const [proposals, setProposals] = useState(mockProposals);
  const [filter, setFilter] = useState("all"); // 'all', 'active', 'ended'

  // In a real app, we would fetch proposals from the blockchain
  useEffect(() => {
    // Fetch proposals from the blockchain
    // setProposals(fetchedProposals);
  }, []);

  const filteredProposals = proposals.filter((proposal) => {
    if (filter === "active") return proposal.isActive;
    if (filter === "ended") return !proposal.isActive;
    return true;
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Proposals</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded ${
              filter === "all"
                ? "bg-primary text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`px-3 py-1 rounded ${
              filter === "active"
                ? "bg-primary text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter("ended")}
            className={`px-3 py-1 rounded ${
              filter === "ended"
                ? "bg-primary text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Ended
          </button>
        </div>
      </div>

      {filteredProposals.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No proposals found</div>
      ) : (
        <div className="space-y-4">
          {filteredProposals.map((proposal) => (
            <Link
              key={proposal.id}
              href={`/proposals/${proposal.id}`}
              className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-gray-900">
                  {proposal.title}
                </h3>
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    proposal.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {proposal.isActive ? "Active" : "Ended"}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                {proposal.description}
              </p>
              <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
                <div>
                  {proposal.options.length} options • {proposal.totalVotes}{" "}
                  votes
                </div>
                <div>
                  {formatDate(proposal.startTime)} -{" "}
                  {formatDate(proposal.endTime)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
