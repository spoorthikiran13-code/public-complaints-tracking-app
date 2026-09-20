import React from 'react';
import { useNetworkStatus } from '../context/NetworkStatusContext';
import { 
  X, 
  Inbox, 
  CloudUpload, 
  Trash2, 
  Wifi, 
  WifiOff, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  MapPin,
  Camera,
  Layers,
  Sparkles
} from 'lucide-react';

export const OfflineOutboxModal: React.FC = () => {
  const { 
    isOutboxOpen, 
    setIsOutboxOpen, 
    offlineQueue, 
    removeOfflineItem, 
    clearAllOffline, 
    triggerSync, 
    isSyncing, 
    effectiveOnline,
    toggleSimulateOffline,
    isSimulatedOffline
  } = useNetworkStatus();

  if (!isOutboxOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-150">
      <div 
        id="offline-outbox-modal"
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-none">
                  Offline Outbox Queue
                </h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  {offlineQueue.length} pending
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Evidence & reports saved locally in device storage
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOutboxOpen(false)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Network Status Banner inside Modal */}
        <div className={`px-5 py-3 border-b flex items-center justify-between text-xs ${
          effectiveOnline 
            ? 'bg-emerald-50/70 border-emerald-100 text-emerald-900' 
            : 'bg-amber-50/70 border-amber-100 text-amber-900'
        }`}>
          <div className="flex items-center gap-2">
            {effectiveOnline ? (
              <>
                <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span className="font-semibold">Online & Ready to Synchronize</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                <span className="font-semibold">Device is Offline (Reports safely preserved)</span>
              </>
            )}
          </div>

          {isSimulatedOffline ? (
            <button
              type="button"
              onClick={toggleSimulateOffline}
              className="text-[11px] font-bold text-blue-700 underline hover:text-blue-900 cursor-pointer"
            >
              Turn Online & Trigger Sync
            </button>
          ) : !effectiveOnline ? (
            <span className="text-[11px] text-amber-700">
              Will auto-sync immediately when Wi-Fi/data reconnects
            </span>
          ) : (
            <span className="text-[11px] text-emerald-700">
              Auto-sync engine active
            </span>
          )}
        </div>

        {/* List of Queued Items */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-3.5 flex-1">
          {offlineQueue.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                All Reports Are Synchronized!
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                No complaints are waiting in the offline queue. Any new issue captured while offline will appear here.
              </p>
            </div>
          ) : (
            offlineQueue.map((item) => (
              <div 
                key={item.tempId}
                className="bg-white border border-slate-200 rounded-2xl p-4 hover:border-slate-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Photo Preview Thumbnail */}
                  <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                    {item.photos && item.photos.length > 0 ? (
                      <img 
                        src={item.photos[0]} 
                        alt={item.title} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Camera className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        {item.categoryLabel}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(item.capturedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {item.title}
                    </h4>

                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {item.description}
                    </p>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span className="truncate">{item.location.address || item.location.ward}</span>
                    </div>
                  </div>
                </div>

                {/* Status Badge & Delete */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {item.syncStatus === 'syncing' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Syncing...
                    </span>
                  ) : item.syncStatus === 'failed' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
                      <AlertCircle className="w-3 h-3" /> Retry Needed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                      <Clock className="w-3 h-3" /> Saved on Device
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => removeOfflineItem(item.tempId)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete offline draft"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          {offlineQueue.length > 0 ? (
            <button
              type="button"
              onClick={clearAllOffline}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
            >
              Discard All Outbox Items
            </button>
          ) : <div />}

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsOutboxOpen(false)}
              className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              Close
            </button>

            {offlineQueue.length > 0 && (
              <button
                type="button"
                onClick={() => triggerSync()}
                disabled={isSyncing || (!effectiveOnline && !isSimulatedOffline)}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer ${
                  effectiveOnline 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : isSimulatedOffline
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <CloudUpload className={`w-4 h-4 ${isSyncing ? 'animate-bounce' : ''}`} />
                <span>
                  {isSyncing 
                    ? 'Uploading & Syncing...' 
                    : effectiveOnline 
                    ? `Sync ${offlineQueue.length} Item(s) Now` 
                    : isSimulatedOffline 
                    ? 'Reconnect & Sync Now' 
                    : 'Connect to Internet to Sync'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
