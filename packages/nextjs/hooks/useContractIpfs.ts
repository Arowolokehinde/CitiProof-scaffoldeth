/**
 * Integrated hooks for Contract + IPFS operations
 * Combines smart contract calls with IPFS data storage for CitiProof
 */
import { useCallback, useState } from "react";
import { useWalletClient } from "wagmi";
import { CitiProofContracts, type Project, type Proposal } from "../lib/contracts";
import { CitiProofIPFS, type IssueDescription, type ProposalDescription, type LocationData, type EvidenceData } from "../lib/ipfs";
import { useIpfsUpload, useIssueDescription, useProposalDescription, useEvidence } from "./useIpfs";

export interface UseProjectRegistrationResult {
  registerProject: (projectData: ProjectRegistrationData) => Promise<number>;
  loading: boolean;
  error: string | null;
}

export interface ProjectRegistrationData {
  title: string;
  description: IssueDescription;
  category: number;
  expectedBudget: bigint;
  estimatedDuration: bigint;
  milestones: string[];
  milestoneBudgets: bigint[];
  documents?: File[];
}

export interface UseProposalCreationResult {
  createProposal: (proposalData: ProposalCreationData) => Promise<number>;
  loading: boolean;
  error: string | null;
}

export interface ProposalCreationData {
  title: string;
  description: ProposalDescription;
  proposalType: number;
  votingDuration: bigint;
  supportingDocuments?: File[];
}

export interface UseIssueReportingResult {
  reportIssue: (issueData: IssueReportingData) => Promise<number>;
  loading: boolean;
  error: string | null;
}

export interface IssueReportingData {
  title: string;
  description: IssueDescription;
  location: LocationData;
  evidence: EvidenceData;
  category: number;
  severity: number;
  evidenceFiles: File[];
}

/**
 * Hook for project registration with integrated IPFS storage
 */
export function useProjectRegistration(): UseProjectRegistrationResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: walletClient } = useWalletClient();
  const { upload, uploadFile } = useIpfsUpload();

  const registerProject = useCallback(async (projectData: ProjectRegistrationData): Promise<number> => {
    if (!walletClient) {
      throw new Error("Wallet not connected");
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Store project description to IPFS
      const descriptionHash = await CitiProofIPFS.storeIssueDescription(projectData.description);
      
      // Step 2: Upload and store documentation files to IPFS
      let documentationHash = "";
      if (projectData.documents && projectData.documents.length > 0) {
        const documentHashes = await Promise.all(
          projectData.documents.map(file => uploadFile(file))
        );
        // Store document metadata with hashes
        const documentMetadata = {
          files: projectData.documents.map((file, index) => ({
            name: file.name,
            type: file.type,
            size: file.size,
            hash: documentHashes[index]
          })),
          uploadedAt: new Date().toISOString(),
          totalFiles: projectData.documents.length
        };
        documentationHash = await upload(documentMetadata);
      }

      // Step 3: Create project on blockchain with IPFS hashes
      const projectId = await CitiProofContracts.createProject(
        walletClient,
        projectData.title,
        JSON.stringify(projectData.description), // Convert description object to string
        projectData.category,
        projectData.expectedBudget,
        projectData.estimatedDuration,
        documentationHash,
        true // isPublic - default to true for now
      );

      console.log(`[useProjectRegistration] Project registered successfully with ID: ${projectId}`);
      return projectId;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to register project";
      console.error("[useProjectRegistration] Error:", err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [walletClient, upload, uploadFile]);

  return { registerProject, loading, error };
}

/**
 * Hook for proposal creation with integrated IPFS storage
 */
export function useProposalCreation(): UseProposalCreationResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: walletClient } = useWalletClient();
  const { upload, uploadFile } = useIpfsUpload();

  const createProposal = useCallback(async (proposalData: ProposalCreationData): Promise<number> => {
    if (!walletClient) {
      throw new Error("Wallet not connected");
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Store proposal description to IPFS
      const descriptionHash = await CitiProofIPFS.storeProposalDescription(proposalData.description);

      // Step 2: Upload supporting documents if provided
      let documentsHash = "";
      if (proposalData.supportingDocuments && proposalData.supportingDocuments.length > 0) {
        const documentHashes = await Promise.all(
          proposalData.supportingDocuments.map(file => uploadFile(file))
        );
        const documentMetadata = {
          documents: proposalData.supportingDocuments.map((file, index) => ({
            name: file.name,
            type: file.type,
            size: file.size,
            hash: documentHashes[index]
          })),
          uploadedAt: new Date().toISOString()
        };
        documentsHash = await upload(documentMetadata);
      }

      // Step 3: Create proposal on blockchain
      const proposalId = await CitiProofContracts.createProposal(
        walletClient,
        proposalData.title,
        descriptionHash,
        proposalData.proposalType,
        proposalData.votingDuration,
        documentsHash
      );

      console.log(`[useProposalCreation] Proposal created successfully with ID: ${proposalId}`);
      return proposalId;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create proposal";
      console.error("[useProposalCreation] Error:", err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [walletClient, upload, uploadFile]);

  return { createProposal, loading, error };
}

/**
 * Hook for issue reporting with integrated IPFS storage
 */
export function useIssueReporting(): UseIssueReportingResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: walletClient } = useWalletClient();
  const { upload, uploadFile } = useIpfsUpload();

  const reportIssue = useCallback(async (issueData: IssueReportingData): Promise<number> => {
    if (!walletClient) {
      throw new Error("Wallet not connected");
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Store issue description to IPFS
      const descriptionHash = await CitiProofIPFS.storeIssueDescription(issueData.description);

      // Step 2: Store location data to IPFS
      const locationHash = await CitiProofIPFS.storeLocationData(issueData.location);

      // Step 3: Upload evidence files and store evidence data
      const evidenceFileHashes = await Promise.all(
        issueData.evidenceFiles.map(file => uploadFile(file))
      );
      
      const evidenceWithFiles = {
        ...issueData.evidence,
        relatedFiles: evidenceFileHashes
      };
      const evidenceHash = await CitiProofIPFS.storeEvidence(evidenceWithFiles);

      // Step 4: Report issue on blockchain
      const issueId = await CitiProofContracts.reportIssue(
        walletClient,
        issueData.title,
        descriptionHash,
        locationHash,
        evidenceHash,
        issueData.category,
        issueData.severity
      );

      console.log(`[useIssueReporting] Issue reported successfully with ID: ${issueId}`);
      return issueId;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to report issue";
      console.error("[useIssueReporting] Error:", err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [walletClient, upload, uploadFile]);

  return { reportIssue, loading, error };
}

/**
 * Hook for retrieving and displaying project with IPFS data
 */
export function useProjectWithIpfs(projectId: number | null) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { description: projectDescription, loading: descLoading, error: descError } = useIssueDescription(
    project?.description || null
  );

  const fetchProject = useCallback(async () => {
    if (projectId === null) return;

    setLoading(true);
    setError(null);

    try {
      const projectData = await CitiProofContracts.getProject(projectId);
      setProject(projectData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch project";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  return {
    project,
    description: projectDescription,
    loading: loading || descLoading,
    error: error || descError,
    refetch: fetchProject
  };
}

/**
 * Hook for retrieving and displaying proposal with IPFS data
 */
export function useProposalWithIpfs(proposalId: number | null) {
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { proposal: proposalDescription, loading: descLoading, error: descError } = useProposalDescription(
    proposal?.ipfsDescriptionHash || null
  );

  const fetchProposal = useCallback(async () => {
    if (proposalId === null) return;

    setLoading(true);
    setError(null);

    try {
      const proposalData = await CitiProofContracts.getProposal(proposalId);
      setProposal(proposalData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch proposal";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [proposalId]);

  return {
    proposal,
    description: proposalDescription,
    loading: loading || descLoading,
    error: error || descError,
    refetch: fetchProposal
  };
}

/**
 * Hook for voting with reasoning stored on IPFS
 */
export function useVotingWithReason() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: walletClient } = useWalletClient();
  const { upload } = useIpfsUpload();

  const voteWithReason = useCallback(async (
    proposalId: number,
    support: boolean,
    reasoning: {
      position: "support" | "oppose" | "abstain";
      reasoning: string;
      concerns?: string[];
      suggestions?: string[];
      expertise?: string;
    }
  ): Promise<void> => {
    if (!walletClient) {
      throw new Error("Wallet not connected");
    }

    setLoading(true);
    setError(null);

    try {
      // Store voting reasoning on IPFS
      const reasoningHash = await CitiProofIPFS.storeVotingReason(reasoning);

      // Cast vote on blockchain with reasoning hash
      await CitiProofContracts.vote(walletClient, proposalId, support, reasoningHash);

      console.log(`[useVotingWithReason] Vote cast successfully for proposal ${proposalId}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to cast vote";
      console.error("[useVotingWithReason] Error:", err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [walletClient, upload]);

  return { voteWithReason, loading, error };
}

/**
 * Hook for batch operations - upload multiple items to IPFS and interact with contracts
 */
export function useBatchContractIpfs() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { upload, uploadFile } = useIpfsUpload();

  const batchUploadAndStore = useCallback(async (
    items: { data: any; files?: File[] }[]
  ): Promise<string[]> => {
    setLoading(true);
    setError(null);

    try {
      const results: string[] = [];

      for (const item of items) {
        // Upload files first if provided
        let fileHashes: string[] = [];
        if (item.files && item.files.length > 0) {
          fileHashes = await Promise.all(item.files.map(file => uploadFile(file)));
        }

        // Combine data with file hashes
        const combinedData = {
          ...item.data,
          attachedFiles: fileHashes.map((hash, index) => ({
            hash,
            name: item.files?.[index]?.name || `file_${index}`,
            type: item.files?.[index]?.type || 'unknown'
          }))
        };

        // Upload combined data to IPFS
        const dataHash = await upload(combinedData);
        results.push(dataHash);
      }

      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Batch upload failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [upload, uploadFile]);

  return { batchUploadAndStore, loading, error };
}