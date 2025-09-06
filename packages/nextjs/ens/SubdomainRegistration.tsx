"use client";

import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useENSAddress } from "@/hooks/useENS";
import { AlertCircle, CheckCircle, Loader2, User } from "lucide-react";

interface SubdomainRegistrationProps {
  walletAddress?: string;
  onRegistrationComplete?: (subdomain: string) => void;
}

export function SubdomainRegistration({ walletAddress, onRegistrationComplete }: SubdomainRegistrationProps) {
  const [desiredName, setDesiredName] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [availability, setAvailability] = useState<{
    available: boolean;
    message: string;
  } | null>(null);
  const [registrationStatus, setRegistrationStatus] = useState<{
    status: "idle" | "pending" | "success" | "error";
    message: string;
  }>({ status: "idle", message: "" });

  const { address: existingAddress, isLoading: isResolvingAddress } = useENSAddress(
    desiredName ? `${desiredName}.citiproof.eth` : undefined,
  );

  const checkAvailability = async () => {
    if (!desiredName.trim()) return;

    setIsChecking(true);

    // Simulate availability check
    // In a real implementation, this would check against your smart contract
    setTimeout(() => {
      const isAvailable = !existingAddress && desiredName.length >= 3;
      setAvailability({
        available: isAvailable,
        message: isAvailable
          ? `${desiredName}.citiproof.eth is available!`
          : existingAddress
            ? `${desiredName}.citiproof.eth is already taken`
            : "Name must be at least 3 characters long",
      });
      setIsChecking(false);
    }, 1000);
  };

  const handleRegister = async () => {
    if (!walletAddress || !availability?.available) return;

    setIsRegistering(true);
    setRegistrationStatus({ status: "pending", message: "Registering subdomain..." });

    try {
      // Simulate registration process
      // In a real implementation, this would call your smart contract
      await new Promise(resolve => setTimeout(resolve, 3000));

      setRegistrationStatus({
        status: "success",
        message: `Successfully registered ${desiredName}.citiproof.eth!`,
      });

      onRegistrationComplete?.(desiredName);
    } catch (error) {
      setRegistrationStatus({
        status: "error",
        message: "Registration failed. Please try again.",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const isNameValid = desiredName.length >= 3 && /^[a-zA-Z0-9-]+$/.test(desiredName);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Register Your CitiProof Identity
        </CardTitle>
        <CardDescription>
          Claim your unique .citiproof.eth subdomain to establish your verified citizen identity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="subdomain">Choose Your Subdomain</Label>
          <div className="flex items-center space-x-2">
            <div className="flex-1 flex items-center">
              <Input
                id="subdomain"
                value={desiredName}
                onChange={e => {
                  setDesiredName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                  setAvailability(null);
                  setRegistrationStatus({ status: "idle", message: "" });
                }}
                placeholder="yourname"
                className="rounded-r-none"
                disabled={isRegistering}
              />
              <div className="px-3 py-2 bg-gray-50 border border-l-0 rounded-r-md text-sm text-gray-600">
                .citiproof.eth
              </div>
            </div>
            <Button
              onClick={checkAvailability}
              disabled={!isNameValid || isChecking || isResolvingAddress}
              variant="outline"
            >
              {isChecking || isResolvingAddress ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check"}
            </Button>
          </div>
          {!isNameValid && desiredName && (
            <p className="text-sm text-red-600">
              Name must be at least 3 characters and contain only letters, numbers, and hyphens
            </p>
          )}
        </div>

        {availability && (
          <Alert className={availability.available ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            {availability.available ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <AlertDescription className={availability.available ? "text-green-800" : "text-red-800"}>
              {availability.message}
            </AlertDescription>
          </Alert>
        )}

        {availability?.available && (
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900">Registration Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Subdomain:</span>
                <code className="font-mono text-blue-900">{desiredName}.citiproof.eth</code>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Wallet:</span>
                <code className="font-mono text-blue-900">
                  {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Not connected"}
                </code>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Registration Fee:</span>
                <Badge variant="secondary">Free for Citizens</Badge>
              </div>
            </div>
          </div>
        )}

        {registrationStatus.status !== "idle" && (
          <Alert
            className={
              registrationStatus.status === "success"
                ? "border-green-200 bg-green-50"
                : registrationStatus.status === "error"
                  ? "border-red-200 bg-red-50"
                  : "border-blue-200 bg-blue-50"
            }
          >
            {registrationStatus.status === "success" ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : registrationStatus.status === "error" ? (
              <AlertCircle className="w-4 h-4 text-red-600" />
            ) : (
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            )}
            <AlertDescription
              className={
                registrationStatus.status === "success"
                  ? "text-green-800"
                  : registrationStatus.status === "error"
                    ? "text-red-800"
                    : "text-blue-800"
              }
            >
              {registrationStatus.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3">
          <Button
            onClick={handleRegister}
            disabled={!availability?.available || !walletAddress || isRegistering}
            className="flex-1"
          >
            {isRegistering ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Registering...
              </>
            ) : (
              "Register Subdomain"
            )}
          </Button>
        </div>

        {!walletAddress && (
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>Please connect your wallet to register a subdomain</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
