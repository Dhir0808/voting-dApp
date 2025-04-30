"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path
      ? "text-blue-500 font-semibold"
      : "text-gray-600 hover:text-gray-900";
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-lg bg-white/80">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link
              href="/"
              className="text-2xl font-bold text-blue-500 hover:text-blue-600 transition-colors"
            >
              VotingDApp
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/"
                className={`${isActive("/")} transition-colors duration-200`}
              >
                Home
              </Link>
              <Link
                href="/proposals"
                className={`${isActive(
                  "/proposals"
                )} transition-colors duration-200`}
              >
                Proposals
              </Link>
              <Link
                href="/create"
                className={`${isActive(
                  "/create"
                )} transition-colors duration-200`}
              >
                Create
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <WalletMultiButton className="!bg-blue-500 hover:!bg-blue-600 transition-colors duration-200 !rounded-lg" />
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden flex items-center justify-around mt-4 pb-2">
          <Link
            href="/"
            className={`${isActive("/")} transition-colors duration-200`}
          >
            Home
          </Link>
          <Link
            href="/proposals"
            className={`${isActive(
              "/proposals"
            )} transition-colors duration-200`}
          >
            Proposals
          </Link>
          <Link
            href="/create"
            className={`${isActive("/create")} transition-colors duration-200`}
          >
            Create
          </Link>
        </nav>
      </div>
    </header>
  );
}
