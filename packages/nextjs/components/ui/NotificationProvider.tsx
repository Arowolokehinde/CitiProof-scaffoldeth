"use client";

/**
 * Notification Provider for CitiProof
 * Manages real-time blockchain event notifications
 */

import React from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationContainer } from './NotificationToast';

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { 
    notifications, 
    removeNotification, 
    clearAllNotifications 
  } = useNotifications();

  return (
    <>
      {children}
      <NotificationContainer
        notifications={notifications}
        onRemoveNotification={removeNotification}
        onClearAll={clearAllNotifications}
      />
    </>
  );
}