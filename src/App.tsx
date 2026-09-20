/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Complaint, ComplaintStatus, FilterState } from './types';
import { INITIAL_COMPLAINTS } from './data/mockComplaints';
import { Header } from './components/Header';
import { CentralizedProgressBar } from './components/CentralizedProgressBar';
import { DashboardMetrics } from './components/DashboardMetrics';
import { ComplaintFilters } from './components/ComplaintFilters';
import { ComplaintCard } from './components/ComplaintCard';
import { ComplaintDetailModal } from './components/ComplaintDetailModal';
import { ReportIssueModal } from './components/ReportIssueModal';
import { AuthModal } from './components/AuthModal';
import { MapView } from './components/MapView';
import { ComplaintTableView } from './components/ComplaintTableView';
import { ToastContainer, ToastMessage } from './components/Toast';
import { NetworkStatusProvider } from './context/NetworkStatusContext';
import { OfflineIndicatorBanner } from './components/OfflineIndicatorBanner';
import { OfflineOutboxModal } from './components/OfflineOutboxModal';
import { analyzeDuplicateProblem } from './utils/complaintAnalyzer';
import { 
  Camera, 
  PlusCircle, 
  AlertCircle, 
  Sparkles, 
  RefreshCw, 
  SlidersHorizontal,
  Layers,
  FileText,
  User,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Search
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'civic_public_complaints_db_v1';
const UPVOTES_STORAGE_KEY = 'civic_user_upvotes_v1';

function ComplaintsAppContent() {
  const { user } = useAuth();

  // Load complaints from localStorage or use initial set
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved complaints', e);
    }
    return INITIAL_COMPLAINTS;
  });

  // User upvoted IDs
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(UPVOTES_STORAGE_KEY);
      if (saved) {
        return new Set(JSON.parse(saved));
      }
    } catch {
      // fallback
    }
    return new Set<string>();
  });

  // Handle incoming synced complaints from offline storage
  const handleComplaintsSynced = (syncedComplaints: Complaint[]) => {
    let newlyCreated = 0;
    let mergedDuplicates = 0;

    setComplaints(prev => {
      let current = [...prev];

      for (const synced of syncedComplaints) {
        // Skip if exact ID already exists
        if (current.some(c => c.id === synced.id)) continue;

        // Intelligent Agent Duplicate Analysis
        const dupCheck = analyzeDuplicateProblem({
          category: synced.category,
          ward: synced.location.ward,
          address: synced.location.address,
          title: synced.title,
          description: synced.description,
          latitude: synced.location.latitude,
          longitude: synced.location.longitude,
          landmark: synced.location.landmark
        }, current);

        if (dupCheck.isDuplicate && dupCheck.existingComplaint) {
          // STRICT RULE: Agent does NOT allow duplicate problem! Merges into existing ticket.
          mergedDuplicates++;
          const targetId = dupCheck.existingComplaint.id;
          const extraPhoto = synced.photos[0];

          current = current.map(c => {
            if (c.id === targetId) {
              const updatedPhotos = extraPhoto && !c.photos.includes(extraPhoto)
                ? [...c.photos, extraPhoto]
                : c.photos;

              return {
                ...c,
                upvotesCount: c.upvotesCount + 1,
                photos: updatedPhotos,
                timeline: [
                  ...c.timeline,
                  {
                    id: `t-offline-merge-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
                    status: c.status,
                    title: 'Offline Report Auto-Merged (Duplicate Disallowed)',
                    description: `AI Agent identified identical problem for ${synced.location.address} (${synced.location.ward}). Evidence merged and urgency elevated without creating duplicate work order.`,
                    timestamp: new Date().toISOString(),
                    actor: synced.author.name || 'Citizen User',
                    actorRole: 'Citizen' as const,
                    photoUrl: extraPhoto
                  }
                ]
              };
            }
            return c;
          });
        } else {
          newlyCreated++;
          current = [synced, ...current];
        }
      }

      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
      } catch (e) {
        console.error('Failed to save complaints', e);
      }
      return current;
    });

    if (mergedDuplicates > 0) {
      addToast(
        'info',
        'AI Agent Duplicate Prevention',
        `${mergedDuplicates} synced report(s) matched active tickets and were merged as citizen endorsements (duplicate tickets disallowed).`
      );
    }
    if (newlyCreated > 0) {
      addToast(
        'success',
        'Offline Reports Dispatched',
        `Successfully routed ${newlyCreated} verified complaint(s) to respective municipal departments.`
      );
    }
  };

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'info' | 'warning', title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Sync complaints to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(complaints));
    } catch (e) {
      console.error('Failed to save complaints', e);
    }
  }, [complaints]);

  // Sync upvotes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(UPVOTES_STORAGE_KEY, JSON.stringify(Array.from(upvotedIds)));
    } catch {
      // ignore
    }
  }, [upvotedIds]);

  // Modals state
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Active top-level tab: 'all' | 'my-complaints'
  const [activeTab, setActiveTab] = useState<'all' | 'my-complaints'>('all');

  // Filters state
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    category: 'all',
    ward: 'all',
    search: '',
    sortBy: 'newest',
    viewMode: 'grid',
    onlyMyComplaints: false,
  });

  // Keep selectedComplaint updated when complaints array changes
  useEffect(() => {
    if (selectedComplaint) {
      const updated = complaints.find(c => c.id === selectedComplaint.id);
      if (updated) {
        setSelectedComplaint(updated);
      }
    }
  }, [complaints]);

  const handleUpdateFilters = (updates: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  const handleResetFilters = () => {
    setFilters({
      status: 'all',
      category: 'all',
      ward: 'all',
      search: '',
      sortBy: 'newest',
      viewMode: filters.viewMode,
      onlyMyComplaints: false,
    });
  };

  const handleStatusProgressSelect = (status: 'all' | ComplaintStatus) => {
    setFilters(prev => ({ ...prev, status }));
  };

  // Upvote handling
  const handleUpvote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isAlreadyUpvoted = upvotedIds.has(id);
    
    setComplaints(prev => prev.map(c => {
      if (c.id === id) {
        const delta = isAlreadyUpvoted ? -1 : 1;
        return {
          ...c,
          upvotesCount: Math.max(0, c.upvotesCount + delta)
        };
      }
      return c;
    }));

    setUpvotedIds(prev => {
      const next = new Set(prev);
      if (isAlreadyUpvoted) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

    if (!isAlreadyUpvoted) {
      addToast('success', 'Endorsement Recorded', 'Your citizen impact signal was added to accelerate municipal triage.');
    }
  };

  // Submit new complaint
  const handleCreateComplaint = (newIssue: Complaint) => {
    setComplaints(prev => [newIssue, ...prev]);
    addToast(
      'success',
      `Complaint Registered (${newIssue.trackingNumber})`,
      'Your photo evidence and issue report were forwarded to the department dispatch.'
    );
  };

  // Merge duplicate complaint: add citizen photo & impact vote to existing active issue
  const handleMergeDuplicate = (existingId: string, additionalPhoto?: string) => {
    let mergedTrackingNumber = '';
    setComplaints(prev => prev.map(c => {
      if (c.id === existingId) {
        mergedTrackingNumber = c.trackingNumber;
        const now = new Date().toISOString();
        const endorserName = user?.name || 'Citizen User';
        const updatedPhotos = additionalPhoto && !c.photos.includes(additionalPhoto)
          ? [...c.photos, additionalPhoto]
          : c.photos;

        const newTimelineEvent = {
          id: `t-${Date.now()}`,
          status: c.status,
          title: 'Citizen Report Merged & Endorsed',
          description: `Corroborating citizen evidence registered by ${endorserName} at this location. Urgency score elevated to accelerate repair dispatch.`,
          timestamp: now,
          actor: endorserName,
          actorRole: 'Citizen' as const,
          photoUrl: additionalPhoto
        };

        return {
          ...c,
          upvotesCount: c.upvotesCount + 1,
          photos: updatedPhotos,
          timeline: [...c.timeline, newTimelineEvent]
        };
      }
      return c;
    }));

    setUpvotedIds(prev => new Set(prev).add(existingId));

    addToast(
      'success',
      `Report Merged with ${mergedTrackingNumber || 'Existing Issue'}`,
      'Duplicate ticket avoided! Your evidence and +1 priority vote were appended to the active dispatch order.'
    );
  };

  // Update status (e.g. from officer modal or simulator)
  const handleUpdateStatus = (
    id: string,
    newStatus: ComplaintStatus,
    note?: string,
    afterPhotoUrl?: string
  ) => {
    setComplaints(prev => prev.map(c => {
      if (c.id === id) {
        const now = new Date().toISOString();
        const roleName = user?.role === 'municipal_officer' ? 'Municipal Officer' : 'Field Crew';
        const actorName = user?.name || 'Department Supervisor';

        const newTimelineEvent = {
          id: `t-${Date.now()}`,
          status: newStatus,
          title: newStatus === 'resolved' 
            ? 'Work Completed & Inspected' 
            : newStatus === 'in-progress' 
            ? 'Maintenance Crew Dispatched' 
            : 'Re-evaluated for Triage',
          description: note || `Status transitioned to ${newStatus.replace('-', ' ')} by ${actorName}.`,
          timestamp: now,
          actor: actorName,
          actorRole: roleName as any,
          photoUrl: afterPhotoUrl || undefined
        };

        return {
          ...c,
          status: newStatus,
          updatedAt: now,
          resolvedAt: newStatus === 'resolved' ? now : c.resolvedAt,
          officialNotes: note || c.officialNotes,
          afterRepairPhotoUrl: afterPhotoUrl || c.afterRepairPhotoUrl,
          timeline: [...c.timeline, newTimelineEvent]
        };
      }
      return c;
    }));

    addToast(
      'info',
      'Status Updated in Real Time',
      `Issue status moved to "${newStatus.replace('-', ' ')}". Timeline updated.`
    );
  };

  // Filtered complaints computation
  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      // My complaints filter (if tab is 'my-complaints')
      if (activeTab === 'my-complaints') {
        const isAuthor = user && (c.author.id === user.id || c.author.name === user.name);
        if (!isAuthor) return false;
      }

      // Status filter
      if (filters.status !== 'all' && c.status !== filters.status) {
        return false;
      }

      // Category filter
      if (filters.category !== 'all' && c.category !== filters.category) {
        return false;
      }

      // Ward filter
      if (filters.ward !== 'all' && c.location.ward !== filters.ward) {
        return false;
      }

      // Search query
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase();
        const matchesTracking = c.trackingNumber.toLowerCase().includes(q);
        const matchesTitle = c.title.toLowerCase().includes(q);
        const matchesDesc = c.description.toLowerCase().includes(q);
        const matchesAddress = c.location.address.toLowerCase().includes(q);
        const matchesLandmark = c.location.landmark?.toLowerCase().includes(q);
        const matchesDept = c.assignedDepartment.toLowerCase().includes(q);

        if (!matchesTracking && !matchesTitle && !matchesDesc && !matchesAddress && !matchesLandmark && !matchesDept) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'newest') {
        return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
      }
      if (filters.sortBy === 'upvotes') {
        return b.upvotesCount - a.upvotesCount;
      }
      if (filters.sortBy === 'priority') {
        const rank = { critical: 4, high: 3, medium: 2, low: 1 };
        return rank[b.priority] - rank[a.priority];
      }
      return 0;
    });
  }, [complaints, activeTab, filters, user]);

  // Count of user complaints
  const myComplaintsCount = useMemo(() => {
    if (!user) return 0;
    return complaints.filter(c => c.author.id === user.id || c.author.name === user.name).length;
  }, [complaints, user]);

  const hasActiveFilters = 
    filters.status !== 'all' || 
    filters.category !== 'all' || 
    filters.ward !== 'all' || 
    Boolean(filters.search.trim());

  // Reset database back to default initial set
  const handleResetData = () => {
    if (window.confirm('Reset all demo data back to default civic incidents?')) {
      setComplaints(INITIAL_COMPLAINTS);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      addToast('info', 'Demo Data Reset', 'Default community infrastructure records reloaded.');
    }
  };

  return (
    <NetworkStatusProvider onComplaintsSynced={handleComplaintsSynced}>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        {/* Top Header */}
        <Header
          onOpenReportModal={() => setIsReportModalOpen(true)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          myComplaintsCount={myComplaintsCount}
        />

        {/* Real-time Offline & Background Sync Indicator Banner */}
        <OfflineIndicatorBanner />

        {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Role Banner if Officer */}
        {user?.role === 'municipal_officer' && (
          <div className="p-3.5 bg-blue-900 text-white rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-blue-700 flex items-center justify-center font-bold text-xs">
                PW
              </span>
              <div>
                <div className="text-xs font-bold">Public Works Operations View (Supervisory Mode)</div>
                <div className="text-[11px] text-blue-200">
                  Logged in as {user.name} • Full authorization to advance issue milestones & update dispatch notes.
                </div>
              </div>
            </div>
            <span className="text-[11px] font-mono bg-blue-800 px-2.5 py-1 rounded-lg border border-blue-600">
              DISPATCH CHANNEL ONLINE
            </span>
          </div>
        )}

        {/* Centralized Progress Bar Section */}
        <section aria-label="Resolution Status Central Progress">
          <CentralizedProgressBar
            complaints={activeTab === 'my-complaints' ? complaints.filter(c => c.author.name === user?.name) : complaints}
            selectedStatus={filters.status}
            onSelectStatus={handleStatusProgressSelect}
            scopeLabel={activeTab === 'my-complaints' ? 'My Reported Incidents' : 'City-Wide Complaints'}
          />
        </section>

        {/* Dashboard Metrics Cards */}
        <section aria-label="Key Metrics Overview">
          <DashboardMetrics
            complaints={activeTab === 'my-complaints' ? complaints.filter(c => c.author.name === user?.name) : complaints}
            selectedStatus={filters.status}
            onSelectStatus={handleStatusProgressSelect}
          />
        </section>

        {/* Filters and Controls */}
        <section aria-label="Complaints Filters and Search">
          <ComplaintFilters
            filters={filters}
            onFilterChange={handleUpdateFilters}
            onResetFilters={handleResetFilters}
            hasActiveFilters={hasActiveFilters}
            totalFilteredCount={filteredComplaints.length}
          />
        </section>

        {/* Complaints List / Grid / Map Display */}
        <section aria-label="Complaints Viewport">
          {filteredComplaints.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-2xs">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-4">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                No matching infrastructure issues found
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-5">
                We couldn't find any reports matching your current filter criteria.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Clear All Filters
                </button>
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Report a New Issue
                </button>
              </div>
            </div>
          ) : filters.viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredComplaints.map((c) => (
                <ComplaintCard
                  key={c.id}
                  complaint={c}
                  onClick={() => setSelectedComplaint(c)}
                  onUpvote={handleUpvote}
                  isUpvoted={upvotedIds.has(c.id)}
                />
              ))}
            </div>
          ) : filters.viewMode === 'list' ? (
            /* Detailed Table View */
            <ComplaintTableView
              complaints={filteredComplaints}
              onSelectComplaint={setSelectedComplaint}
              onUpvote={handleUpvote}
            />
          ) : (
            /* Interactive Stylized Map View */
            <MapView
              complaints={filteredComplaints}
              onSelectComplaint={setSelectedComplaint}
            />
          )}
        </section>

        {/* Civic Portal Informational Footer Bar */}
        <footer className="pt-8 pb-12 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
              C
            </div>
            <span>Public Complaints Tracking Portal • City Infrastructure Resolution Desk</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleResetData}
              className="text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Demo Records
            </button>
            <span>Emergency Dispatch: Dial 311</span>
          </div>
        </footer>
      </main>

      {/* Floating Action Button on Mobile */}
      <div className="sm:hidden fixed bottom-5 right-5 z-40">
        <button
          type="button"
          onClick={() => setIsReportModalOpen(true)}
          className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl flex items-center justify-center cursor-pointer active:scale-95 transition-all"
          title="Report Local Infrastructure Issue"
        >
          <Camera className="w-6 h-6" />
        </button>
      </div>

      {/* Modals */}
      {selectedComplaint && (
        <ComplaintDetailModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          onUpdateStatus={handleUpdateStatus}
          onUpvote={handleUpvote}
          isUpvoted={upvotedIds.has(selectedComplaint.id)}
        />
      )}

      <ReportIssueModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitComplaint={handleCreateComplaint}
        existingComplaints={complaints}
        onSelectExistingComplaint={(comp) => {
          setSelectedComplaint(comp);
          setIsReportModalOpen(false);
        }}
        onMergeDuplicate={handleMergeDuplicate}
        onOfflineQueued={(itemTitle) => {
          addToast(
            'info',
            'Complaint Saved to Local Outbox',
            `"${itemTitle}" was saved offline on this device. It will automatically upload once your internet connection is restored.`
          );
        }}
      />

      <OfflineOutboxModal />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Toast notifications */}
      <ToastContainer
        toasts={toasts}
        onDismiss={removeToast}
      />
    </div>
    </NetworkStatusProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ComplaintsAppContent />
    </AuthProvider>
  );
}
