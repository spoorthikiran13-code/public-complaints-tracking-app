import React from 'react';
import { Complaint, ComplaintStatus } from '../types';
import { CheckCircle2, Clock, AlertCircle, Filter, Sparkles } from 'lucide-react';

interface CentralizedProgressBarProps {
  complaints: Complaint[];
  selectedStatus: 'all' | ComplaintStatus;
  onSelectStatus: (status: 'all' | ComplaintStatus) => void;
  scopeLabel?: string;
}

export const CentralizedProgressBar: React.FC<CentralizedProgressBarProps> = ({
  complaints,
  selectedStatus,
  onSelectStatus,
  scopeLabel = 'City-Wide Complaints'
}) => {
  const total = complaints.length;
  const pendingCount = complaints.filter(c => c.status === 'pending').length;
  const inProgressCount = complaints.filter(c => c.status === 'in-progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length;

  const pendingPct = total > 0 ? Math.round((pendingCount / total) * 100) : 0;
  const inProgressPct = total > 0 ? Math.round((inProgressCount / total) * 100) : 0;
  const resolvedPct = total > 0 ? 100 - pendingPct - inProgressPct : 0;

  return (
    <div 
      id="centralized-progress-bar-container"
      className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 md:p-6 transition-all"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Centralized Resolution Meter
            </span>
            <span className="text-xs text-slate-600 font-medium">({scopeLabel})</span>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-slate-900 mt-1">
            Real-Time Resolution Status Tracking
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {selectedStatus !== 'all' && (
            <button
              id="clear-status-filter-btn"
              onClick={() => onSelectStatus('all')}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/70 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5" />
              Reset Filter ({selectedStatus})
            </button>
          )}
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
            Total Issues: <strong className="text-slate-900">{total}</strong>
          </span>
        </div>
      </div>

      {/* Main Continuous Progress Bar */}
      <div className="relative pt-1 pb-2">
        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex shadow-inner border border-slate-200/60">
          {pendingPct > 0 && (
            <div
              id="progress-segment-pending"
              style={{ width: `${pendingPct}%` }}
              onClick={() => onSelectStatus(selectedStatus === 'pending' ? 'all' : 'pending')}
              className={`h-full transition-all duration-500 cursor-pointer relative group ${
                selectedStatus === 'pending'
                  ? 'bg-amber-500 ring-2 ring-amber-600 ring-offset-1'
                  : 'bg-amber-400 hover:bg-amber-500'
              }`}
              title={`Pending: ${pendingCount} (${pendingPct}%)`}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}

          {inProgressPct > 0 && (
            <div
              id="progress-segment-in-progress"
              style={{ width: `${inProgressPct}%` }}
              onClick={() => onSelectStatus(selectedStatus === 'in-progress' ? 'all' : 'in-progress')}
              className={`h-full transition-all duration-500 cursor-pointer relative group ${
                selectedStatus === 'in-progress'
                  ? 'bg-blue-600 ring-2 ring-blue-700 ring-offset-1'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
              title={`In Progress: ${inProgressCount} (${inProgressPct}%)`}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}

          {resolvedPct > 0 && (
            <div
              id="progress-segment-resolved"
              style={{ width: `${resolvedPct}%` }}
              onClick={() => onSelectStatus(selectedStatus === 'resolved' ? 'all' : 'resolved')}
              className={`h-full transition-all duration-500 cursor-pointer relative group ${
                selectedStatus === 'resolved'
                  ? 'bg-emerald-600 ring-2 ring-emerald-700 ring-offset-1'
                  : 'bg-emerald-500 hover:bg-emerald-600'
              }`}
              title={`Resolved: ${resolvedCount} (${resolvedPct}%)`}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
        </div>
      </div>

      {/* Interactive Status Segment Cards / Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
        {/* Pending Segment */}
        <button
          id="btn-filter-pending"
          type="button"
          onClick={() => onSelectStatus(selectedStatus === 'pending' ? 'all' : 'pending')}
          className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
            selectedStatus === 'pending'
              ? 'bg-amber-50/80 border-amber-300 ring-1 ring-amber-400'
              : 'bg-slate-50/60 border-slate-200/80 hover:bg-amber-50/40 hover:border-amber-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </span>
            <div>
              <div className="text-xs font-semibold text-slate-700">Pending Review</div>
              <div className="text-xs text-slate-600">Awaiting department triage</div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-base font-bold text-amber-700">{pendingCount}</span>
            <span className="text-xs text-amber-800 font-medium block">({pendingPct}%)</span>
          </div>
        </button>

        {/* In Progress Segment */}
        <button
          id="btn-filter-in-progress"
          type="button"
          onClick={() => onSelectStatus(selectedStatus === 'in-progress' ? 'all' : 'in-progress')}
          className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
            selectedStatus === 'in-progress'
              ? 'bg-blue-50/80 border-blue-300 ring-1 ring-blue-400'
              : 'bg-slate-50/60 border-slate-200/80 hover:bg-blue-50/40 hover:border-blue-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </span>
            <div>
              <div className="text-xs font-semibold text-slate-700">In Progress</div>
              <div className="text-xs text-slate-600">Crew dispatched & active</div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-base font-bold text-blue-700">{inProgressCount}</span>
            <span className="text-xs text-blue-800 font-medium block">({inProgressPct}%)</span>
          </div>
        </button>

        {/* Resolved Segment */}
        <button
          id="btn-filter-resolved"
          type="button"
          onClick={() => onSelectStatus(selectedStatus === 'resolved' ? 'all' : 'resolved')}
          className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
            selectedStatus === 'resolved'
              ? 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-400'
              : 'bg-slate-50/60 border-slate-200/80 hover:bg-emerald-50/40 hover:border-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </span>
            <div>
              <div className="text-xs font-semibold text-slate-700">Resolved</div>
              <div className="text-xs text-slate-600">Inspected & verified closed</div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-base font-bold text-emerald-700">{resolvedCount}</span>
            <span className="text-xs text-emerald-800 font-medium block">({resolvedPct}%)</span>
          </div>
        </button>
      </div>
    </div>
  );
};
