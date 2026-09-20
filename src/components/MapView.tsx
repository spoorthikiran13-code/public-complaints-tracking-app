import React, { useState } from 'react';
import { Complaint, ComplaintStatus } from '../types';
import { 
  MapPin, 
  Navigation, 
  ExternalLink, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  X,
  Layers,
  Camera
} from 'lucide-react';

interface MapViewProps {
  complaints: Complaint[];
  onSelectComplaint: (complaint: Complaint) => void;
}

export const MapView: React.FC<MapViewProps> = ({ complaints, onSelectComplaint }) => {
  const [selectedPin, setSelectedPin] = useState<Complaint | null>(complaints[0] || null);
  const [mapLayer, setMapLayer] = useState<'streets' | 'satellite'>('streets');

  // Relative coordinates normalized on an SVG map canvas
  const getCoordinatesPercentage = (c: Complaint, idx: number) => {
    // Deterministic pseudo-layout on the city grid if lat/lng are close
    const basePositions = [
      { x: 38, y: 34 },
      { x: 62, y: 28 },
      { x: 26, y: 56 },
      { x: 50, y: 46 },
      { x: 74, y: 64 },
      { x: 32, y: 78 },
      { x: 68, y: 82 }
    ];
    const pos = basePositions[idx % basePositions.length];
    return { x: pos.x, y: pos.y };
  };

  const getPinColor = (status: ComplaintStatus) => {
    switch (status) {
      case 'pending': return 'bg-amber-500 text-white ring-amber-300';
      case 'in-progress': return 'bg-blue-600 text-white ring-blue-300';
      case 'resolved': return 'bg-emerald-600 text-white ring-emerald-300';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs relative">
      {/* Map Header Toolbar */}
      <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Navigation className="w-4 h-4 text-blue-600" />
            Civic Infrastructure Spatial Distribution
          </h3>
          <p className="text-xs text-slate-500">
            Interactive geographic map view of reported incidents across municipal wards
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Legend */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Pending
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              In Progress
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              Resolved
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-1 flex text-xs font-medium">
            <button
              type="button"
              onClick={() => setMapLayer('streets')}
              className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                mapLayer === 'streets' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600'
              }`}
            >
              Street Map
            </button>
            <button
              type="button"
              onClick={() => setMapLayer('satellite')}
              className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                mapLayer === 'satellite' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600'
              }`}
            >
              Satellite
            </button>
          </div>
        </div>
      </div>

      {/* Stylized Canvas Grid */}
      <div className={`relative h-[480px] w-full overflow-hidden select-none transition-colors ${
        mapLayer === 'satellite' ? 'bg-slate-800' : 'bg-slate-100'
      }`}>
        {/* SVG Grid Overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
          <defs>
            <pattern id="city-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke={mapLayer === 'satellite' ? '#475569' : '#cbd5e1'} strokeWidth="1" />
            </pattern>
            <pattern id="road-lines" width="180" height="180" patternUnits="userSpaceOnUse">
              <path d="M 0 90 L 180 90 M 90 0 L 90 180" fill="none" stroke={mapLayer === 'satellite' ? '#64748b' : '#94a3b8'} strokeWidth="3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#city-grid)" />
          <rect width="100%" height="100%" fill="url(#road-lines)" />
        </svg>

        {/* River Feature */}
        <div 
          className="absolute top-0 bottom-0 left-[45%] w-16 bg-blue-300/40 transform -skew-x-12 pointer-events-none border-x border-blue-400/30"
          title="Central River Canal"
        />

        {/* Ward Labels */}
        <div className="absolute top-6 left-8 text-xs font-bold text-slate-400 uppercase tracking-widest pointer-events-none">
          Ward 3 - North Hillside
        </div>
        <div className="absolute top-6 right-8 text-xs font-bold text-slate-400 uppercase tracking-widest pointer-events-none">
          Ward 2 - East River
        </div>
        <div className="absolute bottom-6 left-8 text-xs font-bold text-slate-400 uppercase tracking-widest pointer-events-none">
          Ward 4 - West Blvd
        </div>
        <div className="absolute bottom-6 right-8 text-xs font-bold text-slate-400 uppercase tracking-widest pointer-events-none">
          Ward 5 - South Park
        </div>

        {/* Interactive Pins */}
        {complaints.map((c, idx) => {
          const { x, y } = getCoordinatesPercentage(c, idx);
          const isSelected = selectedPin?.id === c.id;

          return (
            <div
              key={c.id}
              style={{ left: `${x}%`, top: `${y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
            >
              <button
                type="button"
                onClick={() => setSelectedPin(c)}
                className={`p-2 rounded-full ring-4 shadow-lg transition-all duration-200 cursor-pointer transform hover:scale-125 ${
                  isSelected ? 'scale-125 ring-white shadow-2xl z-30' : 'ring-white/80'
                } ${getPinColor(c.status)}`}
                title={`${c.title} (${c.status})`}
              >
                <MapPin className="w-4 h-4" />
              </button>
            </div>
          );
        })}

        {/* Selected Pin Info Card Popup */}
        {selectedPin && (
          <div 
            id="map-pin-preview-card"
            className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-96 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/90 p-4 z-40 animate-in fade-in slide-in-from-bottom-3 duration-200"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  selectedPin.status === 'pending'
                    ? 'bg-amber-100 text-amber-800'
                    : selectedPin.status === 'in-progress'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {selectedPin.status}
                </span>
                <span className="font-mono text-xs font-bold text-slate-700">
                  {selectedPin.trackingNumber}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPin(null)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-3">
              {selectedPin.photos[0] && (
                <img
                  src={selectedPin.photos[0]}
                  alt="preview"
                  className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                  {selectedPin.title}
                </h4>
                <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-1 truncate">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  {selectedPin.location.address}
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-600">
                {selectedPin.assignedDepartment.split(' ')[0]} {selectedPin.assignedDepartment.split(' ')[1]}
              </span>
              <button
                type="button"
                onClick={() => onSelectComplaint(selectedPin)}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg cursor-pointer"
              >
                Track Live Status
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
