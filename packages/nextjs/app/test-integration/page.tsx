"use client";

import React from "react";
import { IpfsTest } from "../../components/test/IpfsTest";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import Link from "next/link";
import { Button } from "../../components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TestIntegrationPage() {
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
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            Integration Test Suite
          </Badge>
        </div>
      </nav>

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="font-bold text-3xl text-gray-900 mb-2">
              Contract & IPFS Integration Test
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Test the complete integration between smart contracts and IPFS for CitiProof.
              Upload files, store data, and verify the decentralized storage functionality.
            </p>
          </div>

          {/* Integration Overview */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">IPFS Storage</CardTitle>
                <CardDescription>Decentralized file and data storage</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    File upload with progress tracking
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    JSON data serialization
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Multiple gateway fallbacks
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Mock mode for development
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Smart Contracts</CardTitle>
                <CardDescription>Blockchain state management</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    Project registration
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    Proposal creation & voting
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    Issue reporting system
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                    Contract methods (mock mode)
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Integrated Hooks</CardTitle>
                <CardDescription>React hooks for seamless integration</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                    useProjectRegistration
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                    useProposalCreation
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                    useIssueReporting
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                    useVotingWithReason
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* IPFS Test Component */}
          <IpfsTest />

          {/* Implementation Status */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Implementation Status</CardTitle>
                <CardDescription>Current state of the CitiProof integration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-green-700 mb-3">✅ Completed Features</h3>
                    <ul className="text-sm space-y-1 text-green-600">
                      <li>• IPFS service with fallback strategies</li>
                      <li>• File upload with drag & drop interface</li>
                      <li>• Comprehensive React hooks for IPFS operations</li>
                      <li>• Contract integration service architecture</li>
                      <li>• Data type definitions and TypeScript support</li>
                      <li>• Error handling and loading states</li>
                      <li>• Mock development mode</li>
                      <li>• Progress tracking for uploads</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-700 mb-3">🚧 In Progress / TODO</h3>
                    <ul className="text-sm space-y-1 text-amber-600">
                      <li>• Complete smart contract write methods</li>
                      <li>• Wallet integration for transaction signing</li>
                      <li>• Event listening and real-time updates</li>
                      <li>• Contract deployment configuration</li>
                      <li>• Gas estimation and optimization</li>
                      <li>• Enhanced error handling for contract calls</li>
                      <li>• Batch operations optimization</li>
                      <li>• Production IPFS node configuration</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}