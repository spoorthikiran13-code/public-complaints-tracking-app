import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Complaint, IssueCategory, PriorityLevel, DuplicateAnalysisResult } from '../types';
import { CATEGORY_DEFINITIONS, WARDS_LIST } from '../data/mockComplaints';
import { useAuth } from '../context/AuthContext';
import { useNetworkStatus } from '../context/NetworkStatusContext';
import { analyzeProblemDepartment, analyzeDuplicateProblem } from '../utils/complaintAnalyzer';
import { 
  X, 
  Upload, 
  Camera, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Trash2,
  Crosshair,
  Image as ImageIcon,
  ChevronRight,
  Info,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Hammer,
  Lightbulb,
  Droplets,
  TrafficCone,
  Trees,
  Footprints,
  Check,
  Zap,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  ThumbsUp,
  Eye,
  ExternalLink,
  ArrowRight,
  WifiOff,
  CloudUpload,
  Inbox,
  Building2,
  AlertOctagon,
  Ban,
  CheckCheck
} from 'lucide-react';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitComplaint: (newComplaint: Complaint) => void;
  existingComplaints: Complaint[];
  onSelectExistingComplaint: (complaint: Complaint) => void;
  onMergeDuplicate: (existingId: string, additionalPhoto?: string) => void;
  onOfflineQueued?: (itemTitle: string) => void;
}

const SAMPLE_PHOTO_PRESETS = [
  {
    name: 'Pothole on Asphalt',
    url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1000&q=80',
    category: 'pothole_road' as IssueCategory
  },
  {
    name: 'Broken Streetlamp',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80',
    category: 'street_light' as IssueCategory
  },
  {
    name: 'Water Pipe Rupture',
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1000&q=80',
    category: 'water_sewage' as IssueCategory
  },
  {
    name: 'Accumulated Waste',
    url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=1000&q=80',
    category: 'waste_sanitation' as IssueCategory
  },
  {
    name: 'Damaged Sidewalk',
    url: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=1000&q=80',
    category: 'sidewalk_pedestrian' as IssueCategory
  }
];

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({
  isOpen,
  onClose,
  onSubmitComplaint,
  existingComplaints,
  onSelectExistingComplaint,
  onMergeDuplicate,
  onOfflineQueued
}) => {
  const { user } = useAuth();
  const { effectiveOnline, queueOfflineComplaint } = useNetworkStatus();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Reporting Mode: 'quick' (1-Tap Zero-Typing for everyone) vs 'detailed' (Standard Form)
  const [mode, setMode] = useState<'quick' | 'detailed'>('quick');

  const [category, setCategory] = useState<IssueCategory>('pothole_road');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [ward, setWard] = useState<string>(WARDS_LIST[0]);
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  // Voice Note & Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Agent Duplicate Detection State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisDuration, setAnalysisDuration] = useState<string>('0.18s');
  const [duplicateConflict, setDuplicateConflict] = useState<Complaint | null>(null);
  const [duplicateResult, setDuplicateResult] = useState<DuplicateAnalysisResult | null>(null);

  // Combined text input for intelligent problem classification & routing
  const problemText = useMemo(() => {
    return `${title} ${description} ${voiceTranscript}`.trim();
  }, [title, description, voiceTranscript]);

  // AI Municipal Department Routing Engine
  const routingResult = useMemo(() => {
    return analyzeProblemDepartment(problemText, category);
  }, [problemText, category]);

  // Real-time Candidate Duplicate Analysis via Agent
  const liveDuplicateCheck = useMemo(() => {
    return analyzeDuplicateProblem(
      {
        category,
        ward,
        address,
        title: title || `${CATEGORY_DEFINITIONS[category].label} Hazard`,
        description: problemText || 'Visual photo complaint',
        landmark
      },
      existingComplaints
    );
  }, [category, ward, address, title, problemText, landmark, existingComplaints]);

  // Cleanup speech synthesis and recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!isOpen) return null;

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setPhotos(prev => [...prev, e.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleSelectSample = (preset: typeof SAMPLE_PHOTO_PRESETS[0]) => {
    setPhotos(prev => [...prev, preset.url]);
    setCategory(preset.category);
    if (!title) {
      setTitle(`${preset.name} hazard`);
    }
  };

  const handleDetectLocation = () => {
    setIsDetectingLocation(true);
    // Simulate high precision GPS acquisition
    setTimeout(() => {
      setIsDetectingLocation(false);
      setLocationDetected(true);
      setAddress('742 Evergreen Terrace, near Maple Crossing');
      setLandmark('Opposite Public Library Entrance');
      setWard(WARDS_LIST[2]);
    }, 450);
  };

  // Toggle Voice Recording / Speech-to-text
  const handleToggleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListening(false);
      return;
    }

    if (!SpeechRecognition) {
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        const voiceText = "Voice note: Citizen recorded dangerous issue. Immediate inspection requested.";
        setVoiceTranscript(voiceText);
        setDescription(prev => prev ? `${prev} | ${voiceText}` : voiceText);
      }, 2000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setVoiceTranscript(transcript);
        setDescription(transcript);
        if (!title) {
          setTitle(transcript.slice(0, 50));
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Listen Aloud using Web Speech Synthesis
  const handleSpeakSummary = () => {
    if (!('speechSynthesis' in window)) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    let textToSpeak = '';
    if (duplicateConflict) {
      textToSpeak = `Municipal Agent Alert: An identical ${duplicateConflict.categoryLabel} is already active at this location with tracking number ${duplicateConflict.trackingNumber}. You can merge your photo and add an impact vote without creating a duplicate ticket.`;
    } else {
      const currentCat = CATEGORY_DEFINITIONS[category].label;
      const currentLoc = address || ward;
      textToSpeak = `Complaint Category: ${currentCat}. Location: ${currentLoc}. Description: ${description || voiceTranscript || 'Visual photo complaint.'}`;
    }
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);
    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  const getCategoryIcon = (catKey: IssueCategory) => {
    switch (catKey) {
      case 'pothole_road':
        return <Hammer className="w-5 h-5 text-amber-600" />;
      case 'street_light':
        return <Lightbulb className="w-5 h-5 text-yellow-500" />;
      case 'water_sewage':
        return <Droplets className="w-5 h-5 text-blue-500" />;
      case 'waste_sanitation':
        return <Trash2 className="w-5 h-5 text-emerald-600" />;
      case 'traffic_signal':
        return <TrafficCone className="w-5 h-5 text-rose-500" />;
      case 'parks_trees':
        return <Trees className="w-5 h-5 text-green-600" />;
      case 'sidewalk_pedestrian':
        return <Footprints className="w-5 h-5 text-indigo-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-blue-500" />;
    }
  };

  // Agent Duplicate Check & Fast Submission Trigger
  const handleInitiateSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Fraction-of-a-second agent analysis simulation (220ms - 280ms)
    setIsAnalyzing(true);
    const startTimestamp = performance.now();

    setTimeout(() => {
      const endTimestamp = performance.now();
      const elapsedSeconds = ((endTimestamp - startTimestamp) / 1000).toFixed(2);
      setAnalysisDuration(`${elapsedSeconds}s`);
      setIsAnalyzing(false);

      // Deep Agent Analysis for Duplicate Problems
      const check = analyzeDuplicateProblem(
        {
          category,
          ward,
          address,
          title: title.trim() || `${CATEGORY_DEFINITIONS[category].label} Hazard`,
          description: `${description} ${voiceTranscript}`.trim() || 'Visual photo complaint',
          landmark: landmark.trim()
        },
        existingComplaints
      );

      // STRICT USER REQUIREMENT: If the problem is identical to an existing problem, the agent DOES NOT allow it!
      if (check.isDuplicate && check.existingComplaint) {
        setDuplicateResult(check);
        setDuplicateConflict(check.existingComplaint);
        return;
      }

      // No duplicate conflict found: proceed with official registration to verified department
      executeRegistration();
    }, 260);
  };

  // Perform Final Registration
  const executeRegistration = () => {
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const trackingCode = `CMP-2026-${randomId}`;
    const categoryInfo = CATEGORY_DEFINITIONS[category];

    const finalPhotos = photos.length > 0 
      ? photos 
      : [SAMPLE_PHOTO_PRESETS.find(p => p.category === category)?.url || SAMPLE_PHOTO_PRESETS[0].url];

    const finalTitle = title.trim() || `${categoryInfo.label} Hazard Reported`;
    const finalDescription = description.trim() || voiceTranscript.trim() || 
      'Citizen filed this report directly with camera photo evidence and GPS location. No manual text provided.';
    const finalAddress = address.trim() || (locationDetected ? 'Current Location (GPS Locked)' : `${ward}, Zone Area`);

    // Handle Offline Capture: If disconnected, store in Service Worker / Local Outbox
    if (!effectiveOnline) {
      queueOfflineComplaint({
        title: finalTitle,
        description: finalDescription,
        category,
        categoryLabel: categoryInfo.label,
        priority,
        location: {
          address: finalAddress,
          ward,
          latitude: 37.7749 + (Math.random() - 0.5) * 0.05,
          longitude: -122.4194 + (Math.random() - 0.5) * 0.05,
          landmark: landmark.trim() || undefined
        },
        photos: finalPhotos,
        author: {
          id: user?.id || 'usr-anonymous',
          name: user?.name || 'Concerned Citizen',
          isVerified: user?.isVerified || false,
          avatar: user?.avatar
        }
      });

      if (onOfflineQueued) {
        onOfflineQueued(finalTitle);
      }
      onClose();
      return;
    }

    const newIssue: Complaint = {
      id: `cmp-${Date.now()}`,
      trackingNumber: trackingCode,
      title: finalTitle,
      description: finalDescription,
      category,
      categoryLabel: categoryInfo.label,
      status: 'pending',
      priority,
      location: {
        address: finalAddress,
        ward,
        latitude: 37.7749 + (Math.random() - 0.5) * 0.05,
        longitude: -122.4194 + (Math.random() - 0.5) * 0.05,
        landmark: landmark.trim() || undefined
      },
      photos: finalPhotos,
      reportedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: {
        id: user?.id || 'usr-anonymous',
        name: user?.name || 'Concerned Citizen',
        isVerified: user?.isVerified || false,
        avatar: user?.avatar
      },
      assignedDepartment: routingResult.department,
      departmentCode: routingResult.departmentCode,
      departmentDivision: routingResult.divisionUnit,
      routingConfidence: routingResult.confidence,
      routingKeywords: routingResult.matchedKeywords,
      estimatedResolutionDays: priority === 'critical' ? 1 : priority === 'high' ? 2 : Math.max(1, Math.ceil(routingResult.slaHours / 24)),
      upvotesCount: 1,
      timeline: [
        {
          id: `t-${Date.now()}`,
          status: 'reported',
          title: 'Civic Complaint Registered & Routed',
          description: `Analyzed by Civic AI Agent (0 duplicates detected). Auto-routed directly to ${routingResult.department} (${routingResult.divisionUnit}) with target SLA ${routingResult.slaHours} hours.`,
          timestamp: new Date().toISOString(),
          actor: user?.name || 'Citizen User',
          actorRole: 'Citizen'
        }
      ]
    };

    onSubmitComplaint(newIssue);
    onClose();
  };

  // Merge Action when duplicate is confirmed
  const handleMergeAction = () => {
    if (!duplicateConflict) return;
    const photoToAttach = photos.length > 0 ? photos[0] : undefined;
    onMergeDuplicate(duplicateConflict.id, photoToAttach);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-150">
      <div 
        id="report-issue-modal"
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] my-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Rapid Agent Scanning Overlay (Fraction of a second) */}
        {isAnalyzing && (
          <div className="absolute inset-0 z-30 bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-white text-center animate-in fade-in duration-100">
            <div className="w-16 h-16 rounded-full border-4 border-blue-400 border-t-white animate-spin mb-4 shadow-lg shadow-blue-500/30" />
            <div className="flex items-center gap-2 text-sm font-bold text-blue-300 uppercase tracking-wider">
              <Zap className="w-4 h-4 animate-bounce" />
              Civic AI Agent Analysis
            </div>
            <h3 className="text-lg font-extrabold text-white mt-1">
              Scanning GPS Grid & Municipal Database...
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-sm">
              Checking {ward} for identical active complaints to prevent duplicate dispatch orders.
            </p>
          </div>
        )}

        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                Citizen Reporting Desk
              </span>
              <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                ⚡ Agent Duplicate Guard
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
              Report an Infrastructure Issue
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {'speechSynthesis' in window && (
              <button
                type="button"
                onClick={handleSpeakSummary}
                title={isPlayingAudio ? 'Stop audio' : 'Listen to report summary'}
                className="p-2 rounded-xl text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
              >
                {isPlayingAudio ? <VolumeX className="w-5 h-5 text-rose-600" /> : <Volume2 className="w-5 h-5" />}
              </button>
            )}
            <button
              id="close-report-modal-btn"
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Accessibility Announcement & Mode Tabs */}
        <div className="bg-blue-50/70 border-b border-blue-100 px-5 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-blue-900 font-medium">
            <span className="p-1 rounded bg-blue-200/70 text-blue-800">
              <Zap className="w-3.5 h-3.5" />
            </span>
            <span>
              <strong>Zero-typing supported:</strong> Illiterate or elder citizens can submit using photos & voice.
            </span>
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-blue-200 text-xs shadow-2xs">
            <button
              type="button"
              onClick={() => setMode('quick')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                mode === 'quick'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ⚡ 1-Tap Photo Mode
            </button>
            <button
              type="button"
              onClick={() => setMode('detailed')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                mode === 'detailed'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📝 Form Mode
            </button>
          </div>
        </div>

        {/* Offline Status Banner */}
        {!effectiveOnline && (
          <div className="bg-amber-50 border-b border-amber-200 px-5 py-2.5 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Offline Capture Mode:</strong> Evidence and voice notes will be securely cached on this device and auto-synced once your connection is restored.
              </span>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 font-bold text-[10px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded">
              <CloudUpload className="w-3 h-3" /> AUTO-SYNC READY
            </span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* AGENT DUPLICATE PREVENTION RESOLUTION SCREEN */}
        {/* ========================================================================= */}
        {duplicateConflict ? (
          <div className="p-5 sm:p-7 overflow-y-auto space-y-5 animate-in zoom-in-95 duration-150">
            {/* Disallowed Alert Header */}
            <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Ban className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-800 bg-rose-200/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" />
                    Agent Duplicate Radar ({analysisDuration})
                  </span>
                  {duplicateResult && (
                    <span className="text-[10px] font-black uppercase tracking-wider text-white bg-rose-700 px-2 py-0.5 rounded-md">
                      {duplicateResult.confidenceScore}% Duplicate Match
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-black text-rose-950 mt-1">
                  Submission Disallowed: Identical Problem Already Active!
                </h3>
                <p className="text-xs text-rose-900 mt-1 leading-relaxed">
                  Our Civic AI Agent analyzed this submission against all municipal records. Work Order <strong>#{duplicateConflict.trackingNumber}</strong> for <strong>{duplicateConflict.categoryLabel}</strong> is already active in <strong>{duplicateConflict.location.ward}</strong>. City policy strictly disallows duplicate tickets to prevent redundant crew dispatch and pipeline clutter.
                </p>
              </div>
            </div>

            {/* Agent Analysis Match Breakdown */}
            {duplicateResult && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
                    Agent Duplicate Detection Breakdown:
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">
                    Threshold: &gt;= 55% (Score: {duplicateResult.confidenceScore}%)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {duplicateResult.matchedFactors.map((factor, fIdx) => (
                    <div key={fIdx} className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                      <span className="line-clamp-1">{factor}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comparison Box: Active Ticket vs Citizen Upload */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Existing Active Municipal Ticket:</span>
                <span className="font-mono font-bold bg-white px-2.5 py-0.5 rounded border border-slate-200 text-blue-700">
                  {duplicateConflict.trackingNumber}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Existing Complaint Snapshot */}
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Currently Active in System
                  </span>
                  <div className="h-28 rounded-lg overflow-hidden bg-slate-100 mb-2">
                    <img 
                      src={duplicateConflict.photos[0]} 
                      alt="Existing report" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="text-xs font-bold text-slate-900 line-clamp-1">
                    {duplicateConflict.title}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Status: <span className="font-semibold text-blue-700 capitalize">{duplicateConflict.status.replace('-', ' ')}</span> • {duplicateConflict.upvotesCount} Endorsements
                  </div>
                  <div className="text-[10px] text-slate-600 mt-1 line-clamp-1">
                    Dept: {duplicateConflict.assignedDepartment}
                  </div>
                </div>

                {/* Newly Uploaded Citizen Report */}
                <div className="bg-white p-3 rounded-xl border border-rose-200 ring-2 ring-rose-500/10">
                  <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block mb-1.5">
                    Your Report (Duplicate Identified)
                  </span>
                  <div className="h-28 rounded-lg overflow-hidden bg-slate-100 mb-2">
                    <img 
                      src={photos.length > 0 ? photos[0] : duplicateConflict.photos[0]} 
                      alt="Your evidence" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="text-xs font-bold text-slate-900 line-clamp-1">
                    {title || `${CATEGORY_DEFINITIONS[category].label} Hazard`}
                  </div>
                  <div className="text-[11px] text-rose-600 font-semibold mt-0.5">
                    Duplicate creation blocked by agent
                  </div>
                  <div className="text-[10px] text-slate-600 mt-1 line-clamp-1">
                    Location: {address || ward}
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Citizen Actions (No Duplicate Ticket Creation) */}
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={handleMergeAction}
                className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <ThumbsUp className="w-4 h-4" />
                <span>Endorse Existing Ticket (+1 Citizen Urgency Upvote & Add Evidence)</span>
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onSelectExistingComplaint(duplicateConflict);
                  }}
                  className="py-2.5 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center gap-1.5 border border-blue-200 cursor-pointer transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Live Ticket & Crew Dispatch
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDuplicateConflict(null);
                    setDuplicateResult(null);
                  }}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-200 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Modify Details or Location
                </button>
              </div>

              <p className="text-center text-[11px] text-slate-500 pt-1">
                Policy Notice: To prevent duplicate municipal budget allocations, new work orders cannot be opened for this issue.
              </p>
            </div>
          </div>
        ) : mode === 'quick' ? (
          /* ========================================================================= */
          /* MODE 1: QUICK 1-TAP PHOTO & ICON REPORT (Zero Typing Required) */
          /* ========================================================================= */
          <div className="overflow-y-auto p-5 sm:p-7 space-y-6">
            {/* Live Agent Duplicate Radar Feedback */}
            {liveDuplicateCheck.isDuplicate && liveDuplicateCheck.existingComplaint && (
              <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl flex items-center justify-between gap-3 text-xs animate-in fade-in">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Agent Radar:</strong> An active {liveDuplicateCheck.existingComplaint.categoryLabel} issue already exists here (<span className="font-mono">{liveDuplicateCheck.existingComplaint.trackingNumber}</span>). Submitting will be analyzed by duplicate prevention.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectExistingComplaint(liveDuplicateCheck.existingComplaint!)}
                  className="shrink-0 text-[11px] font-bold text-amber-800 underline hover:text-amber-950 cursor-pointer"
                >
                  View Ticket
                </button>
              </div>
            )}

            {/* AI Department Routing Live Card */}
            <div className="p-3.5 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-slate-50 border border-blue-200/90 rounded-2xl shadow-2xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-100/90 px-2 py-0.5 rounded-md">
                        AI Routed: {routingResult.departmentCode}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded">
                        {routingResult.confidence}% Match
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm font-extrabold text-slate-900 truncate mt-0.5">
                      {routingResult.department}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0 hidden sm:block">
                  <div className="text-[10px] text-slate-500 font-medium">Standard SLA</div>
                  <div className="text-xs font-black text-blue-700">{routingResult.slaHours}h Target</div>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-blue-100 flex items-center justify-between text-[11px] text-slate-600">
                <div className="truncate">
                  <span className="font-semibold text-slate-700">Division: </span>
                  <span>{routingResult.divisionUnit}</span>
                </div>
                <div className="shrink-0 text-slate-500 pl-2">
                  Lead: {routingResult.officerInCharge.split(',')[0]}
                </div>
              </div>
            </div>

            {/* Step A: Big Photo Evidence Uploader */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px]">1</span>
                  Take or Upload Photo (Evidence)
                </label>
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                  {photos.length > 0 ? `${photos.length} Photo(s) Attached` : 'No photo yet'}
                </span>
              </div>

              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                  isDragging 
                    ? 'border-blue-500 bg-blue-50/60' 
                    : photos.length > 0
                    ? 'border-emerald-400 bg-emerald-50/20 hover:border-emerald-500'
                    : 'border-blue-300 hover:border-blue-500 bg-blue-50/20'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />

                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white mx-auto flex items-center justify-center mb-2 shadow-sm">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-slate-900">
                  Tap to Take a Photo with Phone or Browse
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Works instantly with mobile camera or computer photo file
                </p>
              </div>

              {/* Realistic one-tap presets */}
              <div className="mt-3">
                <div className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Or click one realistic sample photo:
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
                  {SAMPLE_PHOTO_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSample(preset)}
                      className="px-3 py-1.5 text-xs rounded-xl bg-slate-100 hover:bg-blue-100 hover:text-blue-800 text-slate-700 font-medium whitespace-nowrap border border-slate-200 cursor-pointer transition-colors"
                    >
                      + {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photos Gallery Preview */}
              {photos.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group rounded-xl overflow-hidden h-20 bg-slate-100 border border-slate-200">
                      <img 
                        src={photo} 
                        alt="preview" 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPhotos(photos.filter((_, i) => i !== index));
                        }}
                        className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white cursor-pointer"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Step B: Visual Icon Category Selection (Big Pictograms) */}
            <div>
              <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px]">2</span>
                Tap the Problem Picture (What is broken?)
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {(Object.keys(CATEGORY_DEFINITIONS) as IssueCategory[]).map((catKey) => {
                  const def = CATEGORY_DEFINITIONS[catKey];
                  const isSelected = category === catKey;
                  return (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() => setCategory(catKey)}
                      className={`p-3.5 rounded-2xl border-2 text-left flex flex-col items-center sm:items-start text-center sm:text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-500/20 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-2 shadow-2xs">
                        {getCategoryIcon(catKey)}
                      </div>
                      <div className="text-xs font-bold text-slate-900 leading-tight">
                        {def.label}
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                        {def.department.split(' ')[0]} {def.department.split(' ')[1]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step C: Location (1-Tap GPS) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px]">3</span>
                  Location & Ward
                </label>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isDetectingLocation}
                  className="text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Crosshair className={`w-3.5 h-3.5 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                  {isDetectingLocation ? 'Acquiring GPS...' : '📍 Auto-Detect My Location'}
                </button>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {locationDetected ? address : 'Selected: ' + ward}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {locationDetected ? 'GPS lock confirmed (±3m precision)' : 'Tap Auto-Detect above or select ward below'}
                    </div>
                  </div>
                </div>

                <select
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="text-xs p-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium cursor-pointer"
                >
                  {WARDS_LIST.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Step D: Optional Voice Note Microphone */}
            <div className="bg-amber-50/60 border border-amber-200/80 p-4 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <Mic className="w-4 h-4 text-amber-600" />
                  <span>Optional: Speak to Describe (For Citizens Who Cannot Type)</span>
                </div>
                {voiceTranscript && (
                  <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Voice Saved
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={handleToggleVoice}
                  className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    isListening
                      ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse shadow-md'
                      : 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-4 h-4" />
                      Listening... Tap to Stop
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" />
                      Tap to Speak Voice Note
                    </>
                  )}
                </button>

                <div className="text-xs text-amber-800/90 flex-1">
                  {isListening ? (
                    <span className="font-semibold text-rose-700 animate-pulse">
                      🎙️ Speak into your microphone now...
                    </span>
                  ) : voiceTranscript ? (
                    <div className="italic bg-white/80 p-2 rounded-lg border border-amber-200">
                      "{voiceTranscript}"
                    </div>
                  ) : (
                    <span>Tap the microphone to speak your problem aloud. No typing needed!</span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Submit Bar */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleInitiateSubmit()}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-2xl text-white text-sm font-extrabold shadow-lg hover:shadow-xl transition-all cursor-pointer ${
                  !effectiveOnline 
                    ? 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800' 
                    : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'
                }`}
              >
                {!effectiveOnline ? (
                  <>
                    <CloudUpload className="w-5 h-5" />
                    💾 Save Offline (Auto-Syncs When Online)
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    ⚡ Submit Issue Now (1-Tap)
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* MODE 2: DETAILED FORM (Text inputs are ALL OPTIONAL) */
          /* ========================================================================= */
          <form onSubmit={(e) => handleInitiateSubmit(e)} className="overflow-y-auto p-5 sm:p-7 space-y-5">
            {/* Step 1: Photos & Classification */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in">
                {liveDuplicateCheck.isDuplicate && liveDuplicateCheck.existingComplaint && (
                  <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        <strong>Agent Radar:</strong> Active {liveDuplicateCheck.existingComplaint.categoryLabel} issue recorded at this ward (<span className="font-mono">{liveDuplicateCheck.existingComplaint.trackingNumber}</span>). Submitting will be analyzed by duplicate prevention.
                      </span>
                    </div>
                  </div>
                )}

                {/* AI Department Routing Live Card */}
                <div className="p-3.5 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-slate-50 border border-blue-200/90 rounded-2xl shadow-2xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-100/90 px-2 py-0.5 rounded-md">
                            AI Routed: {routingResult.departmentCode}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded">
                            {routingResult.confidence}% Match
                          </span>
                        </div>
                        <div className="text-xs sm:text-sm font-extrabold text-slate-900 truncate mt-0.5">
                          {routingResult.department}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 hidden sm:block">
                      <div className="text-[10px] text-slate-500 font-medium">Standard SLA</div>
                      <div className="text-xs font-black text-blue-700">{routingResult.slaHours}h Target</div>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-blue-100 flex items-center justify-between text-[11px] text-slate-600">
                    <div className="truncate">
                      <span className="font-semibold text-slate-700">Division: </span>
                      <span>{routingResult.divisionUnit}</span>
                    </div>
                    <div className="shrink-0 text-slate-500 pl-2">
                      Lead: {routingResult.officerInCharge.split(',')[0]}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    1. Select Issue Category
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(Object.keys(CATEGORY_DEFINITIONS) as IssueCategory[]).map((catKey) => {
                      const def = CATEGORY_DEFINITIONS[catKey];
                      const isSelected = category === catKey;
                      return (
                        <button
                          key={catKey}
                          type="button"
                          onClick={() => setCategory(catKey)}
                          className={`p-3 rounded-xl border text-left flex items-start gap-2.5 text-xs font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/20 text-blue-900 shadow-2xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="shrink-0 mt-0.5">{getCategoryIcon(catKey)}</div>
                          <div>
                            <span className="line-clamp-1">{def.label}</span>
                            <span className="text-[10px] font-normal text-slate-500 mt-0.5 block truncate">
                              {def.department.split(' ')[0]} {def.department.split(' ')[1]}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Photo Upload Box */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-blue-600" />
                      2. Upload Evidence Photos
                    </label>
                    <span className="text-[11px] text-slate-500">
                      {photos.length} photo(s) added
                    </span>
                  </div>

                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center cursor-pointer transition-all ${
                      isDragging 
                        ? 'border-blue-500 bg-blue-50/50' 
                        : 'border-slate-300 hover:border-blue-400 bg-slate-50/50'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e.target.files)}
                    />
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 mx-auto flex items-center justify-center mb-1.5">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-800">
                      Drop photos or <span className="text-blue-600 underline">browse camera</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto pb-1 mt-2 scrollbar-none">
                    {SAMPLE_PHOTO_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectSample(preset)}
                        className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-medium whitespace-nowrap border border-slate-200 cursor-pointer transition-colors"
                      >
                        + {preset.name}
                      </button>
                    ))}
                  </div>

                  {photos.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-2.5">
                      {photos.map((photo, index) => (
                        <div key={index} className="relative group rounded-xl overflow-hidden h-16 bg-slate-100 border border-slate-200">
                          <img 
                            src={photo} 
                            alt="preview" 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPhotos(photos.filter((_, i) => i !== index));
                            }}
                            className="absolute top-1 right-1 p-0.5 rounded-full bg-rose-600 text-white cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Brief Title (OPTIONAL) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      3. Brief Title <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <span className="text-[11px] text-blue-600 font-medium">Leave blank for auto-title</span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Broken pavement near school (leave blank if not typing)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-xs sm:text-sm p-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* Detailed Description (OPTIONAL) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      4. Description <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleToggleVoice}
                      className="text-xs font-bold text-amber-700 flex items-center gap-1 hover:text-amber-800 cursor-pointer"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      {isListening ? 'Listening...' : 'Speak via Mic'}
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Optional details or speak via mic. Leave blank if you don't wish to type."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full text-xs sm:text-sm p-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Location & Priority */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      5. Location & Ward
                    </label>
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={isDetectingLocation}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Crosshair className={`w-3.5 h-3.5 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                      {isDetectingLocation ? 'Triangulating GPS...' : 'Auto-Detect My GPS'}
                    </button>
                  </div>

                  {locationDetected && (
                    <div className="mb-2 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>GPS coordinate lock acquired: accuracy ±3 meters</span>
                    </div>
                  )}

                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Street Address (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Leave blank to use current GPS ward area"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full text-xs sm:text-sm p-3 bg-white border border-slate-200 rounded-xl text-slate-900"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Municipal Ward
                        </label>
                        <select
                          value={ward}
                          onChange={(e) => setWard(e.target.value)}
                          className="w-full text-xs sm:text-sm p-3 bg-white border border-slate-200 rounded-xl text-slate-900 cursor-pointer"
                        >
                          {WARDS_LIST.map((w) => (
                            <option key={w} value={w}>
                              {w}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Nearby Landmark (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Near bus stop"
                          value={landmark}
                          onChange={(e) => setLandmark(e.target.value)}
                          className="w-full text-xs sm:text-sm p-3 bg-white border border-slate-200 rounded-xl text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    6. Urgency Level
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { level: 'low', label: 'Low', desc: 'Non-urgent' },
                      { level: 'medium', label: 'Medium', desc: 'Standard' },
                      { level: 'high', label: 'High', desc: 'Disruption' },
                      { level: 'critical', label: 'Critical', desc: 'Safety hazard' }
                    ].map((p) => (
                      <button
                        key={p.level}
                        type="button"
                        onClick={() => setPriority(p.level as PriorityLevel)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          priority === p.level
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-xs font-bold">{p.label}</div>
                        <div className={`text-[10px] ${priority === p.level ? 'text-slate-300' : 'text-slate-500'}`}>
                          {p.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {liveDuplicateCheck.isDuplicate && liveDuplicateCheck.existingComplaint && (
                  <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl flex items-center gap-2 text-xs">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>Agent Radar:</strong> Active work order #{liveDuplicateCheck.existingComplaint.trackingNumber} already exists in {ward}. Submitting will trigger automated duplicate prevention.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Form Actions in Form Mode */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              {step === 1 ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Back
                </button>
              )}

              {step === 1 ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleInitiateSubmit()}
                    className={`px-4 py-2.5 rounded-xl text-white text-xs font-bold cursor-pointer transition-colors ${
                      !effectiveOnline 
                        ? 'bg-amber-600 hover:bg-amber-700' 
                        : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    {!effectiveOnline ? 'Save Offline Now' : 'Submit (Agent Check)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                  >
                    Next: Location
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="submit"
                  className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold shadow-md cursor-pointer transition-colors ${
                    !effectiveOnline 
                      ? 'bg-amber-600 hover:bg-amber-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {!effectiveOnline ? (
                    <>
                      <CloudUpload className="w-4 h-4" />
                      Save Report to Offline Outbox
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Submit Official Report
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
