"use client";

import { useWallet } from "@solana/wallet-adapter-react";

export default function Home() {
  const { connected } = useWallet();

  return (
    <div className="container mx-auto px-4">
      {connected ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Create Proposal</h2>
            <button className="w-full bg-primary text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors">
              New Proposal
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Active Proposals</h2>
            <div className="space-y-4">
              <p className="text-gray-600">No active proposals</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Connect your wallet to start voting
          </h2>
          <p className="text-gray-600">
            Use the button in the top right to connect your Solana wallet
          </p>
        </div>
      )}
    </div>
  );
}
