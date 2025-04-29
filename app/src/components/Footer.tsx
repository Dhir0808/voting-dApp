import { FC } from "react";

export const Footer: FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-4 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm">
          © {new Date().getFullYear()} Voting dApp. Built on Solana.
        </p>
      </div>
    </footer>
  );
};
