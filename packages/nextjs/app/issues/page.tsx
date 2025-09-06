"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, ArrowLeft, Building, CheckCircle, Clock, Upload } from "lucide-react";

export default function IssueReportingPage() {
  const [issueTitle, setIssueTitle] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [selectedMinistry, setSelectedMinistry] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const ministries = [
    { value: "power-ghana.eth", label: "Ministry of Power" },
    { value: "roads-ghana.eth", label: "Ministry of Roads & Highways" },
    { value: "health-ghana.eth", label: "Ministry of Health" },
    { value: "education-ghana.eth", label: "Ministry of Education" },
    { value: "water-ghana.eth", label: "Ministry of Water Resources" },
  ];

  const recentIssues = [
    {
      id: 1,
      title: "Broken Transformer in Kumasi",
      description: "Power transformer has been down for 3 days affecting 200+ households",
      ministry: "power-ghana.eth",
      status: "pending",
      timestamp: "2 hours ago",
      reporter: "kwame.citiproof.eth",
    },
    {
      id: 2,
      title: "Pothole on Accra-Tema Highway",
      description: "Large pothole causing traffic delays and vehicle damage",
      ministry: "roads-ghana.eth",
      status: "resolved",
      timestamp: "1 day ago",
      reporter: "ama.citiproof.eth",
    },
    {
      id: 3,
      title: "Water Shortage in Tamale District",
      description: "Community has been without clean water for over a week",
      ministry: "water-ghana.eth",
      status: "pending",
      timestamp: "3 days ago",
      reporter: "fatima.citiproof.eth",
    },
    {
      id: 4,
      title: "School Roof Leakage",
      description: "Classroom roof leaking during rainy season affecting students",
      ministry: "education-ghana.eth",
      status: "in-progress",
      timestamp: "5 days ago",
      reporter: "john.citiproof.eth",
    },
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

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
          <Badge variant="outline" className="text-amber-warning border-amber-warning">
            Issue Reporting
          </Badge>
        </div>
      </nav>

      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="font-bold text-3xl text-gray-900 mb-2">Issue Reporting</h1>
            <p className="text-gray-600">Report infrastructure problems and track government response in real-time</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Report Form */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-amber-warning" />
                  <span>Report New Issue</span>
                </CardTitle>
                <CardDescription>Submit infrastructure or service issues for government attention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-ens-blue font-medium">
                    Issue Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Broken streetlight on Main Road"
                    value={issueTitle}
                    onChange={e => setIssueTitle(e.target.value)}
                    className="border-gray-300 focus:border-ens-blue focus:ring-ens-blue"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-ens-blue font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Provide detailed description of the issue, location, and impact on the community..."
                    value={issueDescription}
                    onChange={e => setIssueDescription(e.target.value)}
                    className="border-gray-300 focus:border-ens-blue focus:ring-ens-blue min-h-[120px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photo" className="text-ens-blue font-medium">
                    Upload Photo (Optional)
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-ens-blue transition-colors">
                    <input id="photo" type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                    <label htmlFor="photo" className="cursor-pointer">
                      <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Click to upload photo evidence</p>
                    </label>
                  </div>
                  {selectedFile && (
                    <div className="flex items-center space-x-2 text-sm text-civic-green">
                      <CheckCircle className="w-4 h-4" />
                      <span>{selectedFile.name}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-ens-blue font-medium">Select Ministry/Department</Label>
                  <Select value={selectedMinistry} onValueChange={setSelectedMinistry}>
                    <SelectTrigger className="border-gray-300 focus:border-ens-blue focus:ring-ens-blue">
                      <SelectValue placeholder="Choose responsible ministry" />
                    </SelectTrigger>
                    <SelectContent>
                      {ministries.map(ministry => (
                        <SelectItem key={ministry.value} value={ministry.value}>
                          <div className="flex items-center space-x-2">
                            <Building className="w-4 h-4 text-gray-500" />
                            <span>{ministry.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end">
                  <Button className="bg-ens-blue hover:bg-ens-blue/90 text-white px-8">Report Issue</Button>
                </div>
              </CardContent>
            </Card>

            {/* Right Column - Issue Feed */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Recent Issue Reports</CardTitle>
                <CardDescription>Community-reported issues and their resolution status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentIssues.map(issue => (
                    <div key={issue.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{issue.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                        </div>
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
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span>Reported by {issue.reporter}</span>
                          <div className="flex items-center space-x-1">
                            <Building className="w-3 h-3" />
                            <span>{issue.ministry}</span>
                          </div>
                        </div>
                        <span>{issue.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-amber-warning">12</p>
                      <p className="text-xs text-gray-600">Pending</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-ens-blue">8</p>
                      <p className="text-xs text-gray-600">In Progress</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-civic-green">24</p>
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
