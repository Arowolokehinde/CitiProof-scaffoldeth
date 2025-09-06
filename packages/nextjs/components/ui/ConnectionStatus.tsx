"use client";

/**
 * Connection status indicator for real-time blockchain updates
 */

import { useState, useEffect } from 'react';
import { Badge } from './badge';
import { Wifi, WifiOff } from 'lucide-react';
import { publicClient } from '@/lib/contracts';

export function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState(false);
  const [blockNumber, setBlockNumber] = useState<bigint>(0n);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const currentBlock = await publicClient.getBlockNumber();
        setBlockNumber(currentBlock);
        setIsConnected(true);
      } catch (error) {
        console.error('Connection check failed:', error);
        setIsConnected(false);
      }
    };

    // Initial check
    checkConnection();

    // Set up block number subscription for real-time updates
    const unsubscribe = publicClient.watchBlockNumber({
      onBlockNumber: (blockNumber) => {
        setBlockNumber(blockNumber);
        setIsConnected(true);
      },
      onError: (error) => {
        console.error('Block subscription error:', error);
        setIsConnected(false);
      }
    });

    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return (
    <Badge 
      variant="outline" 
      className={`flex items-center space-x-2 ${
        isConnected 
          ? 'text-civic-green border-civic-green bg-civic-green/5' 
          : 'text-red-500 border-red-500 bg-red-50'
      }`}
    >
      {isConnected ? (
        <Wifi className="w-3 h-3" />
      ) : (
        <WifiOff className="w-3 h-3" />
      )}
      <span className="text-xs">
        {isConnected 
          ? `Live • Block ${blockNumber.toString().slice(-4)}` 
          : 'Disconnected'
        }
      </span>
    </Badge>
  );
}