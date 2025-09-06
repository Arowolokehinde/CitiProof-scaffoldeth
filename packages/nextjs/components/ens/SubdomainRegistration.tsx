"use client";

import React, { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, ExternalLink, Loader2, User } from "lucide-react";
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";
import { parseAbiItem } from "viem";

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


  // Check availability from smart contract
  const { refetch: refetchAvailability } = useReadContract({
    address: CONTRACT_ADDRESSES.CitizenIdentityRegistry as `0x${string}`,
    abi: [
      parseAbiItem("function isENSNameAvailable(string memory _ensName) external view returns (bool)")
    ],
    functionName: "isENSNameAvailable",
    args: [`${desiredName}.citiproof.eth`],
    enabled: false,
  });

  // Check if wallet is already registered
  const { data: isWalletRegistered, refetch: refetchWalletStatus } = useReadContract({
    address: CONTRACT_ADDRESSES.CitizenIdentityRegistry as `0x${string}`,
    abi: [
      parseAbiItem("function walletToCitizenId(address) external view returns (uint256)")
    ],
    functionName: "walletToCitizenId",
    args: [walletAddress as `0x${string}`],
    enabled: !!walletAddress,
  });

  const isNameValid = desiredName.length >= 3 && /^[a-zA-Z0-9-]+$/.test(desiredName);

  const checkAvailability = async () => {
    if (!desiredName.trim() || !isNameValid) return;

    setIsChecking(true);
    
    try {
      // Check against smart contract
      const result = await refetchAvailability();
      const available = result.data as boolean;
      
      setAvailability({
        available,
        message: available
          ? `${desiredName}.citiproof.eth is available!`
          : `${desiredName}.citiproof.eth is already taken`,
      });
    } catch (error) {
      console.error("Error checking availability:", error);
      setAvailability({
        available: false,
        message: "Error checking availability. Please try again.",
      });
    } finally {
      setIsChecking(false);
    }
  };

  // Contract interaction hooks
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const handleRegister = async () => {
    if (!walletAddress || !availability?.available || !desiredName) return;

    setIsRegistering(true);
    setRegistrationStatus({ status: "pending", message: "Initiating transaction..." });

    try {
      // Call the registerCitizen function with the chosen subdomain
      writeContract({
        address: CONTRACT_ADDRESSES.CitizenIdentityRegistry as `0x${string}`,
        abi: [
          parseAbiItem("function registerCitizen(string memory _ensName, string memory _efpTokenId, uint256 _efpFollowers, uint256 _efpFollowing, string memory _ipfsMetadata) external")
        ],
        functionName: "registerCitizen",
        args: [
          `${desiredName}.citiproof.eth`, // ENS name
          "", // EFP token ID (empty for now)
          0n, // EFP followers
          0n, // EFP following  
          "" // IPFS metadata (empty for now)
        ],
      });

      setRegistrationStatus({ 
        status: "pending", 
        message: "Transaction submitted, waiting for confirmation..." 
      });

    } catch (err: any) {
      console.error("Registration error:", err);
      setRegistrationStatus({
        status: "error",
        message: err?.message?.includes("Wallet already registered") 
          ? "This wallet is already registered"
          : err?.message?.includes("ENS name already registered")
          ? "This ENS name is already taken"
          : "Registration failed. Please try again.",
      });
      setIsRegistering(false);
    }
  };

  // Handle transaction states with useEffect
  React.useEffect(() => {
    if (isConfirmed && isRegistering && hash) {
      setRegistrationStatus({
        status: "success",
        message: `Successfully registered ${desiredName}.citiproof.eth! View on Etherscan`,
      });
      onRegistrationComplete?.(desiredName);
      setIsRegistering(false);
    }
  }, [isConfirmed, isRegistering, hash, desiredName, onRegistrationComplete]);

  React.useEffect(() => {
    if (error && isRegistering) {
      setRegistrationStatus({
        status: "error",
        message: error.message.includes("Wallet already registered") 
          ? "This wallet is already registered"
          : error.message.includes("ENS name already registered")
          ? "This ENS name is already taken"
          : "Registration failed. Please try again.",
      });
      setIsRegistering(false);
    }
  }, [error, isRegistering]);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Register Your CitiProof Identity
        </CardTitle>
        <CardDescription>
          Choose your unique .citiproof.eth subdomain to establish your verified citizen identity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Show warning if wallet is already registered */}
        {isWalletRegistered && Number(isWalletRegistered) > 0 && (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Wallet Already Registered:</strong> This wallet is already registered with citizen ID #{Number(isWalletRegistered)}. 
              Each wallet can only register once. You can update your ENS name later if needed.
            </AlertDescription>
          </Alert>
        )}

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
              disabled={!isNameValid || isChecking}
              variant="outline"
            >
              {isChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check"}
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
              <div className="flex items-center justify-between">
                <span>{registrationStatus.message.replace(" View on Etherscan", "")}</span>
                {registrationStatus.status === "success" && hash && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://sepolia.etherscan.io/tx/${hash}`, '_blank')}
                    className="ml-2"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Verify on Etherscan
                  </Button>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {registrationStatus.status === "success" && hash && (
          <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-900">Registration Successful!</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-green-700">Your Domain:</span>
                <code className="font-mono text-green-900">{desiredName}.citiproof.eth</code>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-green-700">Transaction:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(`https://sepolia.etherscan.io/tx/${hash}`, '_blank')}
                  className="text-green-700 hover:text-green-900 p-0 h-auto"
                >
                  {hash.slice(0, 10)}...{hash.slice(-8)}
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-green-700">Contract:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESSES.CitizenIdentityRegistry}`, '_blank')}
                  className="text-green-700 hover:text-green-900 p-0 h-auto"
                >
                  View Contract
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={handleRegister}
            disabled={
              !availability?.available || 
              !walletAddress || 
              isRegistering || 
              isPending || 
              isConfirming ||
              (isWalletRegistered && Number(isWalletRegistered) > 0)
            }
            className="flex-1"
          >
            {isRegistering || isPending || isConfirming ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {isPending ? "Confirm in wallet..." : isConfirming ? "Confirming..." : "Registering..."}
              </>
            ) : isWalletRegistered && Number(isWalletRegistered) > 0 ? (
              "Wallet Already Registered"
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
