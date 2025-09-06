"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Award, Camera, CheckCircle, Clock, MapPin, Upload, X } from "lucide-react";

export default function CitizenVerificationPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const submittedProofs = [
    {
      id: 1,
      title: "Road Completion Verification",
      location: "Accra Ring Road, Sector 7",
      submitter: "ama.citiproof.eth",
      status: "verified",
      timestamp: "2 hours ago",
      image: "/road-construction-completed.jpg",
    },
    {
      id: 2,
      title: "School Building Progress",
      location: "Kumasi Central School",
      submitter: "kwame.citiproof.eth",
      status: "pending",
      timestamp: "5 hours ago",
      image: "/school-building-construction.jpg",
    },
    {
      id: 3,
      title: "Water System Installation",
      location: "Tamale District, Zone 3",
      submitter: "fatima.citiproof.eth",
      status: "verified",
      timestamp: "1 day ago",
      image: "/water-treatment-facility.png",
    },
    {
      id: 4,
      title: "Hospital Equipment Delivery",
      location: "Cape Coast Regional Hospital",
      submitter: "john.citiproof.eth",
      status: "rejected",
      timestamp: "2 days ago",
      image: "/diverse-medical-equipment.png",
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
          <Badge variant="outline" className="text-civic-green border-civic-green">
            Verification Portal
          </Badge>
        </div>
      </nav>

      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="font-bold text-3xl text-gray-900 mb-2">Citizen Verification</h1>
            <p className="text-gray-600">
              Submit proof of government project progress and earn reputation as a trusted auditor
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Upload Form */}
            <div className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Camera className="w-5 h-5 text-ens-blue" />
                    <span>Submit Verification Proof</span>
                  </CardTitle>
                  <CardDescription>Upload evidence of project progress or completion</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="photo" className="text-ens-blue font-medium">
                      Photo Evidence
                    </Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-ens-blue transition-colors">
                      <input id="photo" type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                      <label htmlFor="photo" className="cursor-pointer">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">Click to upload photo</p>
                        <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                      </label>
                    </div>
                    {selectedFile && (
                      <div className="flex items-center space-x-2 text-sm text-civic-green">
                        <CheckCircle className="w-4 h-4" />
                        <span>{selectedFile.name}</span>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">Photos are stored on IPFS for immutable verification</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-ens-blue font-medium">
                      Location
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="location"
                        placeholder="e.g., Accra Ring Road, Sector 7"
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        className="pl-10 border-gray-300 focus:border-ens-blue focus:ring-ens-blue"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-ens-blue font-medium">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what you observed, project status, or completion details..."
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      className="border-gray-300 focus:border-ens-blue focus:ring-ens-blue min-h-[100px]"
                    />
                  </div>

                  <Button className="w-full bg-ens-blue hover:bg-ens-blue/90 text-white">Submit Proof</Button>
                </CardContent>
              </Card>

              {/* Badge Preview */}
              <Card className="shadow-lg bg-civic-green/10 border-civic-green/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-civic-green">
                    <Award className="w-5 h-5" />
                    <span>NFT Audit Badge Preview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-white rounded-lg p-6 border-2 border-civic-green/20">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-civic-green rounded-full flex items-center justify-center mx-auto mb-4">
                        <Award className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-bold text-lg text-gray-900">Verified Auditor</h3>
                      <p className="text-sm text-gray-600 mb-2">ama.citiproof.eth</p>
                      <Badge className="bg-civic-green text-white">Level 3 Auditor</Badge>
                      <div className="mt-4 text-xs text-gray-500">
                        <p>Earned through verified submissions</p>
                        <p>Blockchain-verified credential</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Submitted Proofs Gallery */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Recent Verification Submissions</CardTitle>
                <CardDescription>Community-submitted proof of government project progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {submittedProofs.map(proof => (
                    <div key={proof.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start space-x-4">
                        <img
                          src={proof.image || "/placeholder.svg"}
                          alt={proof.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900">{proof.title}</h4>
                              <p className="text-sm text-gray-600 flex items-center space-x-1">
                                <MapPin className="w-3 h-3" />
                                <span>{proof.location}</span>
                              </p>
                              <p className="text-xs text-gray-500">by {proof.submitter}</p>
                            </div>
                            <Badge
                              className={
                                proof.status === "verified"
                                  ? "bg-civic-green text-white"
                                  : proof.status === "pending"
                                    ? "bg-amber-warning text-white"
                                    : "bg-red-500 text-white"
                              }
                            >
                              {proof.status === "verified" && <CheckCircle className="w-3 h-3 mr-1" />}
                              {proof.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                              {proof.status === "rejected" && <X className="w-3 h-3 mr-1" />}
                              {proof.status.charAt(0).toUpperCase() + proof.status.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">{proof.timestamp}</p>
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
    </div>
  );
}
