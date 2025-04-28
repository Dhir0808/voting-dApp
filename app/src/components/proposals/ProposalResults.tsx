"use client";

import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Mock data for demonstration
const mockResults = {
  id: "1",
  title: "Should we upgrade the community center?",
  totalVotes: 42,
  results: {
    Yes: 25,
    No: 12,
    Maybe: 5,
  },
  voterTurnout: 65, // percentage
  timeDistribution: {
    "Day 1": 15,
    "Day 2": 10,
    "Day 3": 8,
    "Day 4": 5,
    "Day 5": 4,
  },
};

export function ProposalResults({ proposalId }: { proposalId: string }) {
  const [results, setResults] = useState(mockResults);
  const [activeTab, setActiveTab] = useState<"overview" | "charts">("overview");

  // In a real app, we would fetch results from the blockchain
  useEffect(() => {
    // Fetch results from the blockchain
    // setResults(fetchedResults);
  }, [proposalId]);

  const calculatePercentage = (votes: number) => {
    return ((votes / results.totalVotes) * 100).toFixed(1);
  };

  const chartData = {
    labels: Object.keys(results.results),
    datasets: [
      {
        label: "Votes",
        data: Object.values(results.results),
        backgroundColor: [
          "rgba(75, 192, 192, 0.6)",
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
        ],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const timeChartData = {
    labels: Object.keys(results.timeDistribution),
    datasets: [
      {
        label: "Votes per Day",
        data: Object.values(results.timeDistribution),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Vote Distribution",
      },
    },
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {results.title}
        </h2>

        <div className="mb-6">
          <div className="flex space-x-4 border-b">
            <button
              className={`pb-2 ${
                activeTab === "overview"
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={`pb-2 ${
                activeTab === "charts"
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("charts")}
            >
              Charts
            </button>
          </div>
        </div>

        {activeTab === "overview" ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Total Votes</h3>
                <p className="text-3xl font-bold text-primary">
                  {results.totalVotes}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Voter Turnout</h3>
                <p className="text-3xl font-bold text-primary">
                  {results.voterTurnout}%
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Vote Breakdown</h3>
              {Object.entries(results.results).map(([option, votes]) => (
                <div key={option} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{option}</span>
                    <span>
                      {votes} votes ({calculatePercentage(votes)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded">
                    <div
                      className="h-2 bg-primary rounded"
                      style={{ width: `${calculatePercentage(votes)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Vote Distribution</h3>
              <div className="h-64">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">
                Voting Activity Over Time
              </h3>
              <div className="h-64">
                <Bar
                  data={timeChartData}
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      title: {
                        display: true,
                        text: "Daily Vote Distribution",
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
