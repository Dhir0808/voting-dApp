import { useState, useEffect } from "react";
import { useProgram } from "../../hooks/useProgram";
import { Proposal } from "../../types/proposal";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export function StatisticsView() {
  const { getAllProposals, isLoading, error } = useProgram();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [stats, setStats] = useState({
    totalProposals: 0,
    activeProposals: 0,
    endedProposals: 0,
    totalVotes: 0,
    averageVotesPerProposal: 0,
    participationRate: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allProposals = await getAllProposals();
        setProposals(allProposals);

        // Calculate statistics
        const now = Date.now() / 1000;
        const activeProposals = allProposals.filter(
          (p) => p.startTime <= now && p.endTime > now
        ).length;

        const endedProposals = allProposals.filter(
          (p) => p.endTime <= now
        ).length;

        // This would need to be replaced with actual vote counts from the blockchain
        const totalVotes = allProposals.reduce((sum, p) => sum + 100, 0); // Placeholder

        setStats({
          totalProposals: allProposals.length,
          activeProposals,
          endedProposals,
          totalVotes,
          averageVotesPerProposal:
            allProposals.length > 0 ? totalVotes / allProposals.length : 0,
          participationRate: 0.75, // Placeholder - would need actual user count
        });
      } catch (err) {
        console.error("Error fetching statistics:", err);
      }
    };

    fetchData();
  }, [getAllProposals]);

  // Prepare data for the participation trend chart
  const participationData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Participation Rate",
        data: [0.65, 0.72, 0.68, 0.75, 0.82, 0.78],
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
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
        text: "Participation Trend",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
        ticks: {
          callback: (value: number) => `${(value * 100).toFixed(0)}%`,
        },
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
        Error loading statistics: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">
        Statistics & Analytics
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-medium text-gray-900">
            Proposal Overview
          </h3>
          <div className="mt-2 space-y-2">
            <p className="text-gray-600">
              Total Proposals: {stats.totalProposals}
            </p>
            <p className="text-gray-600">
              Active Proposals: {stats.activeProposals}
            </p>
            <p className="text-gray-600">
              Ended Proposals: {stats.endedProposals}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-medium text-gray-900">Voting Activity</h3>
          <div className="mt-2 space-y-2">
            <p className="text-gray-600">Total Votes: {stats.totalVotes}</p>
            <p className="text-gray-600">
              Average Votes per Proposal:{" "}
              {stats.averageVotesPerProposal.toFixed(1)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-medium text-gray-900">Participation</h3>
          <div className="mt-2 space-y-2">
            <p className="text-gray-600">
              Participation Rate: {(stats.participationRate * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Participation Trend
        </h3>
        <div className="h-64">
          <Line data={participationData} options={chartOptions} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Recent Activity
        </h3>
        <div className="space-y-4">
          {proposals.slice(0, 5).map((proposal) => (
            <div key={proposal.publicKey.toString()} className="border-b pb-2">
              <h4 className="font-medium text-gray-900">{proposal.title}</h4>
              <p className="text-sm text-gray-600">
                {new Date(proposal.endTime * 1000).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
