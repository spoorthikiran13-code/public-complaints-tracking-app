import { Complaint, QueuedOfflineComplaint } from '../types';
import { CATEGORY_DEFINITIONS } from '../data/mockComplaints';
import { analyzeProblemDepartment } from './complaintAnalyzer';

const OFFLINE_OUTBOX_KEY = 'civic_offline_outbox_queue_v1';
const MAIN_DB_KEY = 'civic_public_complaints_db_v1';

// Load all queued items from localStorage
export function getOfflineOutbox(): QueuedOfflineComplaint[] {
  try {
    const raw = localStorage.getItem(OFFLINE_OUTBOX_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse offline outbox from localStorage:', err);
    return [];
  }
}

// Save entire outbox array to localStorage
export function saveOfflineOutbox(queue: QueuedOfflineComplaint[]): void {
  try {
    localStorage.setItem(OFFLINE_OUTBOX_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error('Failed to save offline outbox (quota exceeded?):', err);
  }
}

// Add a new captured complaint to the offline queue
export function addToOfflineOutbox(
  data: Omit<QueuedOfflineComplaint, 'tempId' | 'capturedAt' | 'syncStatus'>
): QueuedOfflineComplaint {
  const currentQueue = getOfflineOutbox();
  const newItem: QueuedOfflineComplaint = {
    ...data,
    tempId: `offline-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    capturedAt: new Date().toISOString(),
    syncStatus: 'pending',
    attempts: 0
  };

  const updatedQueue = [newItem, ...currentQueue];
  saveOfflineOutbox(updatedQueue);
  return newItem;
}

// Remove an item once successfully synced or discarded
export function removeFromOfflineOutbox(tempId: string): void {
  const currentQueue = getOfflineOutbox();
  const filtered = currentQueue.filter((item) => item.tempId !== tempId);
  saveOfflineOutbox(filtered);
}

// Update status of an outbox item (e.g. 'syncing', 'failed')
export function updateOfflineOutboxItem(
  tempId: string,
  updates: Partial<QueuedOfflineComplaint>
): void {
  const currentQueue = getOfflineOutbox();
  const updated = currentQueue.map((item) => {
    if (item.tempId === tempId) {
      return { ...item, ...updates };
    }
    return item;
  });
  saveOfflineOutbox(updated);
}

// Clear outbox
export function clearOfflineOutbox(): void {
  try {
    localStorage.removeItem(OFFLINE_OUTBOX_KEY);
  } catch (err) {
    console.error('Failed to clear offline outbox:', err);
  }
}

// Convert a queued offline item into an official registered Complaint
export function transformOfflineItemToComplaint(item: QueuedOfflineComplaint): Complaint {
  const randomId = Math.floor(1000 + Math.random() * 9000);
  const trackingCode = `CMP-2026-${randomId}`;
  const routing = analyzeProblemDepartment(`${item.title} ${item.description}`, item.category);

  const nowIso = new Date().toISOString();

  return {
    id: `cmp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    trackingNumber: trackingCode,
    title: item.title,
    description: item.description,
    category: routing.category,
    categoryLabel: routing.categoryLabel,
    status: 'pending',
    priority: item.priority,
    location: item.location,
    photos: item.photos,
    reportedAt: item.capturedAt,
    updatedAt: nowIso,
    author: item.author,
    assignedDepartment: routing.department,
    departmentCode: routing.departmentCode,
    departmentDivision: routing.divisionUnit,
    routingConfidence: routing.confidence,
    routingKeywords: routing.matchedKeywords,
    estimatedResolutionDays: item.priority === 'critical' ? 1 : item.priority === 'high' ? 2 : 4,
    upvotesCount: 1,
    isOfflineQueued: false,
    offlineCapturedAt: item.capturedAt,
    syncedAt: nowIso,
    timeline: [
      {
        id: `t-offline-${Date.now()}-1`,
        status: 'reported',
        title: 'Offline Complaint Captured',
        description: `Logged securely in citizen device storage at ${new Date(item.capturedAt).toLocaleTimeString()} while without internet.`,
        timestamp: item.capturedAt,
        actor: item.author.name,
        actorRole: 'Citizen'
      },
      {
        id: `t-offline-${Date.now()}-2`,
        status: 'reported',
        title: 'Auto-Synced & Routed to Municipal Department',
        description: `Internet connection restored. Analyzed by AI Dispatch Agent and routed directly to ${routing.department} (${routing.divisionUnit}) with ${routing.slaHours}h response SLA.`,
        timestamp: nowIso,
        actor: 'Civic Offline Sync Service Worker',
        actorRole: 'System'
      }
    ]
  };
}

// Sync execution engine: simulates network upload and commits to persisted database
export async function syncOfflineComplaints(
  onProgress?: (progress: { current: number; total: number; itemTitle: string }) => void
): Promise<{
  syncedComplaints: Complaint[];
  failedItems: QueuedOfflineComplaint[];
}> {
  const queue = getOfflineOutbox();
  if (queue.length === 0) {
    return { syncedComplaints: [], failedItems: [] };
  }

  const syncedComplaints: Complaint[] = [];
  const failedItems: QueuedOfflineComplaint[] = [];

  for (let i = 0; i < queue.length; i++) {
    const item = queue[i];
    updateOfflineOutboxItem(item.tempId, { syncStatus: 'syncing' });

    if (onProgress) {
      onProgress({
        current: i + 1,
        total: queue.length,
        itemTitle: item.title
      });
    }

    try {
      // Simulate realistic server upload delay for photo data and metadata verification (350ms)
      await new Promise((resolve) => setTimeout(resolve, 350));

      const newComplaint = transformOfflineItemToComplaint(item);
      syncedComplaints.push(newComplaint);
      removeFromOfflineOutbox(item.tempId);
    } catch (err: any) {
      console.error(`Failed to sync offline complaint ${item.tempId}:`, err);
      updateOfflineOutboxItem(item.tempId, {
        syncStatus: 'failed',
        error: err?.message || 'Network sync error',
        attempts: (item.attempts || 0) + 1
      });
      failedItems.push(item);
    }
  }

  return { syncedComplaints, failedItems };
}
