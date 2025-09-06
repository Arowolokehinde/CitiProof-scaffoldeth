/**
 * Contract integration service for CitiProof
 * Handles interaction with deployed smart contracts
 */
import { createPublicClient, http, parseAbiItem, keccak256, toHex } from "viem";
import { sepolia } from "viem/chains";
import { CitiProofIPFS } from "./ipfs";

// Contract addresses from deployment
export const CONTRACT_ADDRESSES = {
  CitizenIdentityRegistry: "0x9F4Bc4cb48e60871768b4cFB9CF9C53381063652",
  ReputationSystem: "0x0Be2398A11E351903d7528533F2b5d544301510c",
  GovernmentProjectRegistry: "0xA2B1623a4AdE119f510Bd33493D70A246737bcD8",
  TreasuryFundTracking: "0x593C0cbA6a0e377d7BcB118AEeb691955db82078",
  IssueReportingSystem: "0x59a10e9f83641e83F9761A5Cc4A7307016D3F8C0",
  VotingGovernanceSystem: "0x51649792320c676b2e38accfb7cd61ab0d2a3f5a",
} as const;

// Public client for reading data
export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(
    `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || "DF6g4CvWdX6rIto0TLu5j"}`,
  ),
});

// Project categories enum
export enum ProjectCategory {
  INFRASTRUCTURE = 0,
  HEALTHCARE = 1,
  EDUCATION = 2,
  ENVIRONMENT = 3,
  TECHNOLOGY = 4,
  SOCIAL_SERVICES = 5,
  TRANSPORTATION = 6,
  OTHER = 7,
}

export enum ProjectStatus {
  PENDING = 0,
  APPROVED = 1,
  IN_PROGRESS = 2,
  COMPLETED = 3,
  CANCELLED = 4,
  ON_HOLD = 5,
}

export enum ProposalType {
  PROJECT_APPROVAL = 0,
  BUDGET_ALLOCATION = 1,
  MILESTONE_APPROVAL = 2,
  POLICY_CHANGE = 3,
  GENERAL = 4,
}

export enum ProposalStatus {
  PENDING = 0,
  ACTIVE = 1,
  PASSED = 2,
  REJECTED = 3,
  EXECUTED = 4,
  CANCELLED = 5,
}

// Project Registry ABI
export const PROJECT_REGISTRY_ABI = [
  {
    name: "createProject",
    type: "function",
    inputs: [
      { name: "_title", type: "string" },
      { name: "_description", type: "string" },
      { name: "_category", type: "uint8" },
      { name: "_totalBudget", type: "uint256" },
      { name: "_estimatedEndDate", type: "uint256" },
      { name: "_documentationHash", type: "string" },
      { name: "_isPublic", type: "bool" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    name: "authorizeGovernmentEntity",
    type: "function",
    inputs: [
      { name: "_entity", type: "address" },
      { name: "_authorized", type: "bool" }
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    name: "authorizedGovernmentEntities",
    type: "function",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    name: "getProject",
    type: "function",
    inputs: [{ name: "_projectId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "projectId", type: "uint256" },
          { name: "title", type: "string" },
          { name: "description", type: "string" },
          { name: "category", type: "uint8" },
          { name: "status", type: "uint8" },
          { name: "governmentEntity", type: "address" },
          { name: "totalBudget", type: "uint256" },
          { name: "budgetSpent", type: "uint256" },
          { name: "startDate", type: "uint256" },
          { name: "estimatedEndDate", type: "uint256" },
          { name: "actualEndDate", type: "uint256" },
          { name: "documentationHash", type: "string" },
          { name: "citizenSupportScore", type: "uint256" },
          { name: "isPublic", type: "bool" },
          { name: "creationTimestamp", type: "uint256" },
          { name: "lastUpdateTimestamp", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    name: "getTotalProjects",
    type: "function",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    name: "getProjectsByGovernmentEntity",
    type: "function",
    inputs: [{ name: "_entity", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view",
  },
  {
    name: "getProjectsByStatus",
    type: "function",
    inputs: [{ name: "_status", type: "uint8" }],
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view",
  },
] as const;

// Voting Governance ABI
export const VOTING_GOVERNANCE_ABI = [
  {
    name: "createProposal",
    type: "function",
    inputs: [
      { name: "_title", type: "string" },
      { name: "_ipfsDescriptionHash", type: "string" },
      { name: "_proposalType", type: "uint8" },
      { name: "_votingDuration", type: "uint256" },
      { name: "_ipfsDocumentHash", type: "string" }
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    name: "castVote",
    type: "function", 
    inputs: [
      { name: "_proposalId", type: "uint256" },
      { name: "_support", type: "bool" },
      { name: "_ipfsReasonHash", type: "string" }
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    name: "getProposal",
    type: "function",
    inputs: [{ name: "_proposalId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "proposalId", type: "uint256" },
          { name: "creatorCitizenId", type: "uint256" },
          { name: "creator", type: "address" },
          { name: "title", type: "string" },
          { name: "ipfsDescriptionHash", type: "string" },
          { name: "proposalType", type: "uint8" },
          { name: "status", type: "uint8" },
          { name: "creationTimestamp", type: "uint256" },
          { name: "votingEndTimestamp", type: "uint256" },
          { name: "executionTimestamp", type: "uint256" },
          { name: "yesVotes", type: "uint256" },
          { name: "noVotes", type: "uint256" },
          { name: "totalVotingPower", type: "uint256" },
          { name: "quorumRequired", type: "uint256" },
          { name: "passingThreshold", type: "uint256" },
          { name: "executionData", type: "bytes" },
          { name: "ipfsDocumentHash", type: "string" },
          { name: "isExecuted", type: "bool" },
          { name: "relatedProjectId", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
] as const;

// Issue Reporting ABI
export const ISSUE_REPORTING_ABI = [
  {
    name: "reportIssue",
    type: "function",
    inputs: [
      { name: "_title", type: "string" },
      { name: "_ipfsDescriptionHash", type: "string" },
      { name: "_ipfsLocationHash", type: "string" },
      { name: "_ipfsEvidenceHash", type: "string" },
      { name: "_category", type: "uint8" },
      { name: "_severity", type: "uint8" }
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
  },
] as const;

// TypeScript interfaces
export interface Project {
  projectId: bigint;
  title: string;
  description: string;
  category: ProjectCategory;
  status: ProjectStatus;
  governmentEntity: `0x${string}`;
  totalBudget: bigint;
  budgetSpent: bigint;
  startDate: bigint;
  estimatedEndDate: bigint;
  actualEndDate: bigint;
  documentationHash: string;
  citizenSupportScore: bigint;
  isPublic: boolean;
  creationTimestamp: bigint;
  lastUpdateTimestamp: bigint;
}

export interface ProjectWithIPFS extends Project {
  ipfsData?: {
    detailedDescription: string;
    category: string;
    severity: string;
    expectedResolution: string;
    additionalContext?: string;
    parsedContext?: {
      ministry?: string;
      ensName?: string;
      duration?: string;
      totalBudget?: string;
      milestones?: Array<{
        title: string;
        description: string;
        budget: string;
      }>;
    };
  };
  documentationFiles?: {
    files: Array<{
      name: string;
      type: string;
      size: number;
      hash: string;
    }>;
    uploadedAt: string;
    totalFiles: number;
  };
}

export interface Proposal {
  proposalId: bigint;
  creatorCitizenId: bigint;
  creator: `0x${string}`;
  title: string;
  ipfsDescriptionHash: string;
  proposalType: ProposalType;
  status: ProposalStatus;
  creationTimestamp: bigint;
  votingEndTimestamp: bigint;
  executionTimestamp: bigint;
  yesVotes: bigint;
  noVotes: bigint;
  totalVotingPower: bigint;
  quorumRequired: bigint;
  passingThreshold: bigint;
  executionData: `0x${string}`;
  ipfsDocumentHash: string;
  isExecuted: boolean;
  relatedProjectId: bigint;
}

// Helper function for handling contract errors
function handleContractError(error: any, operation: string): never {
  console.error(`[Contract Error] ${operation}:`, error);
  
  // Common error patterns
  if (error?.message?.includes("User rejected")) {
    throw new Error("Transaction was rejected by user");
  }
  if (error?.message?.includes("insufficient funds")) {
    throw new Error("Insufficient funds for transaction");
  }
  if (error?.message?.includes("gas")) {
    throw new Error("Transaction failed due to gas issues. Please try again with higher gas limit.");
  }
  if (error?.message?.includes("nonce")) {
    throw new Error("Transaction nonce error. Please refresh and try again.");
  }
  if (error?.message?.includes("network")) {
    throw new Error("Network error. Please check your connection and try again.");
  }
  
  // Generic error
  throw new Error(error?.message || `Failed to ${operation.toLowerCase()}`);
}

// Event signatures for log parsing
const PROJECT_CREATED_SIGNATURE = keccak256(toHex("ProjectCreated(uint256,string,uint8,address,uint256)"));
const PROPOSAL_CREATED_SIGNATURE = keccak256(toHex("ProposalCreated(uint256,address,string,uint8)"));
const ISSUE_REPORTED_SIGNATURE = keccak256(toHex("IssueReported(uint256,address,string,uint8)"));

// Service functions
export class CitiProofContracts {
  // Authorization functions
  static async authorizeGovernmentEntity(
    walletClient: any,
    entityAddress: string,
    authorized: boolean = true
  ): Promise<void> {
    try {
      const { request } = await publicClient.simulateContract({
        address: CONTRACT_ADDRESSES.GovernmentProjectRegistry as `0x${string}`,
        abi: PROJECT_REGISTRY_ABI,
        functionName: "authorizeGovernmentEntity",
        args: [entityAddress as `0x${string}`, authorized],
        account: walletClient.account,
      });

      const hash = await walletClient.writeContract(request);
      await publicClient.waitForTransactionReceipt({ hash });
    } catch (error) {
      handleContractError(error, "authorize government entity");
    }
  }

  static async checkGovernmentAuthorization(entityAddress: string): Promise<boolean> {
    try {
      const isAuthorized = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.GovernmentProjectRegistry as `0x${string}`,
        abi: PROJECT_REGISTRY_ABI,
        functionName: "authorizedGovernmentEntities",
        args: [entityAddress as `0x${string}`],
      });

      return isAuthorized as boolean;
    } catch (error) {
      console.error("Error checking authorization:", error);
      return false;
    }
  }

  // Project write functions
  static async createProject(
    walletClient: any,
    title: string,
    description: string,
    category: number,
    totalBudget: bigint,
    estimatedEndDate: bigint,
    documentationHash: string,
    isPublic: boolean = true
  ): Promise<number> {
    try {
      const { request } = await publicClient.simulateContract({
        address: CONTRACT_ADDRESSES.GovernmentProjectRegistry as `0x${string}`,
        abi: PROJECT_REGISTRY_ABI,
        functionName: "createProject",
        args: [
          title,
          description,
          category,
          totalBudget,
          estimatedEndDate,
          documentationHash,
          isPublic
        ],
        account: walletClient.account,
      });

      const hash = await walletClient.writeContract(request);
      
      // Wait for transaction receipt
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      
      // Extract project ID from logs
      const log = receipt.logs.find(log => 
        (log as any).topics?.[0] === PROJECT_CREATED_SIGNATURE
      );
      
      if (log && (log as any).topics?.[1]) {
        return parseInt((log as any).topics[1], 16);
      }
      
      throw new Error("Project ID not found in transaction logs");
    } catch (error) {
      handleContractError(error, "create project");
    }
  }

  static async createProposal(
    walletClient: any,
    title: string,
    ipfsDescriptionHash: string,
    proposalType: number,
    votingDuration: bigint,
    ipfsDocumentHash: string
  ): Promise<number> {
    try {
      if (!CONTRACT_ADDRESSES.VotingGovernanceSystem || CONTRACT_ADDRESSES.VotingGovernanceSystem.includes("TBD")) {
        throw new Error("VotingGovernanceSystem contract not deployed");
      }

      const { request } = await publicClient.simulateContract({
        address: CONTRACT_ADDRESSES.VotingGovernanceSystem as `0x${string}`,
        abi: VOTING_GOVERNANCE_ABI,
        functionName: "createProposal",
        args: [
          title,
          ipfsDescriptionHash,
          proposalType,
          votingDuration,
          ipfsDocumentHash
        ],
        account: walletClient.account,
      });

      const hash = await walletClient.writeContract(request);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      
      // Extract proposal ID from logs
      const log = receipt.logs.find(log => 
        (log as any).topics?.[0] === PROPOSAL_CREATED_SIGNATURE
      );
      
      if (log && (log as any).topics?.[1]) {
        return parseInt((log as any).topics[1], 16);
      }
      
      throw new Error("Proposal ID not found in transaction logs");
    } catch (error) {
      handleContractError(error, "create proposal");
    }
  }

  static async reportIssue(
    walletClient: any,
    title: string,
    ipfsDescriptionHash: string,
    ipfsLocationHash: string,
    ipfsEvidenceHash: string,
    category: number,
    severity: number
  ): Promise<number> {
    try {
      const { request } = await publicClient.simulateContract({
        address: CONTRACT_ADDRESSES.IssueReportingSystem as `0x${string}`,
        abi: ISSUE_REPORTING_ABI,
        functionName: "reportIssue",
        args: [
          title,
          ipfsDescriptionHash,
          ipfsLocationHash,
          ipfsEvidenceHash,
          category,
          severity
        ],
        account: walletClient.account,
      });

      const hash = await walletClient.writeContract(request);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      
      // Extract issue ID from logs
      const log = receipt.logs.find(log => 
        (log as any).topics?.[0] === ISSUE_REPORTED_SIGNATURE
      );
      
      if (log && (log as any).topics?.[1]) {
        return parseInt((log as any).topics[1], 16);
      }
      
      throw new Error("Issue ID not found in transaction logs");
    } catch (error) {
      handleContractError(error, "report issue");
    }
  }

  static async vote(
    walletClient: any,
    proposalId: number,
    support: boolean,
    ipfsReasonHash: string
  ): Promise<void> {
    try {
      if (!CONTRACT_ADDRESSES.VotingGovernanceSystem || CONTRACT_ADDRESSES.VotingGovernanceSystem.includes("TBD")) {
        throw new Error("VotingGovernanceSystem contract not deployed");
      }

      const { request } = await publicClient.simulateContract({
        address: CONTRACT_ADDRESSES.VotingGovernanceSystem as `0x${string}`,
        abi: VOTING_GOVERNANCE_ABI,
        functionName: "castVote",
        args: [BigInt(proposalId), support, ipfsReasonHash],
        account: walletClient.account,
      });

      const hash = await walletClient.writeContract(request);
      await publicClient.waitForTransactionReceipt({ hash });
    } catch (error) {
      handleContractError(error, "cast vote");
    }
  }

  // Read functions
  static async getProject(projectId: number): Promise<Project | null> {
    try {
      const project = (await publicClient.readContract({
        address: CONTRACT_ADDRESSES.GovernmentProjectRegistry as `0x${string}`,
        abi: PROJECT_REGISTRY_ABI,
        functionName: "getProject",
        args: [BigInt(projectId)],
      })) as Project;

      return project;
    } catch (error) {
      console.error("Error fetching project:", error);
      return null;
    }
  }

  static async getTotalProjects(): Promise<number> {
    try {
      const total = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.GovernmentProjectRegistry as `0x${string}`,
        abi: PROJECT_REGISTRY_ABI,
        functionName: "getTotalProjects",
        args: [],
      });

      return Number(total);
    } catch (error) {
      console.error("Error fetching total projects:", error);
      return 0;
    }
  }

  static async getProjectsByGovernmentEntity(entityAddress: string): Promise<number[]> {
    try {
      const projectIds = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.GovernmentProjectRegistry as `0x${string}`,
        abi: PROJECT_REGISTRY_ABI,
        functionName: "getProjectsByGovernmentEntity",
        args: [entityAddress as `0x${string}`],
      });

      return (projectIds as bigint[]).map(id => Number(id));
    } catch (error) {
      console.error("Error fetching projects by government entity:", error);
      return [];
    }
  }

  static async getProjectsByStatus(status: ProjectStatus): Promise<number[]> {
    try {
      const projectIds = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.GovernmentProjectRegistry as `0x${string}`,
        abi: PROJECT_REGISTRY_ABI,
        functionName: "getProjectsByStatus",
        args: [status],
      });

      return (projectIds as bigint[]).map(id => Number(id));
    } catch (error) {
      console.error("Error fetching projects by status:", error);
      return [];
    }
  }

  // Get ALL projects by iterating through all IDs
  static async getAllProjects(): Promise<Project[]> {
    try {
      const totalProjects = await this.getTotalProjects();
      const projects: Project[] = [];

      console.log(`[getAllProjects] Fetching ${totalProjects} projects from contract...`);

      // Fetch all projects in parallel
      const projectPromises = [];
      for (let i = 1; i <= totalProjects; i++) {
        projectPromises.push(this.getProject(i));
      }

      const projectResults = await Promise.all(projectPromises);
      
      // Filter out null results
      for (const project of projectResults) {
        if (project) {
          projects.push(project);
        }
      }

      console.log(`[getAllProjects] Successfully fetched ${projects.length} projects`);
      return projects;
    } catch (error) {
      console.error("Error fetching all projects:", error);
      return [];
    }
  }

  // Get ALL projects WITH IPFS data - this is the main function for voting
  static async getAllProjectsWithIPFS(): Promise<ProjectWithIPFS[]> {
    try {
      // Step 1: Get all projects from contract
      const projects = await this.getAllProjects();
      console.log(`[getAllProjectsWithIPFS] Got ${projects.length} projects from contract, fetching IPFS data...`);

      // Step 2: Fetch IPFS data for each project
      const projectsWithIPFS: ProjectWithIPFS[] = [];

      for (const project of projects) {
        const projectWithIPFS: ProjectWithIPFS = { ...project };

        try {
          // Fetch description from IPFS (stored in the description field as hash)
          if (project.description && project.description.startsWith('Qm')) {
            console.log(`[getAllProjectsWithIPFS] Fetching IPFS data for project ${project.projectId} with hash: ${project.description}`);
            
            const ipfsData = await CitiProofIPFS.getIssueDescription(project.description);
            if (ipfsData) {
              projectWithIPFS.ipfsData = ipfsData;
              
              // Parse additional context if available
              if (ipfsData.additionalContext) {
                try {
                  projectWithIPFS.ipfsData.parsedContext = JSON.parse(ipfsData.additionalContext);
                } catch (e) {
                  console.warn(`[getAllProjectsWithIPFS] Failed to parse additionalContext for project ${project.projectId}`);
                }
              }
            }
          }

          // Fetch documentation files from IPFS if available
          if (project.documentationHash && project.documentationHash.startsWith('Qm')) {
            console.log(`[getAllProjectsWithIPFS] Fetching documentation for project ${project.projectId} with hash: ${project.documentationHash}`);
            
            try {
              const documentationData = await CitiProofIPFS.getData(project.documentationHash);
              if (documentationData) {
                projectWithIPFS.documentationFiles = documentationData as any;
              }
            } catch (e) {
              console.warn(`[getAllProjectsWithIPFS] Failed to fetch documentation for project ${project.projectId}`);
            }
          }

        } catch (error) {
          console.warn(`[getAllProjectsWithIPFS] Failed to fetch IPFS data for project ${project.projectId}:`, error);
        }

        projectsWithIPFS.push(projectWithIPFS);
      }

      console.log(`[getAllProjectsWithIPFS] Successfully enriched ${projectsWithIPFS.length} projects with IPFS data`);
      return projectsWithIPFS;

    } catch (error) {
      console.error("Error fetching projects with IPFS data:", error);
      return [];
    }
  }

  static async getProposal(proposalId: number): Promise<Proposal | null> {
    try {
      if (!CONTRACT_ADDRESSES.VotingGovernanceSystem || CONTRACT_ADDRESSES.VotingGovernanceSystem.includes("TBD")) {
        console.warn("VotingGovernanceSystem not deployed yet");
        return null;
      }

      const proposal = (await publicClient.readContract({
        address: CONTRACT_ADDRESSES.VotingGovernanceSystem as `0x${string}`,
        abi: VOTING_GOVERNANCE_ABI,
        functionName: "getProposal",
        args: [BigInt(proposalId)],
      })) as Proposal;

      return proposal;
    } catch (error) {
      console.error("Error fetching proposal:", error);
      return null;
    }
  }

  // Additional read functions needed by the app
  static async getAllActiveProjects(): Promise<bigint[]> {
    try {
      // Mock implementation - would need actual ABI method
      return [BigInt(1), BigInt(2), BigInt(3)];
    } catch (error) {
      console.error("Error fetching active projects:", error);
      return [];
    }
  }

  static async getProjectsByStatus(status: ProjectStatus): Promise<bigint[]> {
    try {
      // Mock implementation - would need actual ABI method
      return [BigInt(1), BigInt(2)];
    } catch (error) {
      console.error("Error fetching projects by status:", error);
      return [];
    }
  }

  static async getTotalProjects(): Promise<number> {
    try {
      // Mock implementation - would need actual ABI method
      return 10;
    } catch (error) {
      console.error("Error fetching total projects:", error);
      return 0;
    }
  }

  static async getActiveProposals(): Promise<bigint[]> {
    try {
      // Mock implementation - would need actual ABI method
      return [BigInt(1), BigInt(2)];
    } catch (error) {
      console.error("Error fetching active proposals:", error);
      return [];
    }
  }

  // Event watching functions (simplified)
  static async watchProjectEvents(
    onProjectRegistered?: (log: any) => void,
    onProjectStatusUpdated?: (log: any) => void,
  ) {
    // Simplified event watching - would need proper implementation
    console.log("Setting up project event listeners...");
  }

  static async watchProposalEvents(
    onProposalCreated?: (log: any) => void,
    onVoteCast?: (log: any) => void,
  ) {
    // Simplified event watching - would need proper implementation
    console.log("Setting up proposal event listeners...");
  }

  // Utility functions
  static getCategoryName(category: ProjectCategory): string {
    const names = {
      [ProjectCategory.INFRASTRUCTURE]: "Infrastructure",
      [ProjectCategory.HEALTHCARE]: "Healthcare",
      [ProjectCategory.EDUCATION]: "Education",
      [ProjectCategory.ENVIRONMENT]: "Environment",
      [ProjectCategory.TECHNOLOGY]: "Technology",
      [ProjectCategory.SOCIAL_SERVICES]: "Social Services",
      [ProjectCategory.TRANSPORTATION]: "Transportation",
      [ProjectCategory.OTHER]: "Other",
    };
    return names[category] || "Unknown";
  }

  static getStatusName(status: ProjectStatus): string {
    const names = {
      [ProjectStatus.PENDING]: "Pending",
      [ProjectStatus.APPROVED]: "Approved",
      [ProjectStatus.IN_PROGRESS]: "In Progress",
      [ProjectStatus.COMPLETED]: "Completed",
      [ProjectStatus.CANCELLED]: "Cancelled",
      [ProjectStatus.ON_HOLD]: "On Hold",
    };
    return names[status] || "Unknown";
  }

  static getStatusColor(status: ProjectStatus): string {
    const colors = {
      [ProjectStatus.PENDING]: "bg-amber-500 text-white",
      [ProjectStatus.APPROVED]: "bg-green-500 text-white",
      [ProjectStatus.IN_PROGRESS]: "bg-blue-600 text-white",
      [ProjectStatus.COMPLETED]: "bg-green-600 text-white",
      [ProjectStatus.CANCELLED]: "bg-red-500 text-white",
      [ProjectStatus.ON_HOLD]: "bg-gray-500 text-white",
    };
    return colors[status] || "bg-gray-400 text-white";
  }

  static formatBudget(budget: bigint): string {
    return `${Number(budget) / 1e18} ETH`;
  }

  static formatDuration(duration: bigint): string {
    const days = Number(duration) / (24 * 60 * 60);
    return `${Math.round(days)} days`;
  }

  static formatTimestamp(timestamp: bigint): string {
    return new Date(Number(timestamp) * 1000).toLocaleDateString();
  }

  static getProposalTypeName(type: ProposalType): string {
    const names = {
      [ProposalType.PROJECT_APPROVAL]: "Project Approval",
      [ProposalType.BUDGET_ALLOCATION]: "Budget Allocation", 
      [ProposalType.MILESTONE_APPROVAL]: "Milestone Approval",
      [ProposalType.POLICY_CHANGE]: "Policy Change",
      [ProposalType.GENERAL]: "General"
    };
    return names[type] || "Unknown";
  }

  static getProposalStatusName(status: ProposalStatus): string {
    const names = {
      [ProposalStatus.PENDING]: "Pending",
      [ProposalStatus.ACTIVE]: "Active",
      [ProposalStatus.PASSED]: "Passed", 
      [ProposalStatus.REJECTED]: "Rejected",
      [ProposalStatus.EXECUTED]: "Executed",
      [ProposalStatus.CANCELLED]: "Cancelled"
    };
    return names[status] || "Unknown";
  }

  static getProposalStatusColor(status: ProposalStatus): string {
    const colors = {
      [ProposalStatus.PENDING]: "bg-gray-500 text-white",
      [ProposalStatus.ACTIVE]: "bg-blue-600 text-white",
      [ProposalStatus.PASSED]: "bg-green-500 text-white",
      [ProposalStatus.REJECTED]: "bg-red-500 text-white", 
      [ProposalStatus.EXECUTED]: "bg-green-600 text-white",
      [ProposalStatus.CANCELLED]: "bg-gray-400 text-white"
    };
    return colors[status] || "bg-gray-400 text-white";
  }

  static calculateVotingProgress(yesVotes: bigint, noVotes: bigint): number {
    const total = Number(yesVotes + noVotes);
    if (total === 0) return 0;
    return (Number(yesVotes) / total) * 100;
  }

  static isVotingActive(endTimestamp: bigint): boolean {
    return Number(endTimestamp) * 1000 > Date.now();
  }

  static formatVotingTimeRemaining(endTimestamp: bigint): string {
    const now = Date.now();
    const endTime = Number(endTimestamp) * 1000;
    
    if (endTime <= now) return "Voting ended";
    
    const diff = endTime - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} day${days !== 1 ? 's' : ''} remaining`;
    if (hours > 0) return `${hours} hour${hours !== 1 ? 's' : ''} remaining`;
    return "Less than 1 hour remaining";
  }
}