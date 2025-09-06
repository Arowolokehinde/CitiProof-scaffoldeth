/**
 * Hook for fetching projects with IPFS data - ready for voting
 * This implements the proper flow: Contract -> IPFS -> Combined data
 */
import { useState, useCallback, useEffect } from 'react';
import { CitiProofContracts, type ProjectWithIPFS, ProjectStatus } from '@/lib/contracts';

export interface UseProjectsWithIPFSResult {
  projects: ProjectWithIPFS[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  totalProjects: number;
}

export interface UseProjectsFilteredResult extends UseProjectsWithIPFSResult {
  pendingProjects: ProjectWithIPFS[];
  approvedProjects: ProjectWithIPFS[];
  inProgressProjects: ProjectWithIPFS[];
  completedProjects: ProjectWithIPFS[];
}

/**
 * Hook to fetch ALL projects with IPFS data - the main hook for voting functionality
 */
export function useProjectsWithIPFS(): UseProjectsWithIPFSResult {
  const [projects, setProjects] = useState<ProjectWithIPFS[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalProjects, setTotalProjects] = useState(0);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('[useProjectsWithIPFS] Starting to fetch all projects with IPFS data...');
      
      // Get total projects count first
      const total = await CitiProofContracts.getTotalProjects();
      setTotalProjects(total);
      
      if (total === 0) {
        console.log('[useProjectsWithIPFS] No projects found');
        setProjects([]);
        return;
      }

      // Fetch all projects with IPFS data using our new method
      const projectsWithIPFS = await CitiProofContracts.getAllProjectsWithIPFS();
      
      console.log(`[useProjectsWithIPFS] Successfully fetched ${projectsWithIPFS.length} projects with IPFS data`);
      setProjects(projectsWithIPFS);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch projects";
      console.error('[useProjectsWithIPFS] Error:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
    totalProjects
  };
}

/**
 * Hook to fetch projects filtered by status with IPFS data
 */
export function useProjectsFilteredWithIPFS(): UseProjectsFilteredResult {
  const { projects, loading, error, refetch, totalProjects } = useProjectsWithIPFS();

  // Filter projects by status
  const pendingProjects = projects.filter(p => p.status === ProjectStatus.PENDING);
  const approvedProjects = projects.filter(p => p.status === ProjectStatus.APPROVED);
  const inProgressProjects = projects.filter(p => p.status === ProjectStatus.IN_PROGRESS);
  const completedProjects = projects.filter(p => p.status === ProjectStatus.COMPLETED);

  return {
    projects,
    loading,
    error,
    refetch,
    totalProjects,
    pendingProjects,
    approvedProjects, 
    inProgressProjects,
    completedProjects
  };
}

/**
 * Hook to fetch projects by a specific government entity with IPFS data
 */
export function useProjectsByEntityWithIPFS(entityAddress?: string): UseProjectsWithIPFSResult {
  const [projects, setProjects] = useState<ProjectWithIPFS[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalProjects, setTotalProjects] = useState(0);

  const fetchProjectsByEntity = useCallback(async () => {
    if (!entityAddress) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log(`[useProjectsByEntityWithIPFS] Fetching projects for entity: ${entityAddress}`);
      
      // Get all projects first, then filter by entity
      const allProjectsWithIPFS = await CitiProofContracts.getAllProjectsWithIPFS();
      const entityProjects = allProjectsWithIPFS.filter(p => 
        p.governmentEntity.toLowerCase() === entityAddress.toLowerCase()
      );
      
      setTotalProjects(entityProjects.length);
      setProjects(entityProjects);
      
      console.log(`[useProjectsByEntityWithIPFS] Successfully fetched ${entityProjects.length} projects for entity`);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch projects by entity";
      console.error('[useProjectsByEntityWithIPFS] Error:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [entityAddress]);

  useEffect(() => {
    fetchProjectsByEntity();
  }, [fetchProjectsByEntity]);

  return {
    projects,
    loading,
    error,
    refetch: fetchProjectsByEntity,
    totalProjects
  };
}