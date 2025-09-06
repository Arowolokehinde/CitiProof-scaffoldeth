"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useProject } from "@/hooks/useProjects";
import { CitiProofContracts, CONTRACT_ADDRESSES } from "@/lib/contracts";
import { IPFSDataDisplay } from "@/components/ipfs/IPFSDataDisplay";
import { 
  ArrowLeft, 
  Calendar, 
  CheckCircle, 
  Copy, 
  Users, 
  Wallet,
  ExternalLink,
  FileText,
  Globe,
  DollarSign,
  AlertCircle
} from "lucide-react";

export default function ProjectDetailsPage() {
  const params = useParams();
  const projectId = params?.id ? parseInt(params.id as string) : null;
  const [copied, setCopied] = useState(false);

  // Fetch project data using our hook
  const { project, loading, error, projectDescription, descriptionLoading } = useProject(projectId);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-gray flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ens-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-neutral-gray flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-4">{error || "The requested project could not be found."}</p>
          <Link href="/projects">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const progressPercentage = project.budgetSpent > 0 
    ? (Number(project.budgetSpent) / Number(project.totalBudget)) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-neutral-gray">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <Link href="/projects">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Projects
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
            Project #{project.projectId.toString()}
          </Badge>
        </div>
      </nav>

      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Project Header */}
          <div className="mb-8">
            <h1 className="font-bold text-3xl text-gray-900 mb-2">{project.title}</h1>
            <p className="text-gray-600">
              Detailed view of project execution, funding, and progress tracking
            </p>
          </div>

          {/* Project Summary Card */}
          <Card className="shadow-lg mb-8">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl text-ens-blue mb-2">{project.title}</CardTitle>
                  <CardDescription className="text-base mb-4">
                    {project.description}
                  </CardDescription>
                </div>
                <Badge className={CitiProofContracts.getStatusColor(project.status)}>
                  {CitiProofContracts.getStatusName(project.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Wallet className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Total Budget:</span>
                  </div>
                  <p className="text-2xl font-bold text-ens-blue">
                    {CitiProofContracts.formatBudget(project.totalBudget)}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Budget Spent:</span>
                  </div>
                  <p className="text-2xl font-bold text-civic-green">
                    {CitiProofContracts.formatBudget(project.budgetSpent)}
                  </p>
                  {progressPercentage > 0 && (
                    <Progress value={progressPercentage} className="h-2" />
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">End Date:</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {CitiProofContracts.formatTimestamp(project.estimatedEndDate)}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Support Score:</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">
                    {project.citizenSupportScore?.toString() || '0'}
                  </p>
                </div>
              </div>

              {/* Government Entity Info */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Government Entity</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <code className="bg-gray-200 px-3 py-1 rounded text-sm text-gray-700">
                      {project.governmentEntity.slice(0, 10)}...{project.governmentEntity.slice(-8)}
                    </code>
                  </div>
                  <Button 
                    onClick={() => copyToClipboard(project.governmentEntity)} 
                    size="sm" 
                    variant="ghost"
                  >
                    {copied ? <CheckCircle className="w-4 h-4 text-civic-green" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Project Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* IPFS Enhanced Data Display */}
              <IPFSDataDisplay 
                data={projectDescription} 
                loading={descriptionLoading}
                title="Enhanced Project Information"
              />
              {/* Project Timeline */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Project Information</CardTitle>
                  <CardDescription>Complete project details and metadata</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Project Category</h4>
                        <Badge variant="outline">
                          {CitiProofContracts.getCategoryName(project.category)}
                        </Badge>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Project ID</h4>
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                          #{project.projectId.toString()}
                        </code>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Creation Date</h4>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>{CitiProofContracts.formatTimestamp(project.creationTimestamp)}</span>
                      </div>
                    </div>

                    {project.isPublic && (
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center space-x-2">
                          <Globe className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-green-900">Public Project</span>
                        </div>
                        <p className="text-green-800 text-sm mt-1">
                          This project is publicly visible and can be tracked by citizens
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Documentation Section */}
              {project.documentationHash && (
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Project Documentation</CardTitle>
                    <CardDescription>Official project documents and files</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">IPFS Documentation Hash:</span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <code className="text-xs text-gray-700 break-all">
                          {project.documentationHash}
                        </code>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(`https://ipfs.io/ipfs/${project.documentationHash}`, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View on IPFS
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Created</span>
                    <span className="font-semibold">
                      {CitiProofContracts.formatTimestamp(project.creationTimestamp)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge className={CitiProofContracts.getStatusColor(project.status)}>
                      {CitiProofContracts.getStatusName(project.status)}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Visibility</span>
                    <Badge variant={project.isPublic ? "default" : "secondary"}>
                      {project.isPublic ? "Public" : "Private"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full bg-ens-blue hover:bg-ens-blue/90 text-white"
                    onClick={() => window.open(`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESSES.GovernmentProjectRegistry}`, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on Etherscan
                  </Button>
                  <Link href={`/voting?project=${project.projectId}`}>
                    <Button variant="outline" className="w-full">
                      <Users className="w-4 h-4 mr-2" />
                      Vote on Project
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    Report Issue
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}