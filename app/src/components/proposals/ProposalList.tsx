"use client";

import React, { useEffect, useState } from "react";
import { useProgram } from "../../hooks/useProgram";
import { Proposal } from "../../types/proposal";
import { VoteForm } from "./VoteForm";
import { useError } from "../../contexts/ErrorContext";
import {
  ErrorType,
  ErrorCategory,
  ErrorCodes,
} from "../../utils/errorHandling";

type FilterType = "all" | "active" | "ended";

export const ProposalList: React.FC = () => {
  const { getAllProposals, isLoading } = useProgram();
  const { addError } = useError();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [refreshing, setRefreshing] = useState(false);

  const fetchProposals = async () => {
    try {
      const fetchedProposals = await getAllProposals();
      setProposals(fetchedProposals);
    } catch (error) {
      addError(error);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const handleVoteCast = async () => {
    setRefreshing(true);
    await fetchProposals();
    setRefreshing(false);
  };

  const filteredProposals = proposals.filter((proposal) => {
    const now = Math.floor(Date.now() / 1000);
    if (filter === "active") {
      return now >= proposal.startTime && now <= proposal.endTime;
    } else if (filter === "ended") {
      return now > proposal.endTime;
    }
    return true;
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Proposals</h2>
        <div className="space-x-2">
          <button
            className={`px-4 py-2 rounded-lg ${
              filter === "all"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${
              filter === "active"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setFilter("active")}
          >
            Active
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${
              filter === "ended"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setFilter("ended")}
          >
            Ended
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading proposals...</p>
        </div>
      ) : filteredProposals.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No proposals found.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProposals.map((proposal) => (
            <div
              key={proposal.publicKey.toString()}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{proposal.title}</h3>
                <p className="text-gray-600 mb-4">{proposal.description}</p>
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-500">
                    Start: {formatDate(proposal.startTime)}
                  </p>
                  <p className="text-sm text-gray-500">
                    End: {formatDate(proposal.endTime)}
                  </p>
                </div>
                <div className="space-y-2">
                  {proposal.options.map((option, index) => (
                    <div
                      key={index}
                      className="p-2 bg-gray-50 rounded-lg text-gray-700"
                    >
                      {option}
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t">
                <VoteForm proposal={proposal} onVoteCast={handleVoteCast} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
