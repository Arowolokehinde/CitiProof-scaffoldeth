"use client";

import { useState } from "react";
import { ENSProfile } from "./ENSProfile";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useENSProfile } from "@/hooks/useENS";
import { AlertCircle, CheckCircle, Loader2, Shield } from "lucide-react";

interface CitizenVerificationProps {
  onVerificationComplete?: (verified: boolean, profile: any) => void;
}

export function CitizenVerification({ onVerificationComplete }: CitizenVerificationProps) {
  const [identifier, setIdentifier] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    message: string;
    level: "verified" | "partial" | "unverified";
  } | null>(null);

  const { profile, isLoading, error } = useENSProfile(identifier);

  const handleVerify = async () => {
    if (!profile) return;

    setIsVerifying(true);

    // Simulate verification process
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verification logic
    const hasENSName = !!profile.name;
    const isCitiProofDomain = profile.name?.endsWith(".citiproof.eth") || false;
    const hasProfile = !!(profile.description || profile.twitter || profile.github);

    let verified = false;
    let message = "";
    let level: "verified" | "partial" | "unverified" = "unverified";

    if (isCitiProofDomain && hasProfile) {
      verified = true;
      level = "verified";
      message = "Full CitiProof verification complete! This citizen is eligible for all platform features.";
    } else if (hasENSName && hasProfile) {
      verified = true;
      level = "partial";
      message = "Partial verification complete. Consider registering a .citiproof.eth domain for full benefits.";
    } else if (hasENSName) {
      verified = false;
      level = "partial";
      message = "Basic ENS identity found. Please complete your profile for verification.";
    } else {
      verified = false;
      level = "unverified";
      message = "No ENS identity found. Please register an ENS name to begin verification.";
    }

    setVerificationResult({ verified, message, level });
    onVerificationComplete?.(verified, profile);
    setIsVerifying(false);
  };

  const getVerificationBadge = () => {
    if (!verificationResult) return null;

    switch (verificationResult.level) {
      case "verified":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Fully Verified
          </Badge>
        );
      case "partial":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Partially Verified
          </Badge>
        );
      case "unverified":
        return (
          <Badge variant="destructive">
            <AlertCircle className="w-3 h-3 mr-1" />
            Unverified
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Citizen Identity Verification
          </CardTitle>
          <CardDescription>
            Verify your identity using ENS to access CitiProof features and build reputation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="identifier">ENS Name or Wallet Address</Label>
            <div className="flex space-x-2">
              <Input
                id="identifier"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder="vitalik.eth or 0x..."
                disabled={isVerifying}
              />
              <Button
                onClick={handleVerify}
                disabled={!identifier || isLoading || isVerifying || !profile}
                variant="outline"
              >
                {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {verificationResult && (
            <Alert
              className={
                verificationResult.level === "verified"
                  ? "border-green-200 bg-green-50"
                  : verificationResult.level === "partial"
                    ? "border-yellow-200 bg-yellow-50"
                    : "border-red-200 bg-red-50"
              }
            >
              <div className="flex items-start space-x-2">
                {verificationResult.level === "verified" ? (
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">{getVerificationBadge()}</div>
                  <AlertDescription
                    className={
                      verificationResult.level === "verified"
                        ? "text-green-800"
                        : verificationResult.level === "partial"
                          ? "text-yellow-800"
                          : "text-red-800"
                    }
                  >
                    {verificationResult.message}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>

      {profile && (
        <ENSProfile identifier={identifier} showFullProfile={true} className="border-t-4 border-t-blue-500" />
      )}

      {verificationResult?.level === "verified" && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-900 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Verification Complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-green-800">🎉 Welcome to CitiProof! You can now:</p>
              <ul className="text-sm text-green-700 space-y-1 ml-4">
                <li>• Submit verified reports on government projects</li>
                <li>• Participate in community voting</li>
                <li>• Build your reputation as a civic auditor</li>
                <li>• Access exclusive transparency tools</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
