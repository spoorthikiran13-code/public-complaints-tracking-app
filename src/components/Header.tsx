import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNetworkStatus } from '../context/NetworkStatusContext';
import { 
  Building2, 
  PlusCircle, 
  ShieldCheck, 
  User as UserIcon, 
  LogOut, 
  ChevronDown, 
  Sparkles,
  Camera,
  Layers,
  FileText,
  Wifi,
  WifiOff,
  Inbox
} from 'lucide-react';

interface HeaderProps {
  onOpenReportModal: () => void;
  onOpenAuthModal: () => void;
  activeTab: 'all' | 'my-complaints';
  onChangeTab: (tab: 'all' | 'my-complaints') => void;
  myComplaintsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenReportModal,
  onOpenAuthModal,
  activeTab,
  onChangeTab,
  myComplaintsCount
}) => {
  const { user, logout, quickLogin } = useAuth();
  const { 
    offlineQueue, 
    effectiveOnline, 
    isSimulatedOffline, 
    toggleSimulateOffline, 
    setIsOutboxOpen 
  } = useNetworkStatus();
  const [showUserDropdown, setShowUserDropdown] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-none">
                  CivicTrack
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  MUNICIPAL DEMO
                </span>
              </div>
              <p className="text-xs text-slate-600 hidden sm:block font-medium">
                Live Citizen Infrastructure Resolution Portal
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/60">
            <button
              id="nav-tab-all-issues"
              type="button"
              onClick={() => onChangeTab('all')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Community Issues
            </button>
            <button
              id="nav-tab-my-reports"
              type="button"
              onClick={() => onChangeTab('my-complaints')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'my-complaints'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              My Reports
              {myComplaintsCount > 0 && (
                <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {myComplaintsCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Outbox Badge Button */}
            {offlineQueue.length > 0 && (
              <button
                id="header-outbox-btn"
                type="button"
                onClick={() => setIsOutboxOpen(true)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-all shadow-2xs cursor-pointer animate-in fade-in"
                title="View queued offline reports awaiting sync"
              >
                <Inbox className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Outbox</span>
                <span className="bg-amber-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-extrabold leading-none">
                  {offlineQueue.length}
                </span>
              </button>
            )}

            {/* Network Connection Toggle Pill */}
            <button
              id="header-network-toggle-btn"
              type="button"
              onClick={toggleSimulateOffline}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                effectiveOnline 
                  ? 'text-slate-700 bg-slate-100/90 hover:bg-slate-200 border-slate-200' 
                  : 'text-amber-900 bg-amber-100 hover:bg-amber-200 border-amber-300'
              }`}
              title={effectiveOnline ? 'Online mode active. Click to simulate offline capture.' : 'Offline mode active. Click to reconnect.'}
            >
              {effectiveOnline ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="hidden lg:inline text-[11px] font-medium">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="text-[11px] font-bold text-amber-900">Offline</span>
                </>
              )}
            </button>

            {/* Primary Report CTA */}
            <button
              id="header-report-btn"
              type="button"
              onClick={onOpenReportModal}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">Report Issue</span>
              <span className="sm:hidden">Report</span>
            </button>

            {/* User Account / Auth Switcher */}
            {user ? (
              <div className="relative">
                <button
                  id="user-profile-menu-button"
                  type="button"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-left cursor-pointer"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <div className="hidden lg:block">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                        {user.name}
                      </span>
                      {user.isVerified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-600 capitalize block leading-none">
                      {user.role === 'municipal_officer' ? 'City Officer' : 'Resident'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-600 hidden sm:block" />
                </button>

                {/* Dropdown Menu */}
                {showUserDropdown && (
                  <div 
                    id="user-dropdown-menu"
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <div className="text-xs font-bold text-slate-900">{user.name}</div>
                      <div className="text-[11px] text-slate-600 truncate">{user.email}</div>
                      <div className="mt-1 flex items-center gap-1 text-[11px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-md w-fit">
                        <ShieldCheck className="w-3 h-3" />
                        {user.role === 'municipal_officer' ? 'Municipal Staff Access' : 'Verified Resident'}
                      </div>
                    </div>

                    <div className="px-2 py-1.5">
                      <div className="text-[10px] font-bold text-slate-600 uppercase px-2 py-1 tracking-wider">
                        Switch Demo Role
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          quickLogin('citizen');
                          setShowUserDropdown(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between cursor-pointer ${
                          user.role === 'citizen' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>Citizen (Elena Vance)</span>
                        {user.role === 'citizen' && <span className="text-[10px]">Active</span>}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          quickLogin('officer');
                          setShowUserDropdown(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between cursor-pointer ${
                          user.role === 'municipal_officer' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>Public Works Officer (Marcus)</span>
                        {user.role === 'municipal_officer' && <span className="text-[10px]">Active</span>}
                      </button>
                    </div>

                    <div className="border-t border-slate-100 mt-1 pt-1 px-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowUserDropdown(false);
                          logout();
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="login-trigger-button"
                type="button"
                onClick={onOpenAuthModal}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <UserIcon className="w-3.5 h-3.5" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
