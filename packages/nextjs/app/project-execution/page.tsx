"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Calendar, CheckCircle, Clock, Copy, MapPin, Users, Wallet } from "lucide-react";

export default function ProjectExecutionPage() {
  const [copied, setCopied] = useState(false);

  const contractorWallet = "ghana-infra-fund.eth";
  const walletAddress = "0x742d35Cc6634C0532925a3b8D4C9db96590c4C87";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const milestones = [
    {
      id: 1,
      title: "Planning & Design",
      description: "Initial project planning, permits, and design approval",
      status: "completed",
      budget: 100,
      completedDate: "March 15, 2024",
      verifications: 12,
    },
    {
      id: 2,
      title: "Phase 1 Construction",
      description: "Foundation work and initial infrastructure setup",
      status: "completed",
      budget: 150,
      completedDate: "April 20, 2024",
      verifications: 8,
    },
    {
      id: 3,
      title: "Phase 2 Construction",
      description: "Main road construction and surface laying",
      status: "in-progress",
      budget: 200,
      progress: 65,
      verifications: 5,
    },
    {
      id: 4,
      title: "Final Inspection & Handover",
      description: "Quality assurance, final inspection, and project handover",
      status: "pending",
      budget: 50,
      verifications: 0,
    },
  ];

  const totalBudget = milestones.reduce((sum, m) => sum + m.budget, 0);
  const completedBudget = milestones.filter(m => m.status === "completed").reduce((sum, m) => sum + m.budget, 0);
  const overallProgress = (completedBudget / totalBudget) * 100;

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
          <Badge variant="outline" className="text-ens-blue border-ens-blue">
            Project Tracking
          </Badge>
        </div>
      </nav>

      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="font-bold text-3xl text-gray-900 mb-2">Project Execution</h1>
            <p className="text-gray-600">
              Track real-time progress of government projects with milestone-based transparency
            </p>
          </div>

          {/* Project Summary Card */}
          <Card className="shadow-lg mb-8">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl text-ens-blue mb-2">accra-road.citiproof.eth</CardTitle>
                  <CardDescription className="text-base">
                    Accra Road Infrastructure Development - Major road construction project connecting Accra to
                    surrounding communities
                  </CardDescription>
                </div>
                <Badge className="bg-ens-blue text-white">Active</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Wallet className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Total Budget:</span>
                  </div>
                  <p className="text-2xl font-bold text-ens-blue">{totalBudget} ETH</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Progress:</span>
                  </div>
                  <p className="text-2xl font-bold text-civic-green">{Math.round(overallProgress)}%</p>
                  <Progress value={overallProgress} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Contractor:</span>
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-900">{contractorWallet}</p>
                    <div className="flex items-center space-x-2">
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-700">
                        {walletAddress.slice(0, 10)}...{walletAddress.slice(-8)}
                      </code>
                      <Button onClick={copyToClipboard} size="sm" variant="ghost" className="h-6 w-6 p-0">
                        {copied ? <CheckCircle className="w-3 h-3 text-civic-green" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Button className="bg-ens-blue hover:bg-ens-blue/90 text-white">Track Progress</Button>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Project Timeline</CardTitle>
              <CardDescription>Milestone-based progress tracking with citizen verification</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {milestones.map((milestone, index) => (
                  <div key={milestone.id} className="relative">
                    {/* Timeline line */}
                    {index < milestones.length - 1 && (
                      <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                    )}

                    <div className="flex items-start space-x-4">
                      {/* Timeline dot */}
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                          milestone.status === "completed"
                            ? "bg-civic-green"
                            : milestone.status === "in-progress"
                              ? "bg-ens-blue"
                              : "bg-amber-warning"
                        }`}
                      >
                        {milestone.status === "completed" ? (
                          <CheckCircle className="w-6 h-6 text-white" />
                        ) : milestone.status === "in-progress" ? (
                          <Clock className="w-6 h-6 text-white" />
                        ) : (
                          <span className="text-white font-bold text-sm">{index + 1}</span>
                        )}
                      </div>

                      {/* Milestone content */}
                      <div className="flex-1 bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">{milestone.title}</h3>
                            <p className="text-gray-600 mt-1">{milestone.description}</p>
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

                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Budget:</span>
                            <p className="font-semibold text-ens-blue">{milestone.budget} ETH</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Citizen Verifications:</span>
                            <p className="font-semibold text-civic-green">{milestone.verifications}</p>
                          </div>
                          <div>
                            {milestone.status === "completed" ? (
                              <>
                                <span className="text-gray-600">Completed:</span>
                                <p className="font-semibold">{milestone.completedDate}</p>
                              </>
                            ) : milestone.status === "in-progress" ? (
                              <>
                                <span className="text-gray-600">Progress:</span>
                                <div className="space-y-1">
                                  <p className="font-semibold">{milestone.progress}%</p>
                                  <Progress value={milestone.progress} className="h-1" />
                                </div>
                              </>
                            ) : (
                              <>
                                <span className="text-gray-600">Status:</span>
                                <p className="font-semibold text-amber-warning">Awaiting Previous Milestone</p>
                              </>
                            )}
                          </div>
                        </div>

                        {milestone.status === "in-progress" && (
                          <div className="mt-4 bg-ens-blue/10 border border-ens-blue/20 rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-ens-blue" />
                              <span className="text-sm font-medium text-ens-blue">Current Activity:</span>
                            </div>
                            <p className="text-sm text-gray-700 mt-1">
                              Road surface laying in progress on Sector 3-5. Expected completion by end of month.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
