/**
 * React hooks for project and voting data
 */
import { useCallback, useEffect, useState } from "react";
import { useIpfsData, useProposalDescription } from "./useIpfs";
import { CitiProofContracts, type Project, type ProjectWithIPFS, ProjectStatus, type Proposal } from "@/lib/contracts";

export interface UseProjectsResult {
  projects: Project[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  totalProjects: number;
}

export interface UseProjectResult {
  project: Project | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  projectDescription: any;
  descriptionLoading: boolean;
}

export interface UseProposalsResult {
  proposals: Proposal[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook for fetching all projects
 */
export function useProjects(status?: ProjectStatus): UseProjectsResult {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalProjects, setTotalProjects] = useState<number>(0);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Get project IDs based on status filter
      let projectIds: bigint[];
      if (status !== undefined) {
        projectIds = await CitiProofContracts.getProjectsByStatus(status);
      } else {
        projectIds = await CitiProofContracts.getAllActiveProjects();
      }

      // Fetch total projects count
      const total = await CitiProofContracts.getTotalProjects();
      setTotalProjects(total);

      // Fetch project details
      const projectPromises = projectIds.map(id => CitiProofContracts.getProject(Number(id)));

      const projectsData = await Promise.all(projectPromises);
      const validProjects = projectsData.filter(p => p !== null) as Project[];

      // Sort by creation timestamp (newest first)
      validProjects.sort((a, b) => Number(b.creationTimestamp) - Number(a.creationTimestamp));

      setProjects(validProjects);
    } catch (err) {
      console.error("[useProjects] Error fetching projects:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch projects");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchProjects();

    // Set up real-time updates
    CitiProofContracts.watchProjectEvents(
      // On project registered
      logs => {
        console.log("[useProjects] New project registered:", logs);
        fetchProjects(); // Refetch projects when new one is registered
      },
      // On project status updated
      logs => {
        console.log("[useProjects] Project status updated:", logs);
        fetchProjects(); // Refetch projects when status changes
      },
    );
  }, [fetchProjects]);

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
    totalProjects,
  };
}

/**
 * Hook for fetching a single project with IPFS description
 */
export function useProject(projectId: number | null): UseProjectResult {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // IPFS description hook
  const { data: projectDescription, loading: descriptionLoading } = useIpfsData(project?.ipfsDescriptionHash || null);

  const fetchProject = useCallback(async () => {
    if (!projectId) {
      setProject(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const projectData = await CitiProofContracts.getProject(projectId);
      setProject(projectData);
    } catch (err) {
      console.error("[useProject] Error fetching project:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch project");
      setProject(null);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  return {
    project,
    loading,
    error,
    refetch: fetchProject,
    projectDescription,
    descriptionLoading,
  };
}

/**
 * Hook for fetching proposals
 */
export function useProposals(): UseProposalsResult {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProposals = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Get active proposal IDs
      const proposalIds = await CitiProofContracts.getActiveProposals();

      // Fetch proposal details
      const proposalPromises = proposalIds.map(id => CitiProofContracts.getProposal(Number(id)));

      const proposalsData = await Promise.all(proposalPromises);
      const validProposals = proposalsData.filter(p => p !== null) as Proposal[];

      // Sort by creation timestamp (newest first)
      validProposals.sort((a, b) => Number(b.creationTimestamp) - Number(a.creationTimestamp));

      setProposals(validProposals);
    } catch (err) {
      console.error("[useProposals] Error fetching proposals:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch proposals");
      setProposals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  return {
    proposals,
    loading,
    error,
    refetch: fetchProposals,
  };
}

/**
 * Hook for project statistics
 */
export function useProjectStats() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    inProgress: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [total, pending, approved, inProgress, completed] = await Promise.all([
          CitiProofContracts.getTotalProjects(),
          CitiProofContracts.getProjectsByStatus(ProjectStatus.PENDING).then(arr => arr.length),
          CitiProofContracts.getProjectsByStatus(ProjectStatus.APPROVED).then(arr => arr.length),
          CitiProofContracts.getProjectsByStatus(ProjectStatus.IN_PROGRESS).then(arr => arr.length),
          CitiProofContracts.getProjectsByStatus(ProjectStatus.COMPLETED).then(arr => arr.length),
        ]);

        setStats({
          total,
          pending,
          approved,
          inProgress,
          completed,
        });
      } catch (error) {
        console.error("[useProjectStats] Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading };
}

/**
 * Hook for real-time project updates
 */
export function useRealTimeProjects() {
  const [recentActivity, setRecentActivity] = useState<
    Array<{
      type: "project_registered" | "status_updated";
      projectId: number;
      timestamp: Date;
      data: any;
    }>
  >([]);

  useEffect(() => {
    CitiProofContracts.watchProjectEvents(
      // On project registered
      logs => {
        logs.forEach((log: any) => {
          setRecentActivity(prev => [
            {
              type: "project_registered",
              projectId: Number(log.args.projectId),
              timestamp: new Date(),
              data: {
                creator: log.args.creator,
                title: log.args.title,
                category: log.args.category,
              },
            },
            ...prev.slice(0, 9),
          ]); // Keep last 10 activities
        });
      },
      // On project status updated
      logs => {
        logs.forEach((log: any) => {
          setRecentActivity(prev => [
            {
              type: "status_updated",
              projectId: Number(log.args.projectId),
              timestamp: new Date(),
              data: {
                oldStatus: log.args.oldStatus,
                newStatus: log.args.newStatus,
                updatedBy: log.args.updatedBy,
              },
            },
            ...prev.slice(0, 9),
          ]);
        });
      },
    );
  }, []);

  return { recentActivity };
}

/**
 * Hook for real-time voting updates
 */
export function useRealTimeVoting() {
  const [recentVotingActivity, setRecentVotingActivity] = useState<Array<{
    type: 'proposal_created' | 'vote_cast';
    proposalId: number;
    timestamp: Date;
    data: any;
  }>>([]);

  useEffect(() => {
    CitiProofContracts.watchProposalEvents(
      // On proposal created
      (logs) => {
        logs.forEach((log: any) => {
          setRecentVotingActivity(prev => [{
            type: 'proposal_created',
            proposalId: Number(log.args.proposalId),
            timestamp: new Date(),
            data: {
              creator: log.args.creator,
              title: log.args.title,
              proposalType: log.args.proposalType,
            }
          }, ...prev.slice(0, 9)]); // Keep last 10 activities
        });
      },
      // On vote cast
      (logs) => {
        logs.forEach((log: any) => {
          setRecentVotingActivity(prev => [{
            type: 'vote_cast',
            proposalId: Number(log.args.proposalId),
            timestamp: new Date(),
            data: {
              voter: log.args.voter,
              support: log.args.support,
              votingPower: log.args.votingPower,
            }
          }, ...prev.slice(0, 9)]);
        });
      }
    );
  }, []);

  return { recentVotingActivity };
}

/**
 * Hook for proposal statistics
 */
export function useProposalStats() {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    passed: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // For now, we'll get basic counts from active proposals
        // In the future, we can add more specific status-based queries
        const activeProposalIds = await CitiProofContracts.getActiveProposals();
        const proposals = await Promise.all(
          activeProposalIds.map(id => CitiProofContracts.getProposal(Number(id)))
        );
        
        const validProposals = proposals.filter(p => p !== null);
        
        const stats = validProposals.reduce((acc, proposal: any) => {
          acc.total++;
          if (proposal.status === 1) acc.active++; // ACTIVE
          else if (proposal.status === 2) acc.passed++; // PASSED  
          else if (proposal.status === 3) acc.rejected++; // REJECTED
          return acc;
        }, { total: 0, active: 0, passed: 0, rejected: 0 });

        setStats(stats);
      } catch (error) {
        console.error('[useProposalStats] Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading };
}
