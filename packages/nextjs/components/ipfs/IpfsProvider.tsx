/**
 * IPFS Provider component for CitiProof
 * Initializes IPFS connection and provides context
 */
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ipfsService } from "../../lib/ipfs";

/**
 * IPFS Provider component for CitiProof
 * Initializes IPFS connection and provides context
 */

/**
 * IPFS Provider component for CitiProof
 * Initializes IPFS connection and provides context
 */

interface IpfsContextType {
  initialized: boolean;
  error: string | null;
  isConnected: boolean;
  retryConnection: () => void;
}

const IpfsContext = createContext<IpfsContextType>({
  initialized: false,
  error: null,
  isConnected: false,
  retryConnection: () => {},
});

export const useIpfsContext = () => useContext(IpfsContext);

interface IpfsProviderProps {
  children: React.ReactNode;
  showStatus?: boolean;
}

export function IpfsProvider({ children, showStatus = true }: IpfsProviderProps) {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const initializeIpfs = async () => {
    try {
      setError(null);
      await ipfsService.initialize();
      setInitialized(true);
      setIsConnected(true);
      console.log("[IpfsProvider] IPFS successfully initialized");
    } catch (err) {
      console.error("[IpfsProvider] Failed to initialize IPFS:", err);
      setError(err instanceof Error ? err.message : "Failed to initialize IPFS");
      setIsConnected(false);
    }
  };

  const retryConnection = async () => {
    setIsRetrying(true);
    await initializeIpfs();
    setIsRetrying(false);
  };

  useEffect(() => {
    initializeIpfs();
  }, []);

  const value: IpfsContextType = {
    initialized,
    error,
    isConnected,
    retryConnection,
  };

  return (
    <IpfsContext.Provider value={value}>
      {showStatus && <IpfsStatus isRetrying={isRetrying} />}
      {children}
    </IpfsContext.Provider>
  );
}

interface IpfsStatusProps {
  isRetrying: boolean;
}

function IpfsStatus({ isRetrying }: IpfsStatusProps) {
  const { initialized, error, isConnected, retryConnection } = useIpfsContext();
  const [showStatus, setShowStatus] = useState(true);

  // Auto-hide status after successful connection
  useEffect(() => {
    if (isConnected && initialized) {
      const timer = setTimeout(() => setShowStatus(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, initialized]);

  if (!showStatus && isConnected) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      {!initialized && !error && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded shadow-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-3"></div>
            <span className="text-sm">Connecting to IPFS...</span>
          </div>
        </div>
      )}

      {isConnected && initialized && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm">IPFS Connected</span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-sm font-medium">IPFS Connection Failed</p>
                <p className="text-xs text-red-600 mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={retryConnection}
              disabled={isRetrying}
              className="ml-3 bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 disabled:opacity-50"
            >
              {isRetrying ? "Retrying..." : "Retry"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default IpfsProvider;
