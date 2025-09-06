"use client";

import { useState } from "react";
import Link from "next/link";
import { IpfsHashDisplay, IpfsUploader } from "@/components/ipfs/IpfsUploader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { CitiProofIPFS, type ProposalDescription, type IssueDescription } from "@/lib/ipfs";
import { useProjectRegistration } from "@/hooks/useContractIpfs";
import { GovernmentAuth } from "@/components/ui/GovernmentAuth";
import {
  AlertCircle,
  ArrowLeft,
  Building,
  Calendar,
  CheckCircle,
  FileText,
  Plus,
  Target,
  Trash2,
  Upload,
  Wallet,
} from "lucide-react";
import { parseEther } from "viem";
import { useAccount } from "wagmi";


interface Milestone {
  id: number;
  title: string;
  description: string;
  budget: string;
}

interface ProjectFormData {
  title: string;
  ensName: string;
  description: string;
  ministry: string;
  category: string;
  expectedDuration: string;
  estimatedEndDate: string;
}

export default function ProjectPostingPage() {
  // Form state
  const [formData, setFormData] = useState<ProjectFormData>({
    title: "",
    ensName: "",
    description: "",
    ministry: "",
    category: "0", // INFRASTRUCTURE
    expectedDuration: "365", // days
    estimatedEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default to 1 year from now
  });

  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: 1, title: "Planning & Design", description: "Initial project planning and design phase", budget: "100" },
    { id: 2, title: "Execution", description: "Main construction and implementation", budget: "300" },
    { id: 3, title: "Audit & Completion", description: "Final audit and project completion", budget: "100" },
  ]);

  // IPFS and contract states
  const [documentationFiles, setDocumentationFiles] = useState<File[]>([]);
  const [projectRegistered, setProjectRegistered] = useState(false);

  // Hooks
  const { address, isConnected } = useAccount();
  const { registerProject, loading: isRegistering, error } = useProjectRegistration();

  // IPFS hooks

  // Handlers
  const addMilestone = () => {
    const newId = Math.max(...milestones.map(m => m.id)) + 1;
    setMilestones([...milestones, { id: newId, title: "", description: "", budget: "" }]);
  };

  const removeMilestone = (id: number) => {
    setMilestones(milestones.filter(m => m.id !== id));
  };

  const updateMilestone = (id: number, field: string, value: string) => {
    setMilestones(milestones.map(m => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const totalBudget = milestones.reduce((sum, m) => sum + (Number.parseFloat(m.budget) || 0), 0);

  // Handle documentation file upload
  const handleDocumentationUpload = (hash: string, file: File) => {
    setDocumentationFiles(prev => [...prev, file]);
    toast({
      title: "Documentation Uploaded",
      description: `${file.name} successfully uploaded to IPFS`,
    });
  };

  // Register project using our integrated hook
  const handleRegisterProject = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to register the project",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title || !formData.description || !formData.estimatedEndDate || milestones.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields including end date",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create description object for IPFS storage
      const description: IssueDescription = {
        detailedDescription: formData.description,
        category: `Government Project - Category ${formData.category}`,
        severity: "medium",
        expectedResolution: `Expected completion by ${formData.estimatedEndDate}`,
        additionalContext: JSON.stringify({
          ministry: formData.ministry,
          ensName: formData.ensName,
          duration: formData.expectedDuration + " days",
          totalBudget: totalBudget + " ETH",
          milestones: milestones.map(m => ({
            title: m.title,
            description: m.description,
            budget: m.budget + " ETH"
          }))
        })
      };

      // Convert end date to timestamp
      const endDateTimestamp = BigInt(Math.floor(new Date(formData.estimatedEndDate).getTime() / 1000));

      const projectId = await registerProject({
        title: formData.title,
        description: description,
        category: parseInt(formData.category),
        expectedBudget: parseEther(totalBudget.toString()),
        estimatedDuration: endDateTimestamp,
        milestones: milestones.map(m => m.title),
        milestoneBudgets: milestones.map(m => parseEther(m.budget || "0")),
        documents: documentationFiles
      });

      setProjectRegistered(true);
      toast({
        title: "Project Registered Successfully!",
        description: `Your project has been registered with ID: ${projectId}`,
      });
    } catch (err) {
      toast({
        title: "Registration Failed",
        description: err instanceof Error ? err.message : "Failed to register project",
        variant: "destructive",
      });
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
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <Badge variant="outline" className="text-civic-green border-civic-green">
                Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-amber-warning border-amber-warning">
                Wallet Not Connected
              </Badge>
            )}
            <Badge variant="outline" className="text-ens-blue border-ens-blue">
              Government Portal
            </Badge>
          </div>
        </div>
      </nav>

      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="font-bold text-3xl text-gray-900 mb-2">Project Posting</h1>
            <p className="text-gray-600">
              Register a new government project for transparent tracking and citizen oversight with IPFS documentation
            </p>
          </div>

          {/* Government Authorization Check */}
          <div className="mb-8">
            <GovernmentAuth />
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Form */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="w-5 h-5 text-ens-blue" />
                  <span>Project Details</span>
                </CardTitle>
                <CardDescription>Fill in the project information for blockchain registration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-ens-blue font-medium">
                    Project Title *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={e => updateFormData("title", e.target.value)}
                    placeholder="e.g., Accra Road Infrastructure Development"
                    className="border-gray-300 focus:border-ens-blue focus:ring-ens-blue"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ens-name" className="text-ens-blue font-medium">
                    ENS Project Name
                  </Label>
                  <div className="flex">
                    <Input
                      id="ens-name"
                      value={formData.ensName}
                      onChange={e => updateFormData("ensName", e.target.value)}
                      placeholder="accra-road"
                      className="border-gray-300 focus:border-ens-blue focus:ring-ens-blue rounded-r-none"
                    />
                    <div className="bg-gray-100 border border-l-0 border-gray-300 px-3 py-2 rounded-r-md text-gray-600">
                      .citiproof.eth
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-ens-blue font-medium">
                    Project Description *
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={e => updateFormData("description", e.target.value)}
                    placeholder="Detailed description of the project objectives, scope, and expected outcomes..."
                    className="border-gray-300 focus:border-ens-blue focus:ring-ens-blue min-h-[100px]"
                  />
                  <p className="text-sm text-gray-500">This will be stored on IPFS for detailed documentation</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ministry" className="text-ens-blue font-medium">
                    Ministry/Department
                  </Label>
                  <Input
                    id="ministry"
                    value={formData.ministry}
                    onChange={e => updateFormData("ministry", e.target.value)}
                    placeholder="Ministry of Roads and Highways"
                    className="border-gray-300 focus:border-ens-blue focus:ring-ens-blue"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration" className="text-ens-blue font-medium">
                      Expected Duration (days)
                    </Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.expectedDuration}
                      onChange={e => updateFormData("expectedDuration", e.target.value)}
                      placeholder="365"
                      className="border-gray-300 focus:border-ens-blue focus:ring-ens-blue"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-ens-blue font-medium">
                      Estimated End Date *
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.estimatedEndDate}
                      onChange={e => updateFormData("estimatedEndDate", e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="border-gray-300 focus:border-ens-blue focus:ring-ens-blue"
                    />
                  </div>
                </div>

                {/* Documentation Upload */}
                <div className="space-y-2">
                  <Label className="text-ens-blue font-medium">Project Documentation (IPFS)</Label>
                  <IpfsUploader
                    onUploadComplete={handleDocumentationUpload}
                    acceptedFileTypes={["application/pdf", "text/*", "image/*"]}
                    maxFileSize={50 * 1024 * 1024}
                    className="border-dashed border-2 border-gray-300 rounded-lg p-4"
                  />
                  {documentationFiles.length > 0 && (
                    <div className="text-sm text-gray-600 mt-2">
                      {documentationFiles.length} file(s) selected for upload
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-ens-blue font-medium">Project Milestones *</Label>
                    <Button
                      onClick={addMilestone}
                      size="sm"
                      variant="outline"
                      className="border-ens-blue text-ens-blue hover:bg-ens-blue hover:text-white bg-transparent"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Milestone
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {milestones.map(milestone => (
                      <div key={milestone.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <Input
                            placeholder="Milestone title"
                            value={milestone.title}
                            onChange={e => updateMilestone(milestone.id, "title", e.target.value)}
                            className="flex-1 mr-2 border-gray-300 focus:border-ens-blue focus:ring-ens-blue"
                          />
                          <Button
                            onClick={() => removeMilestone(milestone.id)}
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <Textarea
                          placeholder="Milestone description"
                          value={milestone.description}
                          onChange={e => updateMilestone(milestone.id, "description", e.target.value)}
                          className="border-gray-300 focus:border-ens-blue focus:ring-ens-blue"
                        />
                        <div className="flex items-center space-x-2">
                          <Label className="text-sm text-gray-600">Budget (ETH):</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={milestone.budget}
                            onChange={e => updateMilestone(milestone.id, "budget", e.target.value)}
                            className="w-24 border-gray-300 focus:border-ens-blue focus:ring-ens-blue"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>


                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <p className="text-sm text-red-800">Registration failed: {error}</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  {projectRegistered ? (
                    <Button disabled className="bg-civic-green text-white px-8">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Project Registered
                    </Button>
                  ) : (
                    <Button
                      onClick={handleRegisterProject}
                      disabled={!isConnected || isRegistering}
                      className="bg-ens-blue hover:bg-ens-blue/90 text-white px-8"
                    >
                      {isRegistering ? (
                        <>
                          <Upload className="w-4 h-4 mr-2 animate-spin" />
                          Registering Project...
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4 mr-2" />
                          Register Project
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Right Column - Preview */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-civic-green" />
                  <span>Project Preview</span>
                </CardTitle>
                <CardDescription>How your project will appear on the blockchain</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-xl text-gray-900">
                      {formData.ensName || "your-project"}.citiproof.eth
                    </h3>
                    <Badge className={projectRegistered ? "bg-civic-green text-white" : "bg-amber-warning text-white"}>
                      {projectRegistered ? "Registered" : "Pending"}
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Wallet className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Total Funding Goal:</span>
                      <span className="font-semibold text-ens-blue">{totalBudget} ETH</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Building className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Ministry:</span>
                      <span className="font-medium">{formData.ministry || "Not specified"}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Duration:</span>
                      <span className="font-medium">{formData.expectedDuration} days</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">End Date:</span>
                      <span className="font-medium">{formData.estimatedEndDate || "Not set"}</span>
                    </div>

                    {documentationFiles.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Documentation:</span>
                        <span className="font-medium text-civic-green">{documentationFiles.length} file(s) ready for IPFS</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Project Milestones</h4>
                  <div className="space-y-3">
                    {milestones.map((milestone, index) => (
                      <div
                        key={milestone.id}
                        className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg"
                      >
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{milestone.title || `Milestone ${index + 1}`}</p>
                          <p className="text-sm text-gray-600">{milestone.description || "No description provided"}</p>
                          <p className="text-sm text-ens-blue font-medium">Budget: {milestone.budget || "0"} ETH</p>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            projectRegistered
                              ? "text-civic-green border-civic-green"
                              : "text-amber-warning border-amber-warning"
                          }
                        >
                          {projectRegistered ? "Registered" : "Pending"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-civic-green/10 border border-civic-green/20 rounded-lg p-4">
                  <h4 className="font-semibold text-civic-green mb-2">Transparency Features</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Real-time fund tracking on blockchain</li>
                    <li>• Citizen verification system</li>
                    <li>• Immutable milestone records</li>
                    <li>• IPFS documentation storage</li>
                    <li>• Public audit trail</li>
                  </ul>
                </div>

              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
