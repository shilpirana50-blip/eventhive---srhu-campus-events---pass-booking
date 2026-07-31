import React, { useState } from 'react';
import { Calendar, MapPin, Ticket, ShieldCheck, Sparkles, PlusCircle, QrCode, Grid, Building2, Bell, Hexagon, LogIn, UserPlus, LogOut, User as UserIcon, ChevronDown } from 'lucide-react';
import { SRHU_DEPARTMENTS, User } from '../types';

interface NavbarProps {
  activeTab: 'browse' | 'calendar' | 'map' | 'my-tickets' | 'organizer';
  setActiveTab: (tab: 'browse' | 'calendar' | 'map' | 'my-tickets' | 'organizer') => void;
  myTicketsCount: number;
  userDepartment: string;
  setUserDepartment: (dept: string) => void;
  onOpenAiAssistant: () => void;
  onOpenConcurrencyTest: () => void;
  onTriggerSchoolAlert?: () => void;
  toastCount?: number;
  currentUser?: User | null;
  onOpenAuth?: (mode?: 'signin' | 'signup') => void;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  myTicketsCount,
  userDepartment,
  setUserDepartment,
  onOpenAiAssistant,
  onOpenConcurrencyTest,
  onTriggerSchoolAlert,
  toastCount = 0,
  currentUser,
  onOpenAuth,
  onSignOut,
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-16">
          {/* EventHive Brand Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('browse')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center font-black text-white text-xl shadow-md shadow-indigo-600/30 shrink-0">
              <Hexagon className="w-6 h-6 text-amber-300 fill-amber-300/20" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white leading-tight">
                  EVENT<span className="text-indigo-400">HIVE</span>
                </span>
                <span className="hidden xl:inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  SRHU CAMPUS
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-400 hidden sm:block">
                Swami Rama Himalayan University • Jolly Grant, Dehradun
              </p>
            </div>
          </div>

          {/* Main Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 text-xs font-mono font-bold tracking-widest text-slate-400">
            <button
              id="nav-tab-browse"
              onClick={() => setActiveTab('browse')}
              className={`py-5 transition-colors border-b-2 uppercase ${
                activeTab === 'browse'
                  ? 'text-indigo-400 border-indigo-400'
                  : 'border-transparent hover:text-white'
              }`}
            >
              EVENTS
            </button>

            <button
              id="nav-tab-calendar"
              onClick={() => setActiveTab('calendar')}
              className={`py-5 transition-colors border-b-2 uppercase ${
                activeTab === 'calendar'
                  ? 'text-indigo-400 border-indigo-400'
                  : 'border-transparent hover:text-white'
              }`}
            >
              CALENDAR
            </button>

            <button
              id="nav-tab-map"
              onClick={() => setActiveTab('map')}
              className={`py-5 transition-colors border-b-2 uppercase ${
                activeTab === 'map'
                  ? 'text-indigo-400 border-indigo-400'
                  : 'border-transparent hover:text-white'
              }`}
            >
              CAMPUS MAP
            </button>

            <button
              id="nav-tab-my-tickets"
              onClick={() => setActiveTab('my-tickets')}
              className={`py-5 transition-colors border-b-2 uppercase flex items-center gap-1.5 ${
                activeTab === 'my-tickets'
                  ? 'text-indigo-400 border-indigo-400'
                  : 'border-transparent hover:text-white'
              }`}
            >
              MY PASSES
              {myTicketsCount > 0 && (
                <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {myTicketsCount}
                </span>
              )}
            </button>

            <button
              id="nav-tab-organizer"
              onClick={() => {
                if (!currentUser) {
                  if (onOpenAuth) onOpenAuth('signin');
                } else {
                  setActiveTab('organizer');
                }
              }}
              className={`py-5 transition-colors border-b-2 uppercase ${
                activeTab === 'organizer'
                  ? 'text-indigo-400 border-indigo-400'
                  : 'border-transparent hover:text-white'
              }`}
            >
              PUBLISH EVENT
            </button>
          </nav>

          {/* User Active Department Identity Selector & Notification Trigger */}
          <div className="flex items-center space-x-2.5">
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono">
              <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="text-[10px] text-slate-400 uppercase hidden lg:inline">My School:</span>
              <select
                value={userDepartment}
                onChange={(e) => setUserDepartment(e.target.value)}
                className="bg-transparent text-indigo-300 text-xs font-mono font-bold outline-none cursor-pointer max-w-[170px] lg:max-w-[210px] truncate"
              >
                {SRHU_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept} className="bg-slate-900 text-white">
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Notification Slot Alert Trigger Button */}
            {onTriggerSchoolAlert && (
              <button
                id="btn-trigger-school-alert"
                onClick={onTriggerSchoolAlert}
                className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 hover:border-amber-500/50 transition-all active:scale-95 shrink-0"
                title="Check live open registration slots for your school"
              >
                <Bell className="w-4 h-4 text-amber-400" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full" />
              </button>
            )}

            <button
              id="btn-ai-assistant"
              onClick={onOpenAiAssistant}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 transition-all active:scale-95 shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden xl:inline">AI CONCIERGE</span>
            </button>

            {/* Authentication UI Controls */}
            {currentUser ? (
              /* Signed In Profile Dropdown */
              <div className="relative">
                <button
                  id="btn-user-profile"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 text-xs font-mono font-bold transition-all active:scale-95"
                >
                  <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                    {currentUser.fullName.charAt(0)}
                  </div>
                  <span className="text-white max-w-[100px] sm:max-w-[130px] truncate hidden sm:inline">
                    {currentUser.fullName.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
                </button>

                {/* Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-3 z-50 animate-fade-in font-mono space-y-2">
                    <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <div className="text-xs font-bold text-white truncate">{currentUser.fullName}</div>
                      <div className="text-[10px] text-indigo-300 truncate">{currentUser.email}</div>
                      <div className="flex items-center justify-between text-[9px] pt-1 border-t border-slate-900">
                        <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase font-bold">
                          {currentUser.role}
                        </span>
                        <span className="text-slate-400 truncate max-w-[120px]">{currentUser.department}</span>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          setActiveTab('my-tickets');
                        }}
                        className="w-full text-left p-2 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-2 transition-all"
                      >
                        <Ticket className="w-3.5 h-3.5 text-indigo-400" />
                        <span>My Event Passes ({myTicketsCount})</span>
                      </button>

                      {currentUser.role === 'organizer' && (
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            setActiveTab('organizer');
                          }}
                          className="w-full text-left p-2 rounded-xl hover:bg-slate-800 text-amber-300 flex items-center gap-2 transition-all"
                        >
                          <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                          <span>Publish Department Event</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          if (onSignOut) onSignOut();
                        }}
                        className="w-full text-left p-2 rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-300 flex items-center gap-2 transition-all pt-2 border-t border-slate-800"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Signed Out State: Sign In & Sign Up Buttons */
              <div className="flex items-center gap-1.5 font-mono">
                <button
                  id="btn-nav-signin"
                  onClick={() => onOpenAuth && onOpenAuth('signin')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <LogIn className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Sign In</span>
                </button>

                <button
                  id="btn-nav-signup"
                  onClick={() => onOpenAuth && onOpenAuth('signup')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 active:scale-95 hidden sm:flex"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav Drawer Row */}
      <div className="md:hidden flex items-center justify-around bg-slate-950/90 py-2.5 border-t border-slate-800 text-[10px] font-mono tracking-widest uppercase">
        <button
          onClick={() => setActiveTab('browse')}
          className={`flex flex-col items-center gap-0.5 ${activeTab === 'browse' ? 'text-indigo-400' : 'text-slate-400'}`}
        >
          <Grid className="w-4 h-4" />
          Discover
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex flex-col items-center gap-0.5 ${activeTab === 'calendar' ? 'text-indigo-400' : 'text-slate-400'}`}
        >
          <Calendar className="w-4 h-4" />
          Calendar
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={`flex flex-col items-center gap-0.5 ${activeTab === 'map' ? 'text-indigo-400' : 'text-slate-400'}`}
        >
          <MapPin className="w-4 h-4" />
          Map
        </button>
        <button
          onClick={() => setActiveTab('my-tickets')}
          className={`flex flex-col items-center gap-0.5 ${activeTab === 'my-tickets' ? 'text-indigo-400' : 'text-slate-400'}`}
        >
          <QrCode className="w-4 h-4" />
          Tickets ({myTicketsCount})
        </button>
        <button
          onClick={() => {
            if (!currentUser) {
              if (onOpenAuth) onOpenAuth('signin');
            } else {
              setActiveTab('organizer');
            }
          }}
          className={`flex flex-col items-center gap-0.5 ${activeTab === 'organizer' ? 'text-indigo-400' : 'text-slate-400'}`}
        >
          <PlusCircle className="w-4 h-4" />
          Organize
        </button>
      </div>
    </header>
  );
};

