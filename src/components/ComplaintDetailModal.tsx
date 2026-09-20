import React, { useState } from 'react';
import { Complaint, ComplaintStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  MapPin, 
  Calendar, 
  Building, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Wrench, 
  ThumbsUp, 
  Share2, 
  ShieldCheck, 
  Send,
  Camera,
  ExternalLink,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Check,
  Volume2,
  VolumeX
} from 'lucide-react';

interface ComplaintDetailModalProps {
  complaint: Complaint | null;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: ComplaintStatus, note?: string, afterPhotoUrl?: string) => void;
  onUpvote: (id: string, e: React.MouseEvent) => void;
  isUpvoted?: boolean;
}

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaint,
  onClose,
  onUpdateStatus,
  onUpvote,
  isUpvoted = false
}) => {
  const { user } = useAuth();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'details' | 'photos'>('timeline');

  // Municipal officer status changer state
  const [officerStatus, setOfficerStatus] = useState<ComplaintStatus>('in-progress');
  const [officerNote, setOfficerNote] = useState('');
  const [officerPhoto, setOfficerPhoto] = useState('');
  const [showStatusChanger, setShowStatusChanger] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeakDetails = () => {
    if (!('speechSynthesis' in window) || !complaint) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const statusText = 
      complaint.status === 'pending' ? 'Pending Review' :
      complaint.status === 'in-progress' ? 'In Progress, maintenance crew dispatched' :
      'Resolved and inspected';

    const textToSpeak = `Complaint ${complaint.trackingNumber}. Status is ${statusText}. Title: ${complaint.title}. Problem details: ${complaint.description}. Location: ${complaint.location.address}. Assigned to ${complaint.assignedDepartment}.`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  if (!complaint) return null;

  const currentStep = 
    complaint.status === 'pending' ? 1 : 
    complaint.status === 'in-progress' ? 2 : 3;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStatus(complaint.id, officerStatus, officerNote, officerPhoto);
    setShowStatusChanger(false);
    setOfficerNote('');
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-150">
      <div 
        id="complaint-detail-modal"
        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-2xs">
              {complaint.trackingNumber}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              complaint.status === 'pending'
                ? 'bg-amber-100 text-amber-800'
                : complaint.status === 'in-progress'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}>
              {complaint.status === 'pending' && <AlertCircle className="w-3.5 h-3.5 text-amber-600" />}
              {complaint.status === 'in-progress' && <Wrench className="w-3.5 h-3.5 text-blue-600" />}
              {complaint.status === 'resolved' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              <span className="capitalize">{complaint.status.replace('-', ' ')}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              title="Copy link to issue"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              id="close-detail-modal-btn"
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Scrollable */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* Main Title & Description */}
          <div>
            <div className="flex items-center justify-between gap-2 text-xs font-semibold text-blue-600 mb-1">
              <div className="flex items-center gap-2">
                <span>{complaint.categoryLabel}</span>
                <span>•</span>
                <span className="text-slate-500">{complaint.location.ward}</span>
              </div>
              {'speechSynthesis' in window && (
                <button
                  type="button"
                  onClick={handleSpeakDetails}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    isSpeaking
                      ? 'bg-rose-100 text-rose-700 animate-pulse'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}
                  title="Listen to report status and details spoken aloud"
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{isSpeaking ? 'Stop Audio' : '🔊 Listen Aloud'}</span>
                </button>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              {complaint.title}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
              {complaint.description}
            </p>
          </div>

          {/* Centralized Resolution Flow Tracker */}
          <div className="bg-gradient-to-r from-slate-50 to-blue-50/30 p-5 rounded-2xl border border-slate-200/90">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                Live Status Tracker
              </span>
              <span className="text-xs font-medium text-slate-600">
                Last updated: {formatDate(complaint.updatedAt)}
              </span>
            </div>

            {/* Stepper Bar */}
            <div className="relative flex items-center justify-between max-w-2xl mx-auto py-2">
              {/* Progress Line */}
              <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-200 -z-0">
                <div 
                  className="h-full bg-blue-600 transition-all duration-500"
                  style={{
                    width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%'
                  }}
                />
              </div>

              {/* Step 1 */}
              <div className="flex flex-col items-center relative z-10">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-xs transition-colors ${
                  currentStep >= 1 ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  1
                </div>
                <span className="text-xs font-semibold mt-1.5 text-slate-800">Reported</span>
                <span className="text-[10px] text-slate-500">Triage phase</span>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center relative z-10">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-xs transition-colors ${
                  currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {currentStep > 2 ? <Check className="w-4 h-4" /> : 2}
                </div>
                <span className="text-xs font-semibold mt-1.5 text-slate-800">In Progress</span>
                <span className="text-[10px] text-slate-500">Crew dispatched</span>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center relative z-10">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-xs transition-colors ${
                  currentStep === 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {currentStep === 3 ? <Check className="w-4 h-4" /> : 3}
                </div>
                <span className="text-xs font-semibold mt-1.5 text-slate-800">Resolved</span>
                <span className="text-[10px] text-slate-500">Inspected & closed</span>
              </div>
            </div>

            {/* Department Assignment Banner */}
            <div className="mt-4 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-slate-600">Assigned Department:</span>
                <strong className="text-slate-900">{complaint.assignedDepartment}</strong>
                {complaint.departmentCode && (
                  <span className="font-mono text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                    {complaint.departmentCode}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {complaint.departmentDivision && (
                  <div className="text-slate-600">
                    Division: <span className="font-semibold text-slate-800">{complaint.departmentDivision}</span>
                  </div>
                )}
                {complaint.assignedCrew && (
                  <div className="text-slate-600">
                    Assigned Crew: <span className="font-semibold text-blue-700">{complaint.assignedCrew}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Photo Gallery with Preview */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Camera className="w-4 h-4 text-blue-600" />
                Citizen Uploaded Photos ({complaint.photos.length})
              </h3>
              {complaint.afterRepairPhotoUrl && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  After-Repair Photo Verified
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {complaint.photos.map((photoUrl, idx) => (
                <div 
                  key={idx}
                  onClick={() => setSelectedPhoto(photoUrl)}
                  className="relative group rounded-xl overflow-hidden h-36 bg-slate-100 border border-slate-200 cursor-pointer shadow-2xs"
                >
                  <img
                    src={photoUrl}
                    alt={`Report evidence ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                    <ExternalLink className="w-4 h-4" /> View Full
                  </div>
                  <span className="absolute bottom-2 left-2 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">
                    Photo #{idx + 1}
                  </span>
                </div>
              ))}

              {complaint.afterRepairPhotoUrl && (
                <div 
                  onClick={() => setSelectedPhoto(complaint.afterRepairPhotoUrl!)}
                  className="relative group rounded-xl overflow-hidden h-36 bg-emerald-50 border-2 border-emerald-400 cursor-pointer shadow-2xs"
                >
                  <img
                    src={complaint.afterRepairPhotoUrl}
                    alt="Resolved evidence"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    After Repair
                  </div>
                  <span className="absolute bottom-2 left-2 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">
                    Resolution Proof
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Timeline & Activity History */}
          <div className="border-t border-slate-200 pt-5">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Chronological Audit Trail & Real-Time Events
            </h3>

            <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {complaint.timeline.map((event) => (
                <div key={event.id} className="relative pl-9">
                  <div className="absolute left-2 top-1.5 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-blue-600" />
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{event.title}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                          {event.actorRole}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">{formatDate(event.timestamp)}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{event.description}</p>
                    {event.photoUrl && (
                      <div className="mt-2">
                        <img
                          src={event.photoUrl}
                          alt="Event documentation"
                          className="h-24 w-auto rounded-lg border border-slate-300 object-cover cursor-pointer hover:opacity-90"
                          onClick={() => setSelectedPhoto(event.photoUrl!)}
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Location & Details Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="font-semibold text-slate-500 block mb-1">Precise Location:</span>
              <div className="flex items-start gap-1.5 text-slate-800">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">{complaint.location.address}</div>
                  {complaint.location.landmark && (
                    <div className="text-slate-500">Landmark: {complaint.location.landmark}</div>
                  )}
                  <div className="text-slate-400 font-mono mt-0.5 text-[11px]">
                    GPS: {complaint.location.latitude.toFixed(4)}, {complaint.location.longitude.toFixed(4)}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <span className="font-semibold text-slate-500 block mb-1">Reported By:</span>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  {complaint.author.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-slate-800 flex items-center gap-1">
                    {complaint.author.name}
                    {complaint.author.isVerified && (
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    )}
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Submitted {formatDate(complaint.reportedAt)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Official Department Notes */}
          {complaint.officialNotes && (
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 mb-1">
                <Building className="w-4 h-4 text-blue-700" />
                Official Department Dispatch Note
              </div>
              <p className="text-xs text-blue-950 leading-relaxed font-mono">
                "{complaint.officialNotes}"
              </p>
            </div>
          )}

          {/* Real-time Status Changer for Municipal Staff or Testing */}
          <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-blue-600" />
                  Status Management & Live Simulation
                </span>
                <p className="text-[11px] text-slate-500">
                  Simulate live crew dispatch or mark as resolved with official proof
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowStatusChanger(!showStatusChanger)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-white border border-slate-300 px-3 py-1.5 rounded-lg shadow-2xs cursor-pointer"
              >
                {showStatusChanger ? 'Hide Controls' : 'Update Status'}
              </button>
            </div>

            {showStatusChanger && (
              <form onSubmit={handleStatusSubmit} className="mt-4 pt-3 border-t border-slate-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setOfficerStatus('pending')}
                    className={`p-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      officerStatus === 'pending'
                        ? 'bg-amber-500 text-white border-amber-600'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    Set: Pending Review
                  </button>
                  <button
                    type="button"
                    onClick={() => setOfficerStatus('in-progress')}
                    className={`p-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      officerStatus === 'in-progress'
                        ? 'bg-blue-600 text-white border-blue-700'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    Set: In Progress (Dispatched)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOfficerStatus('resolved')}
                    className={`p-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      officerStatus === 'resolved'
                        ? 'bg-emerald-600 text-white border-emerald-700'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    Set: Resolved & Closed
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Official Activity Note
                  </label>
                  <input
                    type="text"
                    value={officerNote}
                    onChange={(e) => setOfficerNote(e.target.value)}
                    placeholder="e.g., Road resurfacing crew applied permanent thermal mastic sealant."
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>

                {officerStatus === 'resolved' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      After-Repair Photo URL (Optional verification image)
                    </label>
                    <input
                      type="text"
                      value={officerPhoto}
                      onChange={(e) => setOfficerPhoto(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl text-slate-800"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowStatusChanger(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl cursor-pointer shadow-2xs"
                  >
                    Publish Status Update
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Modal Footer Bar */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={(e) => onUpvote(complaint.id, e)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isUpvoted
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
            <span>{complaint.upvotesCount} Citizens Endorsed</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Full Photo Lightbox Popup */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 text-white hover:text-slate-300 p-2 rounded-full bg-black/40 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={selectedPhoto}
            alt="Enlarged evidence"
            className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
            referrerPolicy="no-referrer"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};
