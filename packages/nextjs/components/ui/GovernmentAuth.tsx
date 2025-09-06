"use client";

import { useState, useEffect } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { AlertCircle, CheckCircle, Shield, User } from 'lucide-react';
import { CitiProofContracts } from '@/lib/contracts';
import { toast } from './use-toast';

export function GovernmentAuth() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  // Check authorization status when component mounts or address changes
  useEffect(() => {
    checkAuthorizationStatus();
  }, [address, isConnected]);

  const checkAuthorizationStatus = async () => {
    if (!address) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const authorized = await CitiProofContracts.checkGovernmentAuthorization(address);
      setIsAuthorized(authorized);
    } catch (error) {
      console.error("Error checking authorization:", error);
      setIsAuthorized(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthorizeEntity = async () => {
    if (!walletClient || !address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to authorize",
        variant: "destructive",
      });
      return;
    }

    setIsAuthorizing(true);

    try {
      await CitiProofContracts.authorizeGovernmentEntity(walletClient, address, true);
      
      toast({
        title: "Authorization Successful!",
        description: "You are now authorized as a government entity",
      });
      
      // Refresh authorization status
      await checkAuthorizationStatus();
    } catch (error: any) {
      toast({
        title: "Authorization Failed",
        description: error?.message || "Failed to authorize government entity. You may need owner permissions.",
        variant: "destructive",
      });
    } finally {
      setIsAuthorizing(false);
    }
  };

  if (!isConnected) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="py-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-sm text-amber-800 font-medium">Wallet Required</p>
              <p className="text-xs text-amber-700">Connect your wallet to check government authorization</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-gray-400 animate-spin" />
            <p className="text-sm text-gray-600">Checking authorization status...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-2 ${isAuthorized ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Shield className={`w-5 h-5 ${isAuthorized ? 'text-green-600' : 'text-red-600'}`} />
          <span>Government Authorization</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <User className={`w-4 h-4 ${isAuthorized ? 'text-green-600' : 'text-red-600'}`} />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
              <p className="text-xs text-gray-600">Current Wallet Address</p>
            </div>
          </div>
          <Badge variant={isAuthorized ? "default" : "destructive"} className={isAuthorized ? "bg-green-500" : ""}>
            {isAuthorized ? (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                Authorized
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3 mr-1" />
                Not Authorized
              </>
            )}
          </Badge>
        </div>

        <div className={`p-3 rounded-lg border ${isAuthorized ? 'border-green-200 bg-green-100' : 'border-red-200 bg-red-100'}`}>
          <p className={`text-sm ${isAuthorized ? 'text-green-800' : 'text-red-800'}`}>
            {isAuthorized ? (
              <>
                ✅ You are authorized to create government projects. You can proceed with project registration.
              </>
            ) : (
              <>
                ❌ Your address is not authorized as a government entity. You need authorization to create projects.
              </>
            )}
          </p>
        </div>

        {!isAuthorized && (
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Authorization requires owner permissions. If you're the contract owner or admin, 
                you can self-authorize. Otherwise, contact the system administrator.
              </p>
            </div>
            
            <Button
              onClick={handleAuthorizeEntity}
              disabled={isAuthorizing}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isAuthorizing ? (
                <>
                  <Shield className="w-4 h-4 mr-2 animate-spin" />
                  Authorizing...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Self-Authorize as Government Entity
                </>
              )}
            </Button>
          </div>
        )}

        {isAuthorized && (
          <Button
            onClick={checkAuthorizationStatus}
            variant="outline"
            size="sm"
            className="w-full"
          >
            Refresh Authorization Status
          </Button>
        )}
      </CardContent>
    </Card>
  );
}