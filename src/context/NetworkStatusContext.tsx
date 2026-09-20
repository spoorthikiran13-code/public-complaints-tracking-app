import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Complaint, QueuedOfflineComplaint } from '../types';
import { 
  getOfflineOutbox, 
  addToOfflineOutbox, 
  removeFromOfflineOutbox, 
  clearOfflineOutbox,
  syncOfflineComplaints 
} from '../utils/offlineStorage';
import { registerServiceWorker } from '../serviceWorkerRegistration';

interface SyncProgress {
  current: number;
  total: number;
  itemTitle: string;
}

interface NetworkStatusContextType {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  effectiveOnline: boolean;
  toggleSimulateOffline: () => void;
  setSimulateOffline: (val: boolean) => void;
  offlineQueue: QueuedOfflineComplaint[];
  isSyncing: boolean;
  syncProgress: SyncProgress | null;
  lastSyncTime: string | null;
  queueOfflineComplaint: (
    data: Omit<QueuedOfflineComplaint, 'tempId' | 'capturedAt' | 'syncStatus'>
  ) => QueuedOfflineComplaint;
  removeOfflineItem: (tempId: string) => void;
  clearAllOffline: () => void;
  triggerSync: () => Promise<Complaint[]>;
  isOutboxOpen: boolean;
  setIsOutboxOpen: (open: boolean) => void;
}

const NetworkStatusContext = createContext<NetworkStatusContextType | undefined>(undefined);

interface NetworkStatusProviderProps {
  children: React.ReactNode;
  onComplaintsSynced: (newComplaints: Complaint[]) => void;
}

export const NetworkStatusProvider: React.FC<NetworkStatusProviderProps> = ({
  children,
  onComplaintsSynced
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [offlineQueue, setOfflineQueue] = useState<QueuedOfflineComplaint[]>(() => getOfflineOutbox());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isOutboxOpen, setIsOutboxOpen] = useState<boolean>(false);

  const effectiveOnline = isOnline && !isSimulatedOffline;

  // Refresh queue helper
  const refreshQueue = useCallback(() => {
    setOfflineQueue(getOfflineOutbox());
  }, []);

  // Sync execution
  const triggerSync = useCallback(async (): Promise<Complaint[]> => {
    if (isSyncing) return [];
    const currentQueue = getOfflineOutbox();
    if (currentQueue.length === 0) return [];

    setIsSyncing(true);
    try {
      const { syncedComplaints } = await syncOfflineComplaints((progress) => {
        setSyncProgress(progress);
      });

      if (syncedComplaints.length > 0) {
        onComplaintsSynced(syncedComplaints);
        setLastSyncTime(new Date().toISOString());
      }
      refreshQueue();
      return syncedComplaints;
    } catch (err) {
      console.error('Error running offline sync:', err);
      return [];
    } finally {
      setIsSyncing(false);
      setSyncProgress(null);
    }
  }, [isSyncing, onComplaintsSynced, refreshQueue]);

  // Queue a complaint while offline
  const queueOfflineComplaint = useCallback((
    data: Omit<QueuedOfflineComplaint, 'tempId' | 'capturedAt' | 'syncStatus'>
  ): QueuedOfflineComplaint => {
    const item = addToOfflineOutbox(data);
    refreshQueue();
    return item;
  }, [refreshQueue]);

  const removeOfflineItem = useCallback((tempId: string) => {
    removeFromOfflineOutbox(tempId);
    refreshQueue();
  }, [refreshQueue]);

  const clearAllOffline = useCallback(() => {
    clearOfflineOutbox();
    refreshQueue();
  }, [refreshQueue]);

  const toggleSimulateOffline = useCallback(() => {
    setIsSimulatedOffline((prev) => !prev);
  }, []);

  const setSimulateOffline = useCallback((val: boolean) => {
    setIsSimulatedOffline(val);
  }, []);

  // Listen for browser online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Register Service Worker with message callback
    registerServiceWorker(() => {
      if (navigator.onLine && !isSimulatedOffline) {
        triggerSync();
      }
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isSimulatedOffline, triggerSync]);

  // Auto-sync when transitioning back to online
  useEffect(() => {
    if (effectiveOnline && offlineQueue.length > 0 && !isSyncing) {
      // Auto-trigger sync once connection is confirmed
      const timer = setTimeout(() => {
        triggerSync();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [effectiveOnline, offlineQueue.length, isSyncing, triggerSync]);

  return (
    <NetworkStatusContext.Provider
      value={{
        isOnline,
        isSimulatedOffline,
        effectiveOnline,
        toggleSimulateOffline,
        setSimulateOffline,
        offlineQueue,
        isSyncing,
        syncProgress,
        lastSyncTime,
        queueOfflineComplaint,
        removeOfflineItem,
        clearAllOffline,
        triggerSync,
        isOutboxOpen,
        setIsOutboxOpen
      }}
    >
      {children}
    </NetworkStatusContext.Provider>
  );
};

export const useNetworkStatus = () => {
  const context = useContext(NetworkStatusContext);
  if (!context) {
    throw new Error('useNetworkStatus must be used within a NetworkStatusProvider');
  }
  return context;
};
