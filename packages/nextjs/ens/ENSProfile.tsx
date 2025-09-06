"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatENSName, isCitiProofDomain, useENSProfile } from "@/hooks/useENS";
import { CheckCircle, ExternalLink, Github, Twitter, User } from "lucide-react";

interface ENSProfileProps {
  identifier: string; // Can be ENS name or wallet address
  showFullProfile?: boolean;
  className?: string;
}

export function ENSProfile({ identifier, showFullProfile = false, className = "" }: ENSProfileProps) {
  const { profile, isLoading, error } = useENSProfile(identifier);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </CardHeader>
        {showFullProfile && (
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        )}
      </Card>
    );
  }

  if (error || !profile) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <User className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">{error || "No ENS profile found"}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayName = formatENSName(profile.name);
  const isVerifiedCitizen = isCitiProofDomain(profile.name);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={profile.avatar || undefined} />
            <AvatarFallback>
              {profile.name
                ? profile.name.charAt(0).toUpperCase()
                : profile.address
                  ? profile.address.slice(2, 4).toUpperCase()
                  : "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-lg">
                {displayName || `${profile.address?.slice(0, 6)}...${profile.address?.slice(-4)}`}
              </h3>
              {isVerifiedCitizen && (
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified Citizen
                </Badge>
              )}
            </div>
            {profile.name && profile.address && (
              <p className="text-sm text-gray-500">
                {profile.address.slice(0, 6)}...{profile.address.slice(-4)}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      {showFullProfile && (
        <CardContent className="space-y-4">
          {profile.description && (
            <div>
              <h4 className="font-medium mb-2">About</h4>
              <p className="text-sm text-gray-600">{profile.description}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {profile.twitter && (
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => window.open(`https://twitter.com/${profile.twitter}`, "_blank")}
              >
                <Twitter className="w-4 h-4 mr-1" />
                Twitter
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            )}

            {profile.github && (
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => window.open(`https://github.com/${profile.github}`, "_blank")}
              >
                <Github className="w-4 h-4 mr-1" />
                GitHub
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            )}

            {profile.name && (
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => window.open(`https://app.ens.domains/name/${profile.name}`, "_blank")}
              >
                ENS Profile
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            )}
          </div>

          {isVerifiedCitizen && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">CitiProof Verification</h4>
              <p className="text-sm text-blue-700">
                This citizen has completed identity verification and is eligible to participate in governance oversight
                and reporting.
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// Compact version for use in lists/tables
export function ENSProfileCompact({ identifier, className = "" }: ENSProfileProps) {
  const { profile, isLoading } = useENSProfile(identifier);

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Skeleton className="w-6 h-6 rounded-full" />
        <Skeleton className="h-4 w-20" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
          <User className="w-3 h-3 text-gray-400" />
        </div>
        <span className="text-sm text-gray-500">Unknown</span>
      </div>
    );
  }

  const displayName = formatENSName(profile.name);
  const isVerifiedCitizen = isCitiProofDomain(profile.name);

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Avatar className="w-6 h-6">
        <AvatarImage src={profile.avatar || undefined} />
        <AvatarFallback className="text-xs">
          {profile.name
            ? profile.name.charAt(0).toUpperCase()
            : profile.address
              ? profile.address.slice(2, 4).toUpperCase()
              : "U"}
        </AvatarFallback>
      </Avatar>
      <div className="flex items-center space-x-1">
        <span className="text-sm font-medium">
          {displayName || `${profile.address?.slice(0, 6)}...${profile.address?.slice(-4)}`}
        </span>
        {isVerifiedCitizen && <CheckCircle className="w-3 h-3 text-blue-600" />}
      </div>
    </div>
  );
}
