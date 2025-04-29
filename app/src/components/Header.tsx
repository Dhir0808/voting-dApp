"use client";

import { FC } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const Header: FC = () => {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Proposals", path: "/proposals" },
    { name: "My Votes", path: "/my-votes" },
  ];

  return (
    <header className="flex justify-between items-center p-4 bg-gray-800 text-white">
      <div className="flex items-center space-x-6">
        <Link href="/" className="text-xl font-bold hover:text-gray-300">
          Voting dApp
        </Link>
        <nav className="hidden md:flex space-x-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`hover:text-gray-300 ${
                pathname === item.path
                  ? "text-primary"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
      <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700" />
    </header>
  );
};
