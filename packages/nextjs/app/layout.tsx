import React, { Suspense } from "react";
import "./globals.css";
import { IpfsProvider } from "@/components/ipfs/IpfsProvider";
import { Toaster } from "@/components/ui/toaster";
import { Web3Provider } from "@/providers/Web3Provider";
import { NotificationProvider } from "@/components/ui/NotificationProvider";
import { Analytics } from "@vercel/analytics/next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CitiProof - Citizen Onboarding",
  description: "Complete your citizen verification and onboarding process",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Web3Provider>
          <IpfsProvider>
            <NotificationProvider>
              <Suspense fallback={null}>{children}</Suspense>
              <Toaster />
            </NotificationProvider>
          </IpfsProvider>
        </Web3Provider>
        <Analytics />
      </body>
    </html>
  );
}
