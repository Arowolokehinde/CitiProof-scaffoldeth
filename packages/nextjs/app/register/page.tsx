"use client";

import { useState } from "react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, FolderPlus, UserCheck, Wallet } from "lucide-react";
import { useAccount } from "wagmi";

export default function RegisterPage() {
  const { address, isConnected } = useAccount();
  const [registrationType, setRegistrationType] = useState<"citizen" | "project" | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CP</span>
              </div>
              <span className="font-bold text-xl text-gray-900">CitiProof</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <ConnectButton />
          </div>
        </div>
      </nav>

      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-bold text-3xl text-gray-900 mb-2">Get Started with CitiProof</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose how you'd like to participate in transparent governance. Connect your wallet to begin.
            </p>
          </div>

          {/* Wallet Connection Status */}
          <div className="mb-8">
            <Card className="border-2 border-dashed">
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isConnected ? "bg-green-500" : "bg-gray-300"
                    }`}>
                      <Wallet className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Wallet Connection</h3>
                      <p className="text-sm text-gray-600">
                        {isConnected ? `Connected: ${address?.slice(0, 6)}...${address?.slice(-4)}` : "Connect your wallet to continue"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isConnected ? (
                      <Badge className="bg-green-500 text-white">Connected</Badge>
                    ) : (
                      <ConnectButton />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Registration Options */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Citizen Registration */}
            <Card 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                registrationType === "citizen" ? "ring-2 ring-blue-500 shadow-lg" : ""
              }`}
              onClick={() => setRegistrationType("citizen")}
            >
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Citizen Registration</CardTitle>
                    <CardDescription>Register as a verified citizen to participate in governance</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Complete identity verification
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Get your CitiProof ENS subdomain
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Start voting on proposals
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Report community issues
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Link href="/onboarding">
                    <Button 
                      className="w-full"
                      disabled={!isConnected}
                      variant={registrationType === "citizen" ? "default" : "outline"}
                    >
                      Start Citizen Registration
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Project Registration */}
            <Card 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                registrationType === "project" ? "ring-2 ring-green-500 shadow-lg" : ""
              }`}
              onClick={() => setRegistrationType("project")}
            >
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <FolderPlus className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Project Registration</CardTitle>
                    <CardDescription>Submit a new government project for community review</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Submit project proposals
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Upload documentation to IPFS
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Track project milestones
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Transparent budget tracking
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Link href="/project-posting">
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={!isConnected}
                      variant={registrationType === "project" ? "default" : "outline"}
                    >
                      Create New Project
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Information */}
          <div className="mt-8">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="py-6">
                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">How CitiProof Works</h3>
                    <div className="text-sm text-blue-800 space-y-2">
                      <p>• <strong>Citizens</strong> can register to participate in governance, vote on proposals, and report issues</p>
                      <p>• <strong>Projects</strong> are submitted on-chain with complete documentation stored on IPFS</p>
                      <p>• <strong>Transparency</strong> is maintained through blockchain verification and public access</p>
                      <p>• <strong>Accountability</strong> is ensured through community oversight and immutable records</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {!isConnected && (
            <div className="mt-8 text-center">
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="py-4">
                  <p className="text-amber-800 text-sm">
                    <Wallet className="w-4 h-4 inline mr-2" />
                    Connect your wallet above to access registration options
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}