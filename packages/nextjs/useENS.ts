import { useEffect, useState } from "react";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { normalize } from "viem/ens";

// Create a public client for ENS operations - ENS only works on mainnet
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

export function useENSName(address: string | undefined) {
  const [ensName, setEnsName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setEnsName(null);
      return;
    }

    const resolveENS = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const name = await publicClient.getEnsName({
          address: address as `0x${string}`,
        });
        setEnsName(name);
      } catch (err) {
        setError("Failed to resolve ENS name");
        console.error("ENS resolution error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    resolveENS();
  }, [address]);

  return { ensName, isLoading, error };
}

export function useENSAddress(name: string | undefined) {
  const [address, setAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!name) {
      setAddress(null);
      return;
    }

    const resolveAddress = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const normalizedName = normalize(name);
        const resolvedAddress = await publicClient.getEnsAddress({
          name: normalizedName,
        });
        setAddress(resolvedAddress);
      } catch (err) {
        setError("Failed to resolve ENS address");
        console.error("ENS address resolution error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    resolveAddress();
  }, [name]);

  return { address, isLoading, error };
}

export function useENSAvatar(name: string | undefined) {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!name) {
      setAvatar(null);
      return;
    }

    const resolveAvatar = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const normalizedName = normalize(name);
        const avatarUrl = await publicClient.getEnsAvatar({
          name: normalizedName,
        });
        setAvatar(avatarUrl);
      } catch (err) {
        setError("Failed to resolve ENS avatar");
        console.error("ENS avatar resolution error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    resolveAvatar();
  }, [name]);

  return { avatar, isLoading, error };
}

export function useENSProfile(identifier: string | undefined) {
  const [profile, setProfile] = useState<{
    name: string | null;
    address: string | null;
    avatar: string | null;
    description: string | null;
    twitter: string | null;
    github: string | null;
    verified: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!identifier) {
      setProfile(null);
      return;
    }

    const resolveProfile = async () => {
      setIsLoading(true);
      setError(null);

      try {
        let name: string | null = null;
        let address: string | null = null;

        // Determine if identifier is an address or ENS name
        if (identifier.startsWith("0x")) {
          address = identifier;
          name = await publicClient.getEnsName({ address: identifier as `0x${string}` });
        } else {
          name = identifier;
          address = await publicClient.getEnsAddress({ name: normalize(identifier) });
        }

        let avatar: string | null = null;
        let description: string | null = null;
        let twitter: string | null = null;
        let github: string | null = null;

        if (name) {
          const normalizedName = normalize(name);

          // Get avatar
          try {
            avatar = await publicClient.getEnsAvatar({ name: normalizedName });
          } catch (e) {
            console.log("No avatar found");
          }

          // Get text records
          try {
            description = await publicClient.getEnsText({
              name: normalizedName,
              key: "description",
            });
          } catch (e) {
            console.log("No description found");
          }

          try {
            twitter = await publicClient.getEnsText({
              name: normalizedName,
              key: "com.twitter",
            });
          } catch (e) {
            console.log("No twitter found");
          }

          try {
            github = await publicClient.getEnsText({
              name: normalizedName,
              key: "com.github",
            });
          } catch (e) {
            console.log("No github found");
          }
        }

        // Check if this is a CitiProof subdomain
        const verified = name?.endsWith(".citiproof.eth") || false;

        setProfile({
          name,
          address,
          avatar,
          description,
          twitter,
          github,
          verified,
        });
      } catch (err) {
        setError("Failed to resolve ENS profile");
        console.error("ENS profile resolution error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    resolveProfile();
  }, [identifier]);

  return { profile, isLoading, error };
}

// Helper function to format ENS names for display
export function formatENSName(name: string | null): string {
  if (!name) return "";

  // If it's a CitiProof subdomain, show the full name
  if (name.endsWith(".citiproof.eth")) {
    return name;
  }

  // For other ENS names, truncate if too long
  if (name.length > 20) {
    return name.slice(0, 10) + "..." + name.slice(-7);
  }

  return name;
}

// Helper function to check if a name is a CitiProof subdomain
export function isCitiProofDomain(name: string | null): boolean {
  return name?.endsWith(".citiproof.eth") || false;
}
