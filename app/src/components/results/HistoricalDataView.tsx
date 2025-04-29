import { useState, useEffect } from "react";
import { useProgram } from "../../hooks/useProgram";
import { Proposal } from "../../types/proposal";
import { ResultsDisplay } from "./ResultsDisplay";

export function HistoricalDataView() {
  const { getAllProposals, isLoading, error } = useProgram();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(
    null
  );
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year" | "all">(
    "all"
  );

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const allProposals = await getAllProposals();
        setProposals(allProposals);
      } catch (err) {
        console.error("Error fetching proposals:", err);
      }
    };

    fetchProposals();
  }, [getAllProposals]);

  const filterProposalsByTimeRange = (proposals: Proposal[]) => {
    const now = Date.now() / 1000;
    const oneWeek = 7 * 24 * 60 * 60;
    const oneMonth = 30 * 24 * 60 * 60;
    const oneYear = 365 * 24 * 60 * 60;

    return proposals.filter((proposal) => {
      if (timeRange === "all") return true;

      const timeSinceEnd = now - proposal.endTime;
      switch (timeRange) {
        case "week":
          return timeSinceEnd <= oneWeek;
        case "month":
          return timeSinceEnd <= oneMonth;
        case "year":
          return timeSinceEnd <= oneYear;
        default:
          return true;
      }
    });
  };

  const filteredProposals = filterProposalsByTimeRange(proposals);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded">
        Error loading historical data: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Historical Data</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeRange("week")}
            className={`px-4 py-2 rounded ${
              timeRange === "week"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Last Week
          </button>
          <button
            onClick={() => setTimeRange("month")}
            className={`px-4 py-2 rounded ${
              timeRange === "month"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Last Month
          </button>
          <button
            onClick={() => setTimeRange("year")}
            className={`px-4 py-2 rounded ${
              timeRange === "year"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Last Year
          </button>
          <button
            onClick={() => setTimeRange("all")}
            className={`px-4 py-2 rounded ${
              timeRange === "all"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {filteredProposals.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No historical data found for the selected time range
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProposals.map((proposal) => (
              <div
                key={proposal.publicKey.toString()}
                className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedProposal(proposal)}
              >
                <h3 className="text-lg font-medium text-gray-900">
                  {proposal.title}
                </h3>
                <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                  {proposal.description}
                </p>
                <div className="mt-2 text-sm text-gray-500">
                  Ended:{" "}
                  {new Date(proposal.endTime * 1000).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>

          {selectedProposal && (
            <div className="mt-8">
              <button
                onClick={() => setSelectedProposal(null)}
                className="mb-4 text-primary hover:text-primary-dark"
              >
                ← Back to list
              </button>
              <ResultsDisplay proposal={selectedProposal} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
