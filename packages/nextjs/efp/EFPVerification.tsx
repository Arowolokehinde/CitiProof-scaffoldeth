"use client";

import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEFPVerification } from "@/hooks/useEFP";
import type { EFPProfile } from "@/lib/efp";
import { AlertCircle, CheckCircle, ExternalLink, Loader2, Network, Shield, UserPlus, Users } from "lucide-react";
import { useChainId } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";

interface EFPVerificationProps {
  walletAddress?: string;
  onVerificationComplete?: (verified: boolean, profile: EFPProfile | null) => void;
}

export function EFPVerification({ walletAddress, onVerificationComplete }: EFPVerificationProps) {
  const chainId = useChainId();
  const chain = chainId === sepolia.id ? sepolia : chainId === mainnet.id ? mainnet : null;
  const { profile, isLoading, error, verifyEFP } = useEFPVerification(walletAddress);
  const [hasVerified, setHasVerified] = useState(false);

  const handleVerify = async () => {
    await verifyEFP();
    setHasVerified(true);
    if (profile) {
      onVerificationComplete?.(profile.isVerified, profile);
    }
  };

  const getVerificationBadge = (level: string) => {
    switch (level) {
      case "verified":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        );
      case "basic":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Basic
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <AlertCircle className="w-3 h-3 mr-1" />
            Unverified
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            EFP Identity Verification
          </CardTitle>
          <CardDescription>
            Verify your identity using Ethereum Follow Protocol to build trust in the CitiProof network
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!walletAddress ? (
            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>Please connect your wallet first to verify your EFP identity</AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500 uppercase font-medium mb-1">Wallet Address</p>
                    <p className="font-mono text-sm text-gray-900">
                      {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {chain && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Network className="w-3 h-3" />
                        {chain.name}
                      </Badge>
                    )}
                    <Button onClick={handleVerify} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4 mr-2" />
                          Verify EFP
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {chain?.testnet && (
                  <Alert className="border-blue-200 bg-blue-50">
                    <Network className="w-4 h-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      🧪 Connected to {chain.name} testnet. EFP verification will use real EFP API data.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {hasVerified && error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              {hasVerified && profile?.isVerified && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    {chain?.testnet ? "🧪 " : ""}EFP verification successful! Found {profile.followerCount} followers
                    and {profile.followingCount} following.
                    {chain?.testnet && " (Real EFP API data)"}
                  </AlertDescription>
                </Alert>
              )}

              {profile && profile.isVerified && (
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-green-900">
                      <span>EFP Profile Verified</span>
                      {getVerificationBadge(profile.verificationLevel)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                        <Users className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-500">Followers</p>
                          <p className="font-semibold text-gray-900">{profile.followerCount}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                        <UserPlus className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm text-gray-500">Following</p>
                          <p className="font-semibold text-gray-900">{profile.followingCount}</p>
                        </div>
                      </div>
                    </div>

                    {profile.listTokenId && (
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div>
                          <p className="text-sm text-gray-500">EFP List Token ID</p>
                          <p className="font-mono text-sm text-gray-900">#{profile.listTokenId}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open("https://ethfollow.xyz", "_blank")}
                        >
                          View Profile
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    )}

                    <div className="bg-green-100 p-4 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">✅ Verification Benefits Unlocked</h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Enhanced reputation scoring</li>
                        <li>• Priority report review</li>
                        <li>• Access to advanced governance features</li>
                        <li>• Verified citizen badge</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}

              {hasVerified && profile && !profile.isVerified && (
                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader>
                    <CardTitle className="text-orange-900">Create Your EFP Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-orange-800">
                      Don't have an EFP profile yet? Create one to verify your identity and build trust in the web3
                      community.
                    </p>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => window.open("https://ethfollow.xyz", "_blank")}
                        className="border-orange-300 text-orange-800 hover:bg-orange-100"
                      >
                        Create EFP Profile
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => window.open("https://docs.ethfollow.xyz", "_blank")}
                        className="border-orange-300 text-orange-800 hover:bg-orange-100"
                      >
                        Learn About EFP
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
