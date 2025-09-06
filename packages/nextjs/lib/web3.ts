import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, sepolia } from "wagmi/chains";

// Get WalletConnect project ID from environment
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  console.warn("Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID. Some wallet connections may not work.");
}

export const config = getDefaultConfig({
  appName: "CitiProof",
  projectId: projectId || "2f5e02d5f2e7b7e5d9c8a1b3c4d5e6f7", // Fallback ID
  chains: [sepolia, mainnet], // Sepolia first for testnet priority
  ssr: true,
});
