import React from 'react';
import { Complaint, ComplaintStatus } from '../types';
import { 
  MapPin, 
  Clock, 
  ThumbsUp, 
  ShieldCheck, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  Wrench,
  Camera,
  ArrowRight
} from 'lucide-react';

interface ComplaintCardProps {
  complaint: Complaint;
  onClick: () => void;
  onUpvote: (id: string, e: React.MouseEvent) => void;
  isUpvoted?: boolean;
}

export const ComplaintCard: React.FC<ComplaintCardProps> = ({
  complaint,
  onClick,
  onUpvote,
  isUpvoted = false
}) => {
  const getStatusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            Pending Review
          </span>
        );
      case 'in-progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <Wrench className="w-3.5 h-3.5 text-blue-600" />
            In Progress
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Resolved
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700 uppercase tracking-wide">
            Critical
          </span>
        );
      case 'high':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-700 uppercase tracking-wide">
            High Priority
          </span>
        );
      default:
        return null;
    }
  };

  // Step indicator calculation
  const currentStep = complaint.status === 'pending' ? 1 : complaint.status === 'in-progress' ? 2 : 3;

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div
      id={`complaint-card-${complaint.id}`}
      onClick={onClick}
      className="group bg-white rounded-2xl border border-slate-200/80 hover:border-blue-400/80 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col cursor-pointer"
    >
      {/* Photo Header */}
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
        {complaint.photos && complaint.photos.length > 0 ? (
          <img
            src={complaint.photos[0]}
            alt={complaint.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <Camera className="w-8 h-8" />
          </div>
        )}

        {/* Gradient overlay on top */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-black/30" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {getStatusBadge(complaint.status)}
            {getPriorityBadge(complaint.priority)}
          </div>

          <span className="text-[11px] font-mono font-bold bg-slate-900/70 backdrop-blur-xs text-white px-2.5 py-1 rounded-md">
            {complaint.trackingNumber}
          </span>
        </div>

        {/* Bottom image stats */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
          <span className="font-medium bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded text-[11px]">
            {complaint.categoryLabel}
          </span>
          {complaint.photos.length > 1 && (
            <span className="flex items-center gap-1 bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded text-[11px]">
              <Camera className="w-3 h-3" />
              {complaint.photos.length} photos
            </span>
          )}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Location Line */}
          <div className="flex items-center gap-1 text-xs text-slate-500 mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{complaint.location.address}</span>
          </div>

          {/* Title */}
          <h3 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
            {complaint.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-slate-600 line-clamp-2 mt-1.5 leading-relaxed">
            {complaint.description}
          </p>
        </div>

        {/* Mini 3-Stage Progress Timeline */}
        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1 font-medium">
            <span>Resolution Flow</span>
            <span className="font-semibold text-slate-700">
              {complaint.status === 'pending'
                ? 'Triage Stage'
                : complaint.status === 'in-progress'
                ? 'Work Ongoing'
                : 'Verified Fixed'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <div
              className={`h-1.5 rounded-full ${
                currentStep >= 1 ? 'bg-amber-500' : 'bg-slate-200'
              }`}
            />
            <div
              className={`h-1.5 rounded-full ${
                currentStep >= 2 ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            />
            <div
              className={`h-1.5 rounded-full ${
                currentStep >= 3 ? 'bg-emerald-500' : 'bg-slate-200'
              }`}
            />
          </div>
        </div>

        {/* Footer info: Author & Upvote */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="text-[11px] text-slate-500 truncate">
              Reported by <span className="font-semibold text-slate-700">{complaint.author.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={(e) => onUpvote(complaint.id, e)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                isUpvoted
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title="Endorse or upvote this issue"
            >
              <ThumbsUp className="w-3 h-3" />
              <span>{complaint.upvotesCount}</span>
            </button>

            <span className="inline-flex items-center text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
              Track
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
