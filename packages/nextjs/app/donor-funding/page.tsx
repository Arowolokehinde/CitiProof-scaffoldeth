"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle, Copy, Heart, TrendingUp, Users } from "lucide-react";

export default function DonorFundingPage() {
  const [fundingAmount, setFundingAmount] = useState("");
  const [donorEns, setDonorEns] = useState("");
  const [copied, setCopied] = useState(false);

  const multisigWallet = "ghana-infra-fund.eth";
  const walletAddress = "0x742d35Cc6634C0532925a3b8D4C9db96590c4C87";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fundingProgress = 65; // 65% funded
  const currentFunding = 325; // ETH
  const targetFunding = 500; // ETH

  const donors = [
    { ens: "world-bank.eth", amount: "150", verified: true },
    { ens: "unicef-ghana.eth", amount: "100", verified: true },
    { ens: "african-dev-bank.eth", amount: "75", verified: true },
    { ens: "anonymous-donor.eth", amount: "25", verified: false },
  ];

  const milestones = [
    { title: "Planning & Design", status: "completed", funding: 100 },
    { title: "Phase 1 Construction", status: "in-progress", funding: 200 },
    { title: "Phase 2 Construction", status: "pending", funding: 150 },
    { title: "Final Audit", status: "pending", funding: 50 },
  ];

  return (
    <div className="min-h-screen bg-neutral-gray">
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
              <div className="w-8 h-8 bg-ens-blue rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CP</span>
              </div>
              <span className="font-bold text-xl text-gray-900">CitiProof</span>
            </div>
          </div>
          <Badge variant="outline" className="text-civic-green border-civic-green">
            Donor Portal
          </Badge>
        </div>
      </nav>

      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="font-bold text-3xl text-gray-900 mb-2">Donor Funding</h1>
            <p className="text-gray-600">Fund transparent government projects and track your impact in real-time</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Funding Form */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-civic-green" />
                  <span>Fund Project</span>
                </CardTitle>
                <CardDescription>Support the Accra Road Infrastructure Development project</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-ens-blue/10 border border-ens-blue/20 rounded-lg p-4">
                  <h3 className="font-semibold text-ens-blue mb-2">accra-road.citiproof.eth</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    Road infrastructure development project in Accra, Ghana. Transparent funding with milestone-based
                    releases.
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progress:</span>
                    <span className="font-semibold text-ens-blue">
                      {currentFunding}/{targetFunding} ETH ({fundingProgress}%)
                    </span>
                  </div>
                  <Progress value={fundingProgress} className="mt-2" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-ens-blue font-medium">
                    Funding Amount (ETH)
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.0"
                    value={fundingAmount}
                    onChange={e => setFundingAmount(e.target.value)}
                    className="border-gray-300 focus:border-ens-blue focus:ring-ens-blue text-lg"
                  />
                  <p className="text-sm text-gray-500">Minimum funding: 0.1 ETH</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="donor-ens" className="text-ens-blue font-medium">
                    Donor ENS (Optional)
                  </Label>
                  <Input
                    id="donor-ens"
                    placeholder="your-organization.eth"
                    value={donorEns}
                    onChange={e => setDonorEns(e.target.value)}
                    className="border-gray-300 focus:border-ens-blue focus:ring-ens-blue"
                  />
                  <p className="text-sm text-gray-500">Leave blank for anonymous donation</p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-gray-700 font-medium">Multisig Wallet</Label>
                    <Badge className="bg-civic-green text-white">Verified</Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="font-mono text-sm text-gray-900">{multisigWallet}</p>
                    <div className="flex items-center space-x-2">
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-700 flex-1">
                        {walletAddress}
                      </code>
                      <Button
                        onClick={copyToClipboard}
                        size="sm"
                        variant="outline"
                        className="border-gray-300 bg-transparent"
                      >
                        {copied ? <CheckCircle className="w-4 h-4 text-civic-green" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <Button className="w-full bg-ens-blue hover:bg-ens-blue/90 text-white text-lg py-6">
                  Fund Project
                </Button>
              </CardContent>
            </Card>

            {/* Right Column - Donor History & Progress */}
            <div className="space-y-6">
              {/* Funding Progress */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-civic-green" />
                    <span>Funding Progress</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {milestones.map((milestone, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              milestone.status === "completed"
                                ? "bg-civic-green"
                                : milestone.status === "in-progress"
                                  ? "bg-ens-blue"
                                  : "bg-amber-warning"
                            }`}
                          ></div>
                          <div>
                            <p className="font-medium text-gray-900">{milestone.title}</p>
                            <p className="text-sm text-gray-600">{milestone.funding} ETH</p>
                          </div>
                        </div>
                        <Badge
                          className={
                            milestone.status === "completed"
                              ? "bg-civic-green text-white"
                              : milestone.status === "in-progress"
                                ? "bg-ens-blue text-white"
                                : "bg-amber-warning text-white"
                          }
                        >
                          {milestone.status === "completed"
                            ? "Completed"
                            : milestone.status === "in-progress"
                              ? "In Progress"
                              : "Pending"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Donor History */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-ens-blue" />
                    <span>Donor History</span>
                  </CardTitle>
                  <CardDescription>Recent contributions to this project</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {donors.map((donor, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-civic-green rounded-full flex items-center justify-center">
                            <Heart className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{donor.ens}</p>
                            <p className="text-sm text-gray-600">{donor.amount} ETH contributed</p>
                          </div>
                        </div>
                        {donor.verified && (
                          <Badge className="bg-civic-green text-white">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total Donors:</span>
                      <span className="font-semibold">{donors.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total Raised:</span>
                      <span className="font-semibold text-civic-green">{currentFunding} ETH</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
