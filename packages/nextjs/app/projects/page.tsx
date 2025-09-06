"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProjectStats, useProjects, useRealTimeProjects } from "@/hooks/useProjects";
import { useProjectsWithIPFS } from "@/hooks/useProjectsWithIPFS";
import { CitiProofContracts, ProjectCategory, ProjectStatus } from "@/lib/contracts";
import {
  Activity,
  AlertTriangle,
  Building,
  Calendar,
  Clock,
  DollarSign,
  Eye,
  FileText,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Tag,
  TrendingUp,
  Users,
  Vote,
} from "lucide-react";
import { MainNavigation } from "@/components/ui/MainNavigation";

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | undefined>(undefined);
  const [categoryFilter, setCategoryFilter] = useState<ProjectCategory | undefined>(undefined);

  // Hooks - Use IPFS-enhanced projects instead of basic contract calls
  const { 
    projects: ipfsProjects, 
    loading: ipfsLoading, 
    error: ipfsError, 
    refetch: refetchIPFS, 
    totalProjects 
  } = useProjectsWithIPFS();
  const { stats, loading: statsLoading } = useProjectStats();
  const { recentActivity } = useRealTimeProjects();

  // Filter IPFS projects by status if needed
  const projects = statusFilter !== undefined 
    ? ipfsProjects.filter(project => project.status === statusFilter)
    : ipfsProjects;
  
  const loading = ipfsLoading;
  const error = ipfsError;
  const refetch = refetchIPFS;

  // Filter projects based on search and filters
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === undefined || project.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleCreateProposal = (projectId: number) => {
    // Navigate to voting page with project context
    window.location.href = `/voting?project=${projectId}&action=create`;
  };

  return (
    <div className="min-h-screen bg-neutral-gray">
      <MainNavigation 
        totalProjects={totalProjects} 
        totalProposals={0} // We'll get this from voting hook later
      />

      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-bold text-3xl text-gray-900 mb-2">Government Projects</h1>
            <p className="text-gray-600">
              Track all government projects with real-time updates and transparent funding
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card className="border-l-4 border-l-ens-blue">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Projects</p>
                    <p className="text-2xl font-bold text-ens-blue">{statsLoading ? "..." : stats.total}</p>
                  </div>
                  <Building className="w-8 h-8 text-ens-blue" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-warning">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-amber-warning">{statsLoading ? "..." : stats.pending}</p>
                  </div>
                  <Clock className="w-8 h-8 text-amber-warning" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-civic-green">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Approved</p>
                    <p className="text-2xl font-bold text-civic-green">{statsLoading ? "..." : stats.approved}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-civic-green" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">In Progress</p>
                    <p className="text-2xl font-bold text-blue-500">{statsLoading ? "..." : stats.inProgress}</p>
                  </div>
                  <Activity className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-600">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{statsLoading ? "..." : stats.completed}</p>
                  </div>
                  <Users className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Filters */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Filter className="w-5 h-5 text-ens-blue" />
                    <span>Filter Projects</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Search Projects</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search by title..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={statusFilter?.toString() || "all"}
                      onValueChange={value =>
                        setStatusFilter(value === "all" ? undefined : (Number(value) as ProjectStatus))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value={ProjectStatus.PENDING.toString()}>Pending</SelectItem>
                        <SelectItem value={ProjectStatus.APPROVED.toString()}>Approved</SelectItem>
                        <SelectItem value={ProjectStatus.IN_PROGRESS.toString()}>In Progress</SelectItem>
                        <SelectItem value={ProjectStatus.COMPLETED.toString()}>Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={categoryFilter?.toString() || "all"}
                      onValueChange={value =>
                        setCategoryFilter(value === "all" ? undefined : (Number(value) as ProjectCategory))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value={ProjectCategory.INFRASTRUCTURE.toString()}>Infrastructure</SelectItem>
                        <SelectItem value={ProjectCategory.HEALTHCARE.toString()}>Healthcare</SelectItem>
                        <SelectItem value={ProjectCategory.EDUCATION.toString()}>Education</SelectItem>
                        <SelectItem value={ProjectCategory.ENVIRONMENT.toString()}>Environment</SelectItem>
                        <SelectItem value={ProjectCategory.TECHNOLOGY.toString()}>Technology</SelectItem>
                        <SelectItem value={ProjectCategory.TRANSPORTATION.toString()}>Transportation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button onClick={refetch} variant="outline" className="w-full" disabled={loading}>
                      <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                      Refresh
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Projects List */}
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-ens-blue mx-auto mb-4" />
                    <p className="text-gray-600">Loading projects from blockchain...</p>
                  </div>
                </div>
              ) : error ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="text-red-500 mb-4">
                      <FileText className="w-12 h-12 mx-auto mb-2" />
                      <h3 className="text-lg font-semibold">Error Loading Projects</h3>
                      <p className="text-sm">{error}</p>
                    </div>
                    <Button onClick={refetch} variant="outline">
                      Try Again
                    </Button>
                  </CardContent>
                </Card>
              ) : filteredProjects.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Projects Found</h3>
                    <p className="text-gray-600 mb-4">
                      {projects.length === 0
                        ? "No projects have been registered yet."
                        : "No projects match your current filters."}
                    </p>
                    <Link href="/project-posting">
                      <Button className="bg-ens-blue hover:bg-ens-blue/90 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Project
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {filteredProjects.map(project => (
                    <Card key={project.projectId.toString()} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-2">{project.title}</CardTitle>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <Badge className={CitiProofContracts.getStatusColor(project.status)}>
                                {CitiProofContracts.getStatusName(project.status)}
                              </Badge>
                              <div className="flex items-center space-x-1">
                                <Building className="w-4 h-4" />
                                <span>{CitiProofContracts.getCategoryName(project.category)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{CitiProofContracts.formatTimestamp(project.creationTimestamp)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-ens-blue">
                              {CitiProofContracts.formatBudget(project.totalBudget)}
                            </p>
                            <p className="text-sm text-gray-600">Total Budget</p>
                            {project.budgetSpent > 0 && (
                              <p className="text-xs text-gray-500">
                                Spent: {CitiProofContracts.formatBudget(project.budgetSpent)}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {/* Show IPFS enhanced data in human-readable format */}
                        {project.ipfsData && (
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg mb-4 border border-blue-200">
                            <div className="space-y-4">
                              {/* Project Overview */}
                              <div className="bg-white p-4 rounded-lg shadow-sm">
                                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                                  <FileText className="w-4 h-4 mr-2 text-blue-600" />
                                  Project Overview
                                </h4>
                                <p className="text-gray-700 leading-relaxed text-sm">
                                  {project.ipfsData.detailedDescription || "No detailed description available."}
                                </p>
                              </div>

                              {/* Project Classification */}
                              <div className="flex flex-wrap gap-3 items-center">
                                {project.ipfsData.category && (
                                  <div className="bg-white px-3 py-2 rounded-lg border border-blue-200 flex items-center space-x-2">
                                    <Tag className="w-4 h-4 text-blue-600" />
                                    <div>
                                      <span className="text-xs text-gray-500 block">Category</span>
                                      <span className="text-sm font-medium text-gray-900">{project.ipfsData.category}</span>
                                    </div>
                                  </div>
                                )}
                                
                                {project.ipfsData.severity && (
                                  <div className={`px-3 py-2 rounded-lg border flex items-center space-x-2 ${
                                    project.ipfsData.severity.toLowerCase() === 'high' 
                                      ? 'bg-red-50 border-red-200'
                                      : project.ipfsData.severity.toLowerCase() === 'medium'
                                      ? 'bg-orange-50 border-orange-200'
                                      : 'bg-green-50 border-green-200'
                                  }`}>
                                    <AlertTriangle className={`w-4 h-4 ${
                                      project.ipfsData.severity.toLowerCase() === 'high' 
                                        ? 'text-red-600'
                                        : project.ipfsData.severity.toLowerCase() === 'medium'
                                        ? 'text-orange-600'
                                        : 'text-green-600'
                                    }`} />
                                    <div>
                                      <span className="text-xs text-gray-500 block">Priority</span>
                                      <span className="text-sm font-medium text-gray-900 capitalize">{project.ipfsData.severity} Priority</span>
                                    </div>
                                  </div>
                                )}

                                {project.ipfsData.expectedResolution && (
                                  <div className="bg-white px-3 py-2 rounded-lg border border-blue-200 flex items-center space-x-2">
                                    <Clock className="w-4 h-4 text-blue-600" />
                                    <div>
                                      <span className="text-xs text-gray-500 block">Expected Outcome</span>
                                      <span className="text-sm font-medium text-gray-900">
                                        {project.ipfsData.expectedResolution.length > 30 
                                          ? `${project.ipfsData.expectedResolution.substring(0, 30)}...`
                                          : project.ipfsData.expectedResolution
                                        }
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Government Context */}
                              {project.ipfsData.parsedContext && (
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                    <Building className="w-4 h-4 mr-2 text-purple-600" />
                                    Government Details
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {project.ipfsData.parsedContext.ministry && (
                                      <div className="flex items-start space-x-2">
                                        <Users className="w-4 h-4 text-purple-500 mt-0.5" />
                                        <div>
                                          <span className="text-xs text-gray-500 block">Responsible Ministry</span>
                                          <span className="text-sm font-medium text-gray-900">{project.ipfsData.parsedContext.ministry}</span>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {project.ipfsData.parsedContext.duration && (
                                      <div className="flex items-start space-x-2">
                                        <Clock className="w-4 h-4 text-blue-500 mt-0.5" />
                                        <div>
                                          <span className="text-xs text-gray-500 block">Project Duration</span>
                                          <span className="text-sm font-medium text-gray-900">{project.ipfsData.parsedContext.duration}</span>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {project.ipfsData.parsedContext.ensName && (
                                      <div className="flex items-start space-x-2">
                                        <Tag className="w-4 h-4 text-green-500 mt-0.5" />
                                        <div>
                                          <span className="text-xs text-gray-500 block">ENS Domain</span>
                                          <span className="text-sm font-medium text-gray-900">{project.ipfsData.parsedContext.ensName}</span>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {project.ipfsData.parsedContext.totalBudget && (
                                      <div className="flex items-start space-x-2">
                                        <DollarSign className="w-4 h-4 text-emerald-500 mt-0.5" />
                                        <div>
                                          <span className="text-xs text-gray-500 block">Allocated Budget</span>
                                          <span className="text-sm font-medium text-gray-900">{project.ipfsData.parsedContext.totalBudget}</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Project Milestones */}
                                  {project.ipfsData.parsedContext.milestones && project.ipfsData.parsedContext.milestones.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                      <h5 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                                        <TrendingUp className="w-4 h-4 mr-2 text-indigo-600" />
                                        Project Milestones ({project.ipfsData.parsedContext.milestones.length})
                                      </h5>
                                      <div className="space-y-2">
                                        {project.ipfsData.parsedContext.milestones.slice(0, 2).map((milestone: any, idx: number) => (
                                          <div key={idx} className="bg-gray-50 p-3 rounded border-l-4 border-indigo-400">
                                            <div className="flex justify-between items-start">
                                              <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">{milestone.title}</p>
                                                <p className="text-xs text-gray-600 mt-1">{milestone.description}</p>
                                              </div>
                                              {milestone.budget && (
                                                <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded ml-2">
                                                  {milestone.budget}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                        {project.ipfsData.parsedContext.milestones.length > 2 && (
                                          <p className="text-xs text-gray-500 text-center">
                                            +{project.ipfsData.parsedContext.milestones.length - 2} more milestones
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">
                              End Date: {CitiProofContracts.formatTimestamp(project.estimatedEndDate)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">
                              Support Score: {project.citizenSupportScore?.toString() || '0'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">
                              {project.documentationHash ? "Documentation Available" : "No Documentation"}
                            </span>
                          </div>
                        </div>

                        {/* Show documentation files from IPFS if available */}
                        {project.documentationFiles && project.documentationFiles.totalFiles > 0 && (
                          <div className="bg-green-50 p-3 rounded-lg mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              Documentation Files ({project.documentationFiles.totalFiles}):
                            </p>
                            <div className="space-y-1">
                              {project.documentationFiles.files.map((file: any, idx: number) => (
                                <div key={idx} className="flex items-center space-x-2 text-xs">
                                  <FileText className="w-3 h-3 text-gray-500" />
                                  <span>{file.name}</span>
                                  <span className="text-gray-500">({file.type})</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex space-x-2">
                            <Link href={`/projects/${project.projectId}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                            </Link>
                            {project.status === ProjectStatus.PENDING && (
                              <Button
                                onClick={() => handleCreateProposal(Number(project.projectId))}
                                size="sm"
                                className="bg-civic-green hover:bg-civic-green/90 text-white"
                              >
                                <Vote className="w-4 h-4 mr-2" />
                                Create Proposal
                              </Button>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">ID: #{project.projectId.toString()}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar - Recent Activity */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-civic-green" />
                    <span>Recent Activity</span>
                  </CardTitle>
                  <CardDescription>Real-time project updates</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentActivity.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
                  ) : (
                    <div className="space-y-3">
                      {recentActivity.map((activity, index) => (
                        <div key={index} className="border-l-2 border-civic-green pl-3 pb-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">
                              {activity.type === "project_registered" ? "New Project" : "Status Update"}
                            </p>
                            <span className="text-xs text-gray-500">{activity.timestamp.toLocaleTimeString()}</span>
                          </div>
                          <p className="text-xs text-gray-600">Project #{activity.projectId}</p>
                          {activity.type === "project_registered" && (
                            <p className="text-xs text-gray-600">{activity.data.title}</p>
                          )}
                          {activity.type === "status_updated" && (
                            <p className="text-xs text-gray-600">
                              Status: {CitiProofContracts.getStatusName(activity.data.newStatus)}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
