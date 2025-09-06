import { createConfig, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { coinbaseWallet, injected, metaMask } from "wagmi/connectors";

export const simpleConfig = createConfig({
  chains: [mainnet, sepolia],
  connectors: [injected(), metaMask(), coinbaseWallet({ appName: "CitiProof" })],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});
