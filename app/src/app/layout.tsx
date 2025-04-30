"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "../providers/WalletProvider";
import { ErrorProvider, ErrorBoundary } from "../contexts/ErrorContext";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>
        <WalletProvider>
          <ErrorProvider>
            <ErrorBoundary>
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
                  <div className="backdrop-blur-sm bg-white/30 rounded-2xl shadow-xl border border-white/20 p-6">
                    {children}
                  </div>
                </main>
                <Footer />
              </div>
            </ErrorBoundary>
          </ErrorProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
