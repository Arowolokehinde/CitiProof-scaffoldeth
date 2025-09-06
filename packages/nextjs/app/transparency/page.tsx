"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, ArrowLeft, CheckCircle, Clock, Eye, TrendingUp, Wallet } from "lucide-react";

export default function TransparencyDashboardPage() {
  const projects = [
    {
      id: 1,
      ens: "accra-road.citiproof.eth",
      title: "Accra Road Infrastructure",
      budget: 500,
      spent: 325,
      progress: 65,
      status: "active",
      milestones: { completed: 2, total: 4 },
    },
    {
      id: 2,
      ens: "kumasi-hospital.citiproof.eth",
      title: "Kumasi Hospital Expansion",
      budget: 600,
      spent: 150,
      progress: 25,
      status: "active",
      milestones: { completed: 1, total: 5 },
    },
    {
      id: 3,
      ens: "tamale-school.citiproof.eth",
      title: "Tamale School Renovation",
      budget: 200,
      spent: 200,
      progress: 100,
      status: "completed",
      milestones: { completed: 3, total: 3 },
    },
  ];

  const issues = [
    {
      id: 1,
      title: "Power Outage in Kumasi District",
      ministry: "power-ghana.eth",
      status: "pending",
      priority: "high",
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      title: "Road Maintenance Required",
      ministry: "roads-ghana.eth",
      status: "in-progress",
      priority: "medium",
      timestamp: "1 day ago",
    },
    {
      id: 3,
      title: "Water Supply Restoration",
      ministry: "water-ghana.eth",
      status: "resolved",
      priority: "high",
      timestamp: "3 days ago",
    },
  ];

  const wallets = [
    {
      ens: "ghana-infra-fund.eth",
      purpose: "Infrastructure Development",
      balance: 1250,
      transactions: 45,
      status: "active",
    },
    {
      ens: "education-fund.ghana.eth",
      purpose: "Education Projects",
      balance: 800,
      transactions: 23,
      status: "active",
    },
    {
      ens: "health-ministry.ghana.eth",
      purpose: "Healthcare Initiatives",
      balance: 650,
      transactions: 18,
      status: "active",
    },
  ];

  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);

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
            Transparency Portal
          </Badge>
        </div>
      </nav>

      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="font-bold text-3xl text-gray-900 mb-2">Transparency Dashboard</h1>
            <p className="text-gray-600">Real-time overview of government projects, issues, and fund flows</p>
          </div>

          {/* Overview Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-ens-blue" />
                  <span className="text-sm text-gray-600">Total Budget</span>
                </div>
                <p className="text-2xl font-bold text-ens-blue mt-2">{totalBudget} ETH</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Wallet className="w-5 h-5 text-civic-green" />
                  <span className="text-sm text-gray-600">Funds Utilized</span>
                </div>
                <p className="text-2xl font-bold text-civic-green mt-2">{totalSpent} ETH</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-amber-warning" />
                  <span className="text-sm text-gray-600">Active Projects</span>
                </div>
                <p className="text-2xl font-bold text-amber-warning mt-2">
                  {projects.filter(p => p.status === "active").length}
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span className="text-sm text-gray-600">Open Issues</span>
                </div>
                <p className="text-2xl font-bold text-red-500 mt-2">
                  {issues.filter(i => i.status !== "resolved").length}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Projects Section */}
            <div className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Active Projects</CardTitle>
                  <CardDescription>Current government projects and their progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {projects.map(project => (
                      <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-ens-blue">{project.ens}</h4>
                            <p className="text-sm text-gray-900">{project.title}</p>
                          </div>
                          <Badge
                            className={
                              project.status === "completed"
                                ? "bg-civic-green text-white"
                                : project.status === "active"
                                  ? "bg-ens-blue text-white"
                                  : "bg-amber-warning text-white"
                            }
                          >
                            {project.status === "completed"
                              ? "Completed"
                              : project.status === "active"
                                ? "Active"
                                : "Pending"}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Budget: {project.budget} ETH</span>
                            <span className="text-gray-600">Spent: {project.spent} ETH</span>
                          </div>
                          <Progress value={project.progress} className="h-2" />
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Progress: {project.progress}%</span>
                            <span>
                              Milestones: {project.milestones.completed}/{project.milestones.total}
                            </span>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-3 border-ens-blue text-ens-blue hover:bg-ens-blue hover:text-white bg-transparent"
                        >
                          Explore Details
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Fund Flow Tracker */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Government Wallet Tracker</CardTitle>
                  <CardDescription>Real-time balances and transaction activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {wallets.map(wallet => (
                      <div key={wallet.ens} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{wallet.ens}</h4>
                            <p className="text-sm text-gray-600">{wallet.purpose}</p>
                          </div>
                          <Badge className="bg-civic-green text-white">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Balance:</span>
                            <p className="font-semibold text-ens-blue">{wallet.balance} ETH</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Transactions:</span>
                            <p className="font-semibold">{wallet.transactions}</p>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-3 border-ens-blue text-ens-blue hover:bg-ens-blue hover:text-white bg-transparent"
                        >
                          Explore Details
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Issues Section */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Recent Issues</CardTitle>
                <CardDescription>Latest reported issues and their resolution status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {issues.map(issue => (
                    <div key={issue.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{issue.title}</h4>
                          <p className="text-sm text-gray-600">{issue.ministry}</p>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <Badge
                            className={
                              issue.status === "resolved"
                                ? "bg-civic-green text-white"
                                : issue.status === "in-progress"
                                  ? "bg-ens-blue text-white"
                                  : "bg-amber-warning text-white"
                            }
                          >
                            {issue.status === "resolved" && <CheckCircle className="w-3 h-3 mr-1" />}
                            {issue.status === "in-progress" && <Clock className="w-3 h-3 mr-1" />}
                            {issue.status === "pending" && <AlertTriangle className="w-3 h-3 mr-1" />}
                            {issue.status === "resolved"
                              ? "Resolved"
                              : issue.status === "in-progress"
                                ? "In Progress"
                                : "Pending"}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={
                              issue.priority === "high"
                                ? "border-red-500 text-red-500"
                                : issue.priority === "medium"
                                  ? "border-amber-500 text-amber-500"
                                  : "border-gray-500 text-gray-500"
                            }
                          >
                            {issue.priority} priority
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{issue.timestamp}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-ens-blue text-ens-blue hover:bg-ens-blue hover:text-white bg-transparent"
                        >
                          Explore Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xl font-bold text-amber-warning">
                        {issues.filter(i => i.status === "pending").length}
                      </p>
                      <p className="text-xs text-gray-600">Pending</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-ens-blue">
                        {issues.filter(i => i.status === "in-progress").length}
                      </p>
                      <p className="text-xs text-gray-600">In Progress</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-civic-green">
                        {issues.filter(i => i.status === "resolved").length}
                      </p>
                      <p className="text-xs text-gray-600">Resolved</p>
                    </div>
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
