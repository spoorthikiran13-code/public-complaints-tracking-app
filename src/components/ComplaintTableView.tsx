import React from 'react';
import { Complaint, ComplaintStatus } from '../types';
import { 
  AlertCircle, 
  Wrench, 
  CheckCircle2, 
  MapPin, 
  ThumbsUp, 
  ExternalLink,
  Camera
} from 'lucide-react';

interface ComplaintTableViewProps {
  complaints: Complaint[];
  onSelectComplaint: (complaint: Complaint) => void;
  onUpvote: (id: string, e: React.MouseEvent) => void;
}

export const ComplaintTableView: React.FC<ComplaintTableViewProps> = ({
  complaints,
  onSelectComplaint,
  onUpvote,
}) => {
  const getStatusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <AlertCircle className="w-3 h-3 text-amber-600" />
            Pending
          </span>
        );
      case 'in-progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <Wrench className="w-3 h-3 text-blue-600" />
            In Progress
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Resolved
          </span>
        );
    }
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3.5 px-4">Ticket & Photo</th>
              <th className="py-3.5 px-4">Issue Details</th>
              <th className="py-3.5 px-4">Category / Dept</th>
              <th className="py-3.5 px-4">Status & Progress</th>
              <th className="py-3.5 px-4">Location</th>
              <th className="py-3.5 px-4 text-center">Impact</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {complaints.map((c) => (
              <tr 
                key={c.id} 
                onClick={() => onSelectComplaint(c)}
                className="hover:bg-blue-50/40 transition-colors cursor-pointer"
              >
                {/* Photo & Ticket */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    {c.photos[0] ? (
                      <img 
                        src={c.photos[0]} 
                        alt="thumbnail" 
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                        <Camera className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <div className="font-mono font-bold text-slate-900">{c.trackingNumber}</div>
                      <div className="text-[11px] text-slate-400">{formatDate(c.reportedAt)}</div>
                    </div>
                  </div>
                </td>

                {/* Title & Desc */}
                <td className="py-3 px-4 max-w-xs">
                  <div className="font-bold text-slate-900 line-clamp-1">{c.title}</div>
                  <div className="text-slate-500 line-clamp-1 text-[11px] mt-0.5">{c.description}</div>
                </td>

                {/* Category */}
                <td className="py-3 px-4">
                  <div className="font-medium text-slate-800">{c.categoryLabel}</div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{c.assignedDepartment}</div>
                </td>

                {/* Status */}
                <td className="py-3 px-4">
                  {getStatusBadge(c.status)}
                </td>

                {/* Location */}
                <td className="py-3 px-4 max-w-[160px]">
                  <div className="truncate font-medium text-slate-800 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    {c.location.address}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{c.location.ward}</div>
                </td>

                {/* Impact / Upvotes */}
                <td className="py-3 px-4 text-center">
                  <button
                    type="button"
                    onClick={(e) => onUpvote(c.id, e)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    {c.upvotesCount}
                  </button>
                </td>

                {/* Action */}
                <td className="py-3 px-4 text-right">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700">
                    Track
                    <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
