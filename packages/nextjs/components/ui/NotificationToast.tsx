/**
 * Toast notification component for real-time blockchain events
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, CheckCircle, AlertCircle, Vote, Building } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent } from './card';
import { type Notification } from '@/hooks/useNotifications';

interface NotificationToastProps {
  notification: Notification;
  onRemove: (id: string) => void;
}

export function NotificationToast({ notification, onRemove }: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  const getIcon = () => {
    switch (notification.type) {
      case 'project_registered':
        return <Building className="w-5 h-5 text-ens-blue" />;
      case 'project_status_updated':
        return <CheckCircle className="w-5 h-5 text-civic-green" />;
      case 'proposal_created':
        return <Vote className="w-5 h-5 text-civic-green" />;
      case 'vote_cast':
        return <Bell className="w-5 h-5 text-ens-blue" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBorderColor = () => {
    switch (notification.type) {
      case 'project_registered':
        return 'border-l-ens-blue';
      case 'project_status_updated':
        return 'border-l-civic-green';
      case 'proposal_created':
        return 'border-l-civic-green';
      case 'vote_cast':
        return 'border-l-ens-blue';
      default:
        return 'border-l-gray-400';
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onRemove(notification.id), 300);
    }, 4700); // Remove slightly before the hook timer

    return () => clearTimeout(timer);
  }, [notification.id, onRemove]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.9 }}
          className="mb-2"
        >
          <Card className={`border-l-4 ${getBorderColor()} shadow-lg`}>
            <CardContent className="p-3">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getIcon()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900">
                    {notification.title}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {notification.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-gray-100"
                  onClick={() => {
                    setIsVisible(false);
                    setTimeout(() => onRemove(notification.id), 300);
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface NotificationContainerProps {
  notifications: Notification[];
  onRemoveNotification: (id: string) => void;
  onClearAll: () => void;
}

export function NotificationContainer({ 
  notifications, 
  onRemoveNotification, 
  onClearAll 
}: NotificationContainerProps) {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full space-y-2">
      {notifications.length > 3 && (
        <div className="text-center mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Clear all ({notifications.length})
          </Button>
        </div>
      )}
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {notifications.slice(0, 5).map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onRemove={onRemoveNotification}
          />
        ))}
      </div>
    </div>
  );
}