import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TinybirdProvider } from '@/providers/TinybirdProvider';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LLM Analytics Dashboard",
  description: "Analytics dashboard for LLM usage and metrics",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <TinybirdProvider>
          {children}
        </TinybirdProvider>
      </body>
    </html>
  );
}