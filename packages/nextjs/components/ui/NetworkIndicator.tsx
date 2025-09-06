"use client";

import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useChainId } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";

export function NetworkIndicator() {
  const chainId = useChainId();

  const chain = chainId === mainnet.id ? mainnet : chainId === sepolia.id ? sepolia : null;

  if (!chain) return null;

  const isTestnet = chain.testnet;
  const isSepolia = chain.id === 11155111;

  return (
    <Badge
      variant={isSepolia ? "default" : "destructive"}
      className={`${
        isSepolia ? "bg-blue-100 text-blue-800 hover:bg-blue-200" : "bg-orange-100 text-orange-800 hover:bg-orange-200"
      } flex items-center gap-1`}
    >
      {isSepolia ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
      {chain.name}
      {isTestnet && " (Testnet)"}
    </Badge>
  );
}
