import React from 'react';
import { Complaint, ComplaintStatus } from '../types';
import { AlertTriangle, Wrench, CheckCircle2, Clock, Activity } from 'lucide-react';

interface DashboardMetricsProps {
  complaints: Complaint[];
  selectedStatus: 'all' | ComplaintStatus;
  onSelectStatus: (status: 'all' | ComplaintStatus) => void;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  complaints,
  selectedStatus,
  onSelectStatus,
}) => {
  const total = complaints.length;
  const pending = complaints.filter(c => c.status === 'pending').length;
  const inProgress = complaints.filter(c => c.status === 'in-progress').length;
  const resolved = complaints.filter(c => c.status === 'resolved').length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Total Reported */}
      <button
        type="button"
        onClick={() => onSelectStatus('all')}
        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
          selectedStatus === 'all'
            ? 'bg-white border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
            : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500">Total Registered</span>
          <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </span>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {total}
        </div>
        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
          <span className="font-semibold text-emerald-600">Active</span> in 6 city wards
        </div>
      </button>

      {/* Pending Triage */}
      <button
        type="button"
        onClick={() => onSelectStatus('pending')}
        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
          selectedStatus === 'pending'
            ? 'bg-amber-50/60 border-amber-500 ring-2 ring-amber-500/20 shadow-sm'
            : 'bg-white border-slate-200/80 hover:border-amber-300 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-amber-700">Pending Review</span>
          <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </span>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-amber-900 tracking-tight">
          {pending}
        </div>
        <div className="text-xs text-amber-700 mt-1 flex items-center gap-1">
          <span>Awaiting inspection</span>
        </div>
      </button>

      {/* In-Progress Maintenance */}
      <button
        type="button"
        onClick={() => onSelectStatus('in-progress')}
        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
          selectedStatus === 'in-progress'
            ? 'bg-blue-50/60 border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
            : 'bg-white border-slate-200/80 hover:border-blue-300 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-blue-700">Work In-Progress</span>
          <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
            <Wrench className="w-4 h-4" />
          </span>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-blue-900 tracking-tight">
          {inProgress}
        </div>
        <div className="text-xs text-blue-700 mt-1 flex items-center gap-1">
          <span>Field crews on-site</span>
        </div>
      </button>

      {/* Resolved */}
      <button
        type="button"
        onClick={() => onSelectStatus('resolved')}
        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
          selectedStatus === 'resolved'
            ? 'bg-emerald-50/60 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
            : 'bg-white border-slate-200/80 hover:border-emerald-300 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-emerald-700">Resolved & Closed</span>
          <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </span>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-emerald-900 tracking-tight">
          {resolved}
        </div>
        <div className="text-xs text-emerald-700 mt-1 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>Avg 28.4h turnaround</span>
        </div>
      </button>
    </div>
  );
};
