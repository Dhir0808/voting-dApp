"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const { connected } = useWallet();
  const pathname = usePathname();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Proposals", path: "/proposals" },
    { name: "My Votes", path: "/my-votes" },
  ];

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-2xl font-bold text-primary">
              Voting dApp
            </Link>
            {connected && (
              <nav className="hidden md:flex space-x-6">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`text-sm font-medium ${
                      pathname === item.path
                        ? "text-primary"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            )}
          </div>
          <WalletMultiButton />
        </div>
      </div>
    </header>
  );
}
