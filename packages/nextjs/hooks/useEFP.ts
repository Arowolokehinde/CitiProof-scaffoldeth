"use client";

import { useEffect, useState } from "react";
import { type EFPProfile, EFPService } from "@/lib/efp";
import { useChainId } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";

export function useEFPVerification(address: string | undefined) {
  const chainId = useChainId();
  const chain = chainId === sepolia.id ? sepolia : chainId === mainnet.id ? mainnet : null;
  const [profile, setProfile] = useState<EFPProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyEFP = async () => {
    if (!address || !chainId) return;

    setIsLoading(true);
    setError(null);

    try {
      const efpService = new EFPService(chainId);
      const result = await efpService.verifyEFPIdentity(address);

      if (result.success) {
        setProfile(result.profile);
      } else {
        setProfile(result.profile); // Still set profile even if not verified
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to verify EFP profile");
      console.error("EFP verification error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    profile,
    isLoading,
    error,
    verifyEFP,
    chainId,
    chainName: chain?.name,
  };
}
