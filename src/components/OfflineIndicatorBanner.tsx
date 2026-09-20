import React from 'react';
import { useNetworkStatus } from '../context/NetworkStatusContext';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CloudUpload, 
  CheckCircle2, 
  Inbox, 
  Zap,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export const OfflineIndicatorBanner: React.FC = () => {
  const { 
    effectiveOnline, 
    isSimulatedOffline, 
    toggleSimulateOffline,
    offlineQueue, 
    isSyncing, 
    syncProgress,
    triggerSync,
    setIsOutboxOpen 
  } = useNetworkStatus();

  // If online and nothing is syncing, don't show the banner
  if (effectiveOnline && !isSyncing && offlineQueue.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-900 text-white px-4 py-2.5 shadow-md border-b border-slate-800 transition-all z-20">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
        
        {/* Left: Status Badge & Message */}
        <div className="flex items-center gap-2.5 text-center sm:text-left">
          {isSyncing ? (
            <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            </div>
          ) : !effectiveOnline ? (
            <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <WifiOff className="w-3.5 h-3.5" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Wifi className="w-3.5 h-3.5" />
            </div>
          )}

          <div>
            {isSyncing ? (
              <div className="font-semibold text-blue-300 flex items-center gap-2">
                <span>Auto-Syncing Offline Reports to Municipal Dispatch...</span>
                {syncProgress && (
                  <span className="text-[11px] text-slate-300 font-mono">
                    ({syncProgress.current}/{syncProgress.total}: {syncProgress.itemTitle})
                  </span>
                )}
              </div>
            ) : !effectiveOnline ? (
              <div className="leading-snug">
                <span className="font-bold text-amber-400">Offline Mode Active: </span>
                <span className="text-slate-300">
                  Photos, locations, and voice notes will be securely cached on this device and auto-synced once reconnected.
                </span>
                {isSimulatedOffline && (
                  <span className="ml-1 text-[10px] font-bold bg-amber-900/60 text-amber-300 px-1.5 py-0.5 rounded border border-amber-700/50">
                    SIMULATED
                  </span>
                )}
              </div>
            ) : (
              <div className="text-emerald-300 font-medium">
                Connection Restored. {offlineQueue.length} offline complaint(s) ready to sync.
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* View Outbox Button */}
          {offlineQueue.length > 0 && (
            <button
              type="button"
              onClick={() => setIsOutboxOpen(true)}
              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px] flex items-center gap-1.5 border border-slate-700 cursor-pointer transition-colors"
            >
              <Inbox className="w-3.5 h-3.5 text-amber-400" />
              <span>Outbox ({offlineQueue.length})</span>
            </button>
          )}

          {/* Sync Now Button (Active if online) */}
          {effectiveOnline && offlineQueue.length > 0 && (
            <button
              type="button"
              onClick={() => triggerSync()}
              disabled={isSyncing}
              className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
            >
              <CloudUpload className={`w-3.5 h-3.5 ${isSyncing ? 'animate-bounce' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          )}

          {/* Reconnect / Toggle Simulator Button */}
          {isSimulatedOffline ? (
            <button
              type="button"
              onClick={toggleSimulateOffline}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Wifi className="w-3 h-3" />
              <span>Restore Connection</span>
            </button>
          ) : !effectiveOnline ? (
            <button
              type="button"
              onClick={() => triggerSync()}
              disabled={isSyncing}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Check Network</span>
            </button>
          ) : null}
        </div>

      </div>
    </div>
  );
};
