/**
 * Real-time notification system for CitiProof
 * Provides toast notifications for blockchain events
 */

import { useState, useEffect } from 'react';
import { CitiProofContracts } from '@/lib/contracts';

export interface Notification {
  id: string;
  type: 'project_registered' | 'project_status_updated' | 'proposal_created' | 'vote_cast';
  title: string;
  message: string;
  timestamp: Date;
  data?: any;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Keep last 50
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeNotification(newNotification.id);
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  useEffect(() => {
    // Watch project events
    CitiProofContracts.watchProjectEvents(
      // On project registered
      (logs) => {
        logs.forEach((log: any) => {
          addNotification({
            type: 'project_registered',
            title: 'New Project Registered',
            message: `"${log.args.title}" has been submitted for review`,
            data: { projectId: Number(log.args.projectId) }
          });
        });
      },
      // On project status updated
      (logs) => {
        logs.forEach((log: any) => {
          const statusNames = ['Pending', 'Approved', 'In Progress', 'Completed', 'Cancelled', 'On Hold'];
          addNotification({
            type: 'project_status_updated',
            title: 'Project Status Updated',
            message: `Project #${log.args.projectId} is now ${statusNames[log.args.newStatus]}`,
            data: { 
              projectId: Number(log.args.projectId),
              newStatus: log.args.newStatus 
            }
          });
        });
      }
    );

    // Watch proposal events
    CitiProofContracts.watchProposalEvents(
      // On proposal created
      (logs) => {
        logs.forEach((log: any) => {
          addNotification({
            type: 'proposal_created',
            title: 'New Proposal Created',
            message: `"${log.args.title}" is now open for voting`,
            data: { proposalId: Number(log.args.proposalId) }
          });
        });
      },
      // On vote cast
      (logs) => {
        logs.forEach((log: any) => {
          addNotification({
            type: 'vote_cast',
            title: 'Vote Cast',
            message: `A ${log.args.support ? 'YES' : 'NO'} vote was cast on proposal #${log.args.proposalId}`,
            data: { 
              proposalId: Number(log.args.proposalId),
              support: log.args.support 
            }
          });
        });
      }
    );
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications
  };
}