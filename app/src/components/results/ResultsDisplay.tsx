import { useState, useEffect } from "react";
import { useProgram } from "../../hooks/useProgram";
import { Proposal } from "../../types/proposal";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

interface ResultsDisplayProps {
  proposal: Proposal;
}

export function ResultsDisplay({ proposal }: ResultsDisplayProps) {
  const { getVoteResults, isLoading, error } = useProgram();
  const [results, setResults] = useState<number[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const voteResults = await getVoteResults(proposal.publicKey);
        setResults(voteResults);
        setTotalVotes(voteResults.reduce((sum, count) => sum + count, 0));
      } catch (err) {
        console.error("Error fetching results:", err);
      }
    };

    fetchResults();
  }, [proposal.publicKey, getVoteResults]);

  const pieChartData = {
    labels: proposal.options,
    datasets: [
      {
        data: results,
        backgroundColor: [
          "rgba(255, 99, 132, 0.8)",
          "rgba(54, 162, 235, 0.8)",
          "rgba(255, 206, 86, 0.8)",
          "rgba(75, 192, 192, 0.8)",
          "rgba(153, 102, 255, 0.8)",
          "rgba(255, 159, 64, 0.8)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const barChartData = {
    labels: proposal.options,
    datasets: [
      {
        label: "Votes",
        data: results,
        backgroundColor: "rgba(54, 162, 235, 0.8)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
      title: {
        display: true,
        text: "Voting Results",
      },
    },
  };

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
        Error loading results: {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Results for {proposal.title}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Summary</h3>
          <div className="space-y-2">
            <p className="text-gray-600">Total Votes: {totalVotes}</p>
            <p className="text-gray-600">
              Status:{" "}
              {proposal.endTime <= Date.now() / 1000 ? "Ended" : "Active"}
            </p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Vote Distribution
          </h3>
          <div className="space-y-2">
            {proposal.options.map((option, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-gray-600">{option}</span>
                <span className="font-medium">
                  {results[index]} (
                  {totalVotes > 0
                    ? Math.round((results[index] / totalVotes) * 100)
                    : 0}
                  %)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Pie Chart</h3>
          <div className="h-64">
            <Pie data={pieChartData} options={chartOptions} />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Bar Chart</h3>
          <div className="h-64">
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
