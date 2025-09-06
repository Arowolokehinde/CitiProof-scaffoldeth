/**
 * React hooks for IPFS operations in CitiProof
 */
import { useCallback, useEffect, useState } from "react";
import { CitiProofIPFS, ipfsService } from "../lib/ipfs";

export interface UseIpfsResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UseIpfsUploadResult {
  upload: (data: any) => Promise<string>;
  uploadFile: (file: File) => Promise<string>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for retrieving data from IPFS
 */
export function useIpfsData<T = any>(hash: string | null): UseIpfsResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!hash || !ipfsService.isValidHash(hash)) {
      setData(null);
      setError(hash ? "Invalid IPFS hash" : null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await ipfsService.retrieveData<T>(hash);
      setData(result);
    } catch (err) {
      console.error("[useIpfsData] Error fetching data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch data from IPFS");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [hash]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}

/**
 * Hook for uploading data to IPFS
 */
export function useIpfsUpload(): UseIpfsUploadResult {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (data: any): Promise<string> => {
    setLoading(true);
    setError(null);

    try {
      const hash = await ipfsService.storeData(data);
      return hash;
    } catch (err) {
      console.error("[useIpfsUpload] Error uploading data:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to upload data to IPFS";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    setLoading(true);
    setError(null);

    try {
      const hash = await ipfsService.storeFile(file);
      return hash;
    } catch (err) {
      console.error("[useIpfsUpload] Error uploading file:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to upload file to IPFS";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return { upload, uploadFile, loading, error };
}

/**
 * Hook for citizen metadata operations
 */
export function useCitizenMetadata(hash: string | null) {
  const { data, loading, error, refetch } = useIpfsData(hash);
  const { upload, loading: uploadLoading, error: uploadError } = useIpfsUpload();

  const updateMetadata = useCallback(async (metadata: any): Promise<string> => {
    return await CitiProofIPFS.storeCitizenMetadata(metadata);
  }, []);

  return {
    metadata: data,
    loading: loading || uploadLoading,
    error: error || uploadError,
    refetch,
    updateMetadata,
  };
}

/**
 * Hook for issue description operations
 */
export function useIssueDescription(hash: string | null) {
  const { data, loading, error, refetch } = useIpfsData(hash);
  const { upload, loading: uploadLoading, error: uploadError } = useIpfsUpload();

  const storeDescription = useCallback(async (description: any): Promise<string> => {
    return await CitiProofIPFS.storeIssueDescription(description);
  }, []);

  return {
    description: data,
    loading: loading || uploadLoading,
    error: error || uploadError,
    refetch,
    storeDescription,
  };
}

/**
 * Hook for evidence operations
 */
export function useEvidence(hash: string | null) {
  const { data, loading, error, refetch } = useIpfsData(hash);
  const { upload, uploadFile, loading: uploadLoading, error: uploadError } = useIpfsUpload();

  const storeEvidence = useCallback(async (evidence: any): Promise<string> => {
    return await CitiProofIPFS.storeEvidence(evidence);
  }, []);

  const storeEvidenceFile = useCallback(
    async (file: File): Promise<string> => {
      return await uploadFile(file);
    },
    [uploadFile],
  );

  return {
    evidence: data,
    loading: loading || uploadLoading,
    error: error || uploadError,
    refetch,
    storeEvidence,
    storeEvidenceFile,
  };
}

/**
 * Hook for proposal description operations
 */
export function useProposalDescription(hash: string | null) {
  const { data, loading, error, refetch } = useIpfsData(hash);

  const storeDescription = useCallback(async (proposal: any): Promise<string> => {
    return await CitiProofIPFS.storeProposalDescription(proposal);
  }, []);

  return {
    proposal: data,
    loading,
    error,
    refetch,
    storeDescription,
  };
}

/**
 * Hook for government response operations
 */
export function useGovernmentResponse(hash: string | null) {
  const { data, loading, error, refetch } = useIpfsData(hash);

  const storeResponse = useCallback(async (response: any): Promise<string> => {
    return await CitiProofIPFS.storeGovernmentResponse(response);
  }, []);

  return {
    response: data,
    loading,
    error,
    refetch,
    storeResponse,
  };
}

/**
 * Hook for transaction details operations
 */
export function useTransactionDetails(hash: string | null) {
  const { data, loading, error, refetch } = useIpfsData(hash);

  const storeDetails = useCallback(async (transaction: any): Promise<string> => {
    return await CitiProofIPFS.storeTransactionDetails(transaction);
  }, []);

  return {
    transaction: data,
    loading,
    error,
    refetch,
    storeDetails,
  };
}

/**
 * Hook for voting reason operations
 */
export function useVotingReason(hash: string | null) {
  const { data, loading, error, refetch } = useIpfsData(hash);

  const storeReason = useCallback(async (reason: any): Promise<string> => {
    return await CitiProofIPFS.storeVotingReason(reason);
  }, []);

  return {
    reason: data,
    loading,
    error,
    refetch,
    storeReason,
  };
}

/**
 * Hook for audit findings operations
 */
export function useAuditFindings(hash: string | null) {
  const { data, loading, error, refetch } = useIpfsData(hash);

  const storeFindings = useCallback(async (findings: any): Promise<string> => {
    return await CitiProofIPFS.storeAuditFindings(findings);
  }, []);

  return {
    findings: data,
    loading,
    error,
    refetch,
    storeFindings,
  };
}

/**
 * Hook for verification findings operations
 */
export function useVerificationFindings(hash: string | null) {
  const { data, loading, error, refetch } = useIpfsData(hash);

  const storeFindings = useCallback(async (findings: any): Promise<string> => {
    return await CitiProofIPFS.storeVerificationFindings(findings);
  }, []);

  return {
    findings: data,
    loading,
    error,
    refetch,
    storeFindings,
  };
}

/**
 * Hook for file operations (general purpose)
 */
export function useIpfsFile(hash: string | null) {
  const [file, setFile] = useState<Blob | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { uploadFile, loading: uploadLoading, error: uploadError } = useIpfsUpload();

  const fetchFile = useCallback(async () => {
    if (!hash || !ipfsService.isValidHash(hash)) {
      setFile(null);
      setError(hash ? "Invalid IPFS hash" : null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const blob = await ipfsService.retrieveFile(hash);
      setFile(blob);
    } catch (err) {
      console.error("[useIpfsFile] Error fetching file:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch file from IPFS");
      setFile(null);
    } finally {
      setLoading(false);
    }
  }, [hash]);

  useEffect(() => {
    fetchFile();
  }, [fetchFile]);

  const refetch = useCallback(() => {
    fetchFile();
  }, [fetchFile]);

  return {
    file,
    loading: loading || uploadLoading,
    error: error || uploadError,
    refetch,
    uploadFile,
    getUrl: hash ? () => ipfsService.getGatewayUrl(hash) : null,
  };
}

/**
 * Hook for IPFS service initialization
 */
export function useIpfsInit() {
  const [initialized, setInitialized] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        await ipfsService.initialize();
        setInitialized(true);
      } catch (err) {
        console.error("[useIpfsInit] Failed to initialize IPFS:", err);
        setError(err instanceof Error ? err.message : "Failed to initialize IPFS");
      }
    };

    init();
  }, []);

  return { initialized, error };
}

/**
 * Hook for bulk IPFS operations
 */
export function useIpfsBulk() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const uploadMultiple = useCallback(async (items: any[]): Promise<string[]> => {
    setLoading(true);
    setError(null);

    try {
      const promises = items.map(item => ipfsService.storeData(item));
      const hashes = await Promise.all(promises);
      return hashes;
    } catch (err) {
      console.error("[useIpfsBulk] Error uploading multiple items:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to upload multiple items";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const retrieveMultiple = useCallback(async <T = any>(hashes: string[]): Promise<T[]> => {
    setLoading(true);
    setError(null);

    try {
      const promises = hashes.map(hash => ipfsService.retrieveData<T>(hash));
      const data = await Promise.all(promises);
      return data;
    } catch (err) {
      console.error("[useIpfsBulk] Error retrieving multiple items:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to retrieve multiple items";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    uploadMultiple,
    retrieveMultiple,
    loading,
    error,
  };
}
