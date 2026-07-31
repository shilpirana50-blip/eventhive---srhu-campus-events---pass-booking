import React, { useState } from 'react';
import { PlusCircle, QrCode, BarChart3, Camera, CheckCircle2, AlertCircle, Sparkles, Users, DollarSign, Calendar, MapPin, Search, Building2, Lock } from 'lucide-react';
import { User, Event, Booking, OrganizerStats, SRHU_DEPARTMENTS, SRHUDepartment } from '../types';
import { checkInTicket, createNewEvent, callAiAssistant } from '../lib/api';

interface OrganizerPortalProps {
  events: Event[];
  bookings: Booking[];
  currentUser?: User | null;
  onOpenAuth?: (mode?: 'signin' | 'signup') => void;
  onEventCreated: (event: Event) => void;
  onBookingUpdated: () => void;
}

export const OrganizerPortal: React.FC<OrganizerPortalProps> = ({
  events,
  bookings,
  currentUser,
  onOpenAuth,
  onEventCreated,
  onBookingUpdated,
}) => {
  const [subTab, setSubTab] = useState<'scanner' | 'create' | 'analytics'>('scanner');

  // Scanner State
  const [scanCode, setScanCode] = useState('');
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; booking?: Booking } | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // New Event Wizard Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<any>('Tech & Innovation');
  const [organizingDepartment, setOrganizingDepartment] = useState<string>('School of Science & Technology');
  const [isAllDepartmentsAllowed, setIsAllDepartmentsAllowed] = useState(true);
  const [allowedDepartments, setAllowedDepartments] = useState<string[]>(['ALL']);

  const [date, setDate] = useState('2026-08-28');
  const [time, setTime] = useState('06:00 PM');
  const [location, setLocation] = useState('SST Central Auditorium, SRHU Campus');
  const [address, setAddress] = useState('Swami Rama Himalayan University, Jolly Grant, Dehradun');
  const [priceRange, setPriceRange] = useState('Free');
  const [description, setDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const toggleDepartmentPermission = (dept: string) => {
    if (allowedDepartments.includes(dept)) {
      const updated = allowedDepartments.filter((d) => d !== dept);
      setAllowedDepartments(updated.length === 0 ? ['ALL'] : updated);
    } else {
      const updated = allowedDepartments.filter((d) => d !== 'ALL');
      setAllowedDepartments([...updated, dept]);
    }
  };

  // Stats calculation
  const totalTicketsSold = bookings.length;
  const totalRevenue = bookings.reduce((acc, b) => acc + b.totalPrice, 0);
  const checkedInCount = bookings.filter((b) => b.status === 'checked_in').length;
  const checkInRate = totalTicketsSold > 0 ? Math.round((checkedInCount / totalTicketsSold) * 100) : 0;

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanCode.trim()) return;

    setIsScanning(true);
    setScanResult(null);

    try {
      const res = await checkInTicket(scanCode);
      setScanResult(res);
      if (res.success) {
        onBookingUpdated();
      }
    } catch (err: any) {
      setScanResult({ success: false, message: err.message || 'Check-in failed' });
    } finally {
      setIsScanning(false);
    }
  };

  const handleGenerateAiDescription = async () => {
    if (!title.trim()) {
      alert('Please enter an Event Title first before asking AI Copilot.');
      return;
    }

    setIsGeneratingAi(true);
    try {
      const res = await callAiAssistant('organizer_copilot', title, { category, location });
      if (res.description) setDescription(res.description);
      if (res.longDescription) setLongDescription(res.longDescription);
    } catch (err: any) {
      alert('AI Generation error: ' + err.message);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleCreateEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      if (onOpenAuth) onOpenAuth('signin');
      return;
    }
    if (!title || !description) return;

    const finalAllowedDepts = isAllDepartmentsAllowed ? ['ALL'] : allowedDepartments;

    setIsCreating(true);
    try {
      const newEvt = await createNewEvent({
        title,
        subtitle: description.substring(0, 80) + '...',
        category,
        universityName: 'Swami Rama Himalayan University, Jolly Grant',
        organizingDepartment,
        allowedDepartments: finalAllowedDepts,
        date,
        time,
        duration: '3 hours',
        location,
        address,
        coordinates: { lat: 30.1913, lng: 78.1873 }, // Jolly Grant SRHU coords
        description,
        longDescription: longDescription || description,
        organizerName: `${organizingDepartment} Event Cell`,
        organizerEmail: 'events@srhu.edu.in',
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
        priceRange,
        seatingType: 'seat_map',
        totalCapacity: 58,
        tags: [category, organizingDepartment, 'SRHU'],
        seatingTiers: [
          { name: 'Standard', price: 0, description: 'General SRHU Student Seating', totalSeats: 58, availableSeats: 58, colorClass: 'bg-indigo-600' },
        ],
      });

      onEventCreated(newEvt);
      alert(`Event successfully published by ${organizingDepartment}! Allowed departments: [${finalAllowedDepts.join(', ')}]`);
      setTitle('');
      setDescription('');
      setSubTab('analytics');
    } catch (err: any) {
      alert('Error creating event: ' + err.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Organizer Navigation Bar */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block">
            Organizer Portal
          </span>
          <h2 className="text-2xl font-black">Event Host & Gate Management</h2>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs">
          <button
            onClick={() => setSubTab('scanner')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold transition-all ${
              subTab === 'scanner' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Ticket Scanner</span>
          </button>

          <button
            onClick={() => {
              if (!currentUser) {
                if (onOpenAuth) onOpenAuth('signin');
              } else {
                setSubTab('create');
              }
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold transition-all ${
              subTab === 'create' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Host New Event</span>
          </button>

          <button
            onClick={() => setSubTab('analytics')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold transition-all ${
              subTab === 'analytics' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Sales & Analytics</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: QR Ticket Check-In Scanner */}
      {subTab === 'scanner' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-indigo-400">
              <QrCode className="w-6 h-6" />
              <h3 className="text-lg font-bold text-white">Gate Terminal Scanner</h3>
            </div>
            <p className="text-xs font-mono text-slate-400">
              Scan attendee QR passes or enter booking reference codes (e.g. <span className="font-mono font-bold text-indigo-400">GP-7721-X9</span>) to validate entrance.
            </p>

            <form onSubmit={handleScanSubmit} className="space-y-3 pt-2 font-mono">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">
                  Ticket Reference or Scanned Code
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={scanCode}
                    onChange={(e) => setScanCode(e.target.value)}
                    placeholder="Enter GP-XXXX-XX reference code"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-950 text-white border rounded-xl border-slate-800 focus:border-indigo-500 outline-none font-mono font-bold"
                  />
                </div>
              </div>

              {/* Sample test code quick buttons */}
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span>Quick Test Code:</span>
                <button
                  type="button"
                  onClick={() => setScanCode('GP-7721-X9')}
                  className="px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 font-mono font-bold text-indigo-400 border border-slate-800"
                >
                  GP-7721-X9
                </button>
              </div>

              <button
                type="submit"
                disabled={isScanning}
                className="w-full py-3 rounded-xl font-mono font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isScanning ? 'Verifying Ticket...' : 'VERIFY PASS'}</span>
              </button>
            </form>

            {/* Scan Feedback Banner */}
            {scanResult && (
              <div
                className={`p-4 rounded-2xl border text-xs space-y-2 font-mono ${
                  scanResult.success
                    ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
                    : 'bg-rose-950/50 border-rose-800 text-rose-300'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  {scanResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                  <span>{scanResult.message}</span>
                </div>

                {scanResult.booking && (
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 text-slate-300">
                    <div>Attendee: <b className="text-white">{scanResult.booking.attendee.fullName}</b></div>
                    <div>Event: <b className="text-white">{scanResult.booking.eventTitle}</b></div>
                    <div>
                      Seats:{' '}
                      <b className="text-indigo-400">
                        {scanResult.booking.seats.map((s) => `Row ${s.row}-${s.number}`).join(', ')}
                      </b>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Attendee Live Log Table */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
              Gate Activity Stream ({bookings.length} Bookings)
            </h3>

            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 font-mono">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-white block">{b.attendee.fullName}</span>
                    <span className="text-[10px] text-slate-500">{b.bookingReference} • {b.eventTitle}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      b.status === 'checked_in' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {b.status === 'checked_in' ? 'Checked In' : 'Confirmed'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Host New Event Form with AI Copilot */}
      {subTab === 'create' && (
        <div className="bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl max-w-3xl mx-auto space-y-6">
          {(!currentUser || currentUser.role === 'student') && (
            <div className="p-6 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-200 font-mono space-y-3 shadow-lg">
              <div className="flex items-center gap-2.5 font-bold text-sm text-amber-300">
                <Lock className="w-5 h-5 text-amber-400 shrink-0" />
                <span>SRHU Faculty Host Access Required</span>
              </div>
              <p className="text-xs text-amber-200/90 leading-relaxed">
                {currentUser
                  ? `Logged in as Student (${currentUser.fullName}). Students can register for events across all SRHU departments. Hosting and publishing new campus events is restricted to SRHU Faculty & Department Leads.`
                  : 'You must be authenticated as an SRHU Faculty Member or Department Lead to host and publish events on EventHive.'}
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onOpenAuth && onOpenAuth('signin')}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Sign In as Faculty Host</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAuth && onOpenAuth('signup')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all active:scale-95"
                >
                  Create Faculty Account
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-xl font-bold text-white">Publish New Gathering</h3>
              <p className="text-xs font-mono text-slate-400">Configure event details, seat quotas, and pricing tiers.</p>
            </div>

            <button
              type="button"
              onClick={handleGenerateAiDescription}
              disabled={isGeneratingAi}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-indigo-600 text-white shadow-md hover:bg-indigo-500 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isGeneratingAi ? 'AI Drafting...' : 'AI COPILOT DRAFT'}</span>
            </button>
          </div>

          <form onSubmit={handleCreateEventSubmit} className="space-y-4 text-xs font-mono">
            {/* Organizing SRHU Department */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-indigo-400 font-bold">
                <Building2 className="w-4 h-4" />
                <span>SRHU Department & Registration Control</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Host / Organizing Department *</label>
                  <select
                    value={organizingDepartment}
                    onChange={(e) => setOrganizingDepartment(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 text-indigo-300 font-bold border rounded-xl border-slate-800 outline-none focus:border-indigo-500"
                  >
                    {SRHU_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Registration Permissions *</label>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAllDepartmentsAllowed(true)}
                      className={`flex-1 py-2 px-3 rounded-xl border font-bold text-[11px] transition-all ${
                        isAllDepartmentsAllowed
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      Allow All SRHU
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAllDepartmentsAllowed(false)}
                      className={`flex-1 py-2 px-3 rounded-xl border font-bold text-[11px] transition-all ${
                        !isAllDepartmentsAllowed
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      Restrict Depts
                    </button>
                  </div>
                </div>
              </div>

              {/* Department Checkbox List if Restricted */}
              {!isAllDepartmentsAllowed && (
                <div className="pt-2 border-t border-slate-900 space-y-2">
                  <span className="text-[11px] text-amber-300 font-bold block">
                    Select Which SRHU Departments Can Register for this Event:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SRHU_DEPARTMENTS.map((dept) => {
                      const isSelected = allowedDepartments.includes(dept);
                      return (
                        <label
                          key={dept}
                          onClick={() => toggleDepartmentPermission(dept)}
                          className={`p-2 rounded-xl border cursor-pointer flex items-center gap-2 transition-all ${
                            isSelected
                              ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200'
                              : 'bg-slate-900 border-slate-800 text-slate-500'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // Handled by container onClick
                            className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
                          />
                          <span className="text-[11px] font-semibold truncate">{dept}</span>
                        </label>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-400 italic">
                    Note: Students from unselected departments can view event details on the portal, but will be barred from registering.
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-400 block mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Summer Rooftop Music & Tech Mixer"
                  className="w-full p-2.5 bg-slate-950 text-white border rounded-xl border-slate-800 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-400 block mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 text-indigo-400 border rounded-xl border-slate-800 outline-none focus:border-indigo-500"
                >
                  <option value="Tech & Innovation">Tech & Innovation</option>
                  <option value="Music & Arts">Music & Arts</option>
                  <option value="Community & Workshops">Community & Workshops</option>
                  <option value="Food & Culinary">Food & Culinary</option>
                  <option value="Wellness & Sports">Wellness & Sports</option>
                  <option value="Networking & Business">Networking & Business</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-slate-400 block mb-1">Date *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 text-white border rounded-xl border-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-400 block mb-1">Time *</label>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="06:00 PM"
                  className="w-full p-2.5 bg-slate-950 text-white border rounded-xl border-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-400 block mb-1">Price Range</label>
                <input
                  type="text"
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  placeholder="$25 - $75"
                  className="w-full p-2.5 bg-slate-950 text-white border rounded-xl border-slate-800 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-400 block mb-1">Venue Location *</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Civic Center Auditorium"
                className="w-full p-2.5 bg-slate-950 text-white border rounded-xl border-slate-800 outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-400 block mb-1">Summary Description *</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe key highlights and attractions..."
                className="w-full p-2.5 bg-slate-950 text-white border rounded-xl border-slate-800 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isCreating}
              className="w-full py-3 rounded-xl font-mono font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
            >
              {isCreating ? 'Publishing Event...' : 'PUBLISH EVENT WITH SEATING GRID'}
            </button>
          </form>
        </div>
      )}

      {/* SUB-TAB 3: Sales & Analytics */}
      {subTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono">
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                TOTAL REVENUE
              </span>
              <span className="text-2xl font-bold text-indigo-400">${totalRevenue}</span>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                TICKETS ISSUED
              </span>
              <span className="text-2xl font-bold text-emerald-400">{totalTicketsSold}</span>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                CHECKED IN
              </span>
              <span className="text-2xl font-bold text-indigo-300">{checkedInCount}</span>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                CHECK-IN RATE
              </span>
              <span className="text-2xl font-bold text-amber-400">{checkInRate}%</span>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl font-mono">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-4">Venue Occupancy Breakdown</h3>
            <div className="space-y-4">
              {events.map((evt) => {
                const pct = Math.round((evt.bookedCount / evt.totalCapacity) * 100);
                return (
                  <div key={evt.id} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-white">{evt.title}</span>
                      <span className="text-indigo-400">
                        {evt.bookedCount} / {evt.totalCapacity} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div className="bg-indigo-600 h-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
