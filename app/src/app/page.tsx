"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";

export default function Home() {
  const { connected } = useWallet();

  return (
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-4xl font-bold mb-6">Welcome to Voting dApp</h1>
      <p className="text-lg mb-8">
        A decentralized voting platform built on Solana blockchain.
      </p>

      {!connected ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <p className="text-yellow-800">
            Please connect your wallet to start participating in proposals.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/proposals"
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">View Proposals</h2>
            <p className="text-gray-600">Browse and vote on active proposals</p>
          </Link>
          <Link
            href="/create"
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">Create Proposal</h2>
            <p className="text-gray-600">Submit a new proposal for voting</p>
          </Link>
        </div>
      )}
    </div>
  );
}
