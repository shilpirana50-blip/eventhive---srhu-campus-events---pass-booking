import React, { useState, useEffect } from 'react';
import { Search, Filter, Sparkles, RefreshCw, Armchair, Ticket, Calendar, ShieldCheck, Zap, Bell } from 'lucide-react';
import { Event, Seat, SelectedSeatInfo, Booking, EventCategory, ToastAlert, User } from './types';
import { fetchEvents, fetchBookings, fetchEventById } from './lib/api';

import { Navbar } from './components/Navbar';
import { EventCard } from './components/EventCard';
import { EventDetailModal } from './components/EventDetailModal';
import { InteractiveSeatPicker } from './components/InteractiveSeatPicker';
import { CheckoutModal } from './components/CheckoutModal';
import { TicketModal } from './components/TicketModal';
import { CalendarView } from './components/CalendarView';
import { MapView } from './components/MapView';
import { MyTicketsView } from './components/MyTicketsView';
import { OrganizerPortal } from './components/OrganizerPortal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { ConcurrencyTestModal } from './components/ConcurrencyTestModal';
import { ToastContainer } from './components/ToastContainer';
import { AuthModal } from './components/AuthModal';
import { SrhuDepartmentsGrid } from './components/SrhuDepartmentsGrid';

const CATEGORIES: (EventCategory | 'All')[] = [
  'All',
  'Tech & Innovation',
  'Music & Arts',
  'Community & Workshops',
  'Food & Culinary',
  'Wellness & Sports',
  'Networking & Business',
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'browse' | 'calendar' | 'map' | 'my-tickets' | 'organizer'>('browse');

  // User Authentication & Active Department Identity (SRHU Dehradun)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('eventhive_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  const [userDepartment, setUserDepartment] = useState<string>(() => {
    return currentUser?.department || 'School of Science & Technology';
  });

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setUserDepartment(user.department);
    try {
      localStorage.setItem('eventhive_user', JSON.stringify(user));
    } catch {}
    setIsAuthModalOpen(false);

    addToast({
      type: 'info',
      title: `Welcome, ${user.fullName.split(' ')[0]}!`,
      message: `Successfully signed in as ${user.role.toUpperCase()} (${user.department}).`,
      department: user.department,
    });
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('eventhive_user');
    } catch {}

    addToast({
      type: 'info',
      title: 'Signed Out',
      message: 'You have been signed out of your EventHive account.',
    });
  };

  // Toast Notification System State
  const [toasts, setToasts] = useState<ToastAlert[]>([]);

  // Events & Bookings State
  const [events, setEvents] = useState<Event[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [seatingFilter, setSeatingFilter] = useState<'All' | 'seat_map' | 'general'>('All');
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string>('');

  // Modals & Flow States
  const [detailEvent, setDetailEvent] = useState<Event | null>(null);
  const [seatPickerEvent, setSeatPickerEvent] = useState<Event | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeatInfo[]>([]);

  const [checkoutData, setCheckoutData] = useState<{ event: Event; seats: SelectedSeatInfo[] } | null>(null);
  const [activeTicket, setActiveTicket] = useState<Booking | null>(null);

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isConcurrencyModalOpen, setIsConcurrencyModalOpen] = useState(false);

  // Add Toast Notification
  const addToast = (toast: Omit<ToastAlert, 'id' | 'timestamp'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newToast: ToastAlert = { ...toast, id, timestamp: timeStr };
    setToasts((prev) => [newToast, ...prev].slice(0, 4)); // keep max 4
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Trigger school alert manually or on school change
  const handleTriggerSchoolAlert = (departmentName?: string) => {
    const targetDept = departmentName || userDepartment;
    const matchingEvts = events.filter(
      (e) =>
        e.organizingDepartment === targetDept ||
        (e.allowedDepartments && (e.allowedDepartments.includes('ALL') || e.allowedDepartments.includes(targetDept)))
    );

    const openEvt = matchingEvts.find((e) => e.bookedCount < e.totalCapacity);

    if (openEvt) {
      addToast({
        type: 'slots_open',
        title: `Open Registration Slots for ${targetDept}!`,
        message: `'${openEvt.title}' has open registration slots available for your school. Reserve your pass now!`,
        department: targetDept,
        eventId: openEvt.id,
      });
    } else {
      addToast({
        type: 'dept_alert',
        title: `School Alert: ${targetDept}`,
        message: `You are set to receive real-time alerts whenever a new event is published or registration opens for ${targetDept}.`,
        department: targetDept,
      });
    }
  };

  // Notify when user switches department identity
  useEffect(() => {
    if (userDepartment) {
      handleTriggerSchoolAlert(userDepartment);
    }
  }, [userDepartment]);

  // Load Events & Bookings from server
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [evts, bks] = await Promise.all([
        fetchEvents({ category: selectedCategory, search: searchQuery, seatingType: seatingFilter }),
        fetchBookings(),
      ]);
      setEvents(evts);
      setBookings(bks);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, searchQuery, seatingFilter]);

  // Handle seat click in InteractiveSeatPicker
  const handleToggleSeat = (seat: Seat) => {
    if (seat.status === 'booked') return;

    const exists = selectedSeats.some((s) => s.seatId === seat.id);
    if (exists) {
      setSelectedSeats(selectedSeats.filter((s) => s.seatId !== seat.id));
    } else {
      if (selectedSeats.length >= 6) {
        alert('Maximum 6 seats per booking transaction.');
        return;
      }
      setSelectedSeats([
        ...selectedSeats,
        {
          seatId: seat.id,
          row: seat.row,
          number: seat.number,
          tier: seat.tier,
          price: seat.price,
        },
      ]);
    }
  };

  // Trigger seat picker or direct checkout
  const handleInitiateBooking = async (event: Event) => {
    // Check if user is authenticated first
    if (!currentUser) {
      setAuthModalMode('signin');
      setIsAuthModalOpen(true);
      addToast({
        type: 'info',
        title: 'Sign In Required to Register',
        message: 'Please sign in or sign up as an SRHU Student or Faculty member to register for event passes.',
      });
      return;
    }

    // Refresh latest event seats state from server
    try {
      const latest = await fetchEventById(event.id);
      if (latest.seatingType === 'seat_map') {
        setSeatPickerEvent(latest);
        setSelectedSeats([]);
      } else {
        // General admission default seat
        setCheckoutData({
          event: latest,
          seats: [
            {
              seatId: 'GA-1',
              row: 'GA',
              number: 1,
              tier: 'Standard',
              price: latest.seatingTiers[0]?.price || 0,
            },
          ],
        });
      }
    } catch (e) {
      alert('Could not fetch latest event details.');
    }
  };

  const handleBookingSuccess = (booking: Booking) => {
    setCheckoutData(null);
    setSeatPickerEvent(null);
    setActiveTicket(booking);
    loadData();

    addToast({
      type: 'info',
      title: 'Pass Confirmed!',
      message: `Your booking reference ${booking.bookingReference} for ${booking.eventTitle} is ready in My Passes.`,
      department: userDepartment,
    });
  };

  const handleSelectEventById = async (eventId: string) => {
    try {
      const evt = await fetchEventById(eventId);
      setDetailEvent(evt);
    } catch (err) {
      console.error('Failed to select event by id:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'organizer' && !currentUser) {
            setAuthModalMode('signin');
            setIsAuthModalOpen(true);
            addToast({
              type: 'info',
              title: 'Sign In Required to Host Event',
              message: 'Please sign in or create an SRHU account to publish and host campus events.',
            });
            return;
          }
          setActiveTab(tab);
        }}
        myTicketsCount={bookings.length}
        userDepartment={userDepartment}
        setUserDepartment={setUserDepartment}
        onOpenAiAssistant={() => setIsAiModalOpen(true)}
        onOpenConcurrencyTest={() => setIsConcurrencyModalOpen(true)}
        onTriggerSchoolAlert={() => handleTriggerSchoolAlert(userDepartment)}
        toastCount={toasts.length}
        currentUser={currentUser}
        onOpenAuth={(mode) => {
          setAuthModalMode(mode || 'signin');
          setIsAuthModalOpen(true);
        }}
        onSignOut={handleSignOut}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* TAB 1: BROWSE EVENTS */}
        {activeTab === 'browse' && (
          <div className="space-y-8">
            {/* Geometric Hero Banner */}
            <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 text-white p-8 sm:p-12 shadow-2xl">
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:24px_24px]" />

              <div className="relative z-10 max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>EVENTHIVE • SWAMI RAMA HIMALAYAN UNIVERSITY DEHRADUN</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black tracking-tighter leading-tight text-white">
                  EVENT<span className="text-indigo-400">HIVE</span> <br />
                  <span className="text-indigo-400">
                    CAMPUS EVENTS & PASS PORTAL
                  </span>
                </h1>

                <p className="text-xs sm:text-sm text-slate-400 font-normal leading-relaxed">
                  The centralized event hub for all SRHU schools & departments. Receive live toast notifications for new events published by your school or when registration slots open up!
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => handleTriggerSchoolAlert(userDepartment)}
                    className="px-5 py-2.5 rounded-xl font-mono font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95"
                  >
                    <Bell className="w-4 h-4 fill-slate-950" />
                    <span>CHECK MY SCHOOL SLOTS</span>
                  </button>

                  <button
                    onClick={() => setIsConcurrencyModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl font-mono font-bold text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition-all flex items-center gap-2 active:scale-95"
                  >
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>DOUBLE-BOOKING SHIELD</span>
                  </button>

                  <button
                    onClick={() => setIsAiModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl font-mono font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>CAMPUS AI ASSISTANT</span>
                  </button>
                </div>
              </div>
            </div>

            {/* SRHU Department Showcase & Interactive Filter */}
            <SrhuDepartmentsGrid
              selectedDepartment={selectedDepartmentFilter}
              onSelectDepartment={(dept) => setSelectedDepartmentFilter(dept)}
            />

            {/* Filter Bar */}
            <div className="bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4 backdrop-blur-md">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Search Bar */}
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search event title, venue, or category..."
                    className="w-full pl-10 pr-4 py-2 text-xs font-mono bg-slate-950 text-white border rounded-xl border-slate-800 focus:border-indigo-500 outline-none placeholder-slate-600"
                  />
                </div>

                {/* Seating Filter */}
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <Filter className="w-4 h-4 text-indigo-400" />
                  <span className="uppercase tracking-wider">Format:</span>
                  <select
                    value={seatingFilter}
                    onChange={(e) => setSeatingFilter(e.target.value as any)}
                    className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-indigo-400 text-xs font-mono font-bold outline-none"
                  >
                    <option value="All">ALL FORMATS</option>
                    <option value="seat_map">INTERACTIVE VENUE MAP</option>
                    <option value="general">GENERAL ADMISSION</option>
                  </select>
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl font-bold uppercase whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Event Cards Grid */}
            {isLoading ? (
              <div className="text-center py-16 space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-400" />
                <p className="text-xs font-mono text-slate-500">Querying live venue seating pools...</p>
              </div>
            ) : (() => {
              const displayedEvents = events.filter((evt) => {
                if (!selectedDepartmentFilter) return true;
                return (
                  evt.organizingDepartment === selectedDepartmentFilter ||
                  (evt.allowedDepartments &&
                    (evt.allowedDepartments.includes('ALL') || evt.allowedDepartments.includes(selectedDepartmentFilter)))
                );
              });

              return displayedEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedEvents.map((evt) => (
                    <EventCard
                      key={evt.id}
                      event={evt}
                      userDepartment={userDepartment}
                      onSelectEvent={(e) => setDetailEvent(e)}
                      onQuickBook={(e) => handleInitiateBooking(e)}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-slate-900 p-12 rounded-3xl text-center border border-slate-800 space-y-3">
                  <p className="text-sm font-mono font-bold text-slate-300">NO EVENTS FOUND MATCHING FILTER QUERY</p>
                  <p className="text-xs text-slate-500">
                    {selectedDepartmentFilter
                      ? `No active events currently published for ${selectedDepartmentFilter}.`
                      : 'Try adjusting your category selection or search keywords.'}
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('All');
                      setSearchQuery('');
                      setSeatingFilter('All');
                      setSelectedDepartmentFilter('');
                    }}
                    className="mt-2 px-5 py-2.5 rounded-xl text-xs font-mono font-bold bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
                  >
                    RESET ALL FILTERS
                  </button>
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 2: CALENDAR VIEW */}
        {activeTab === 'calendar' && (
          <CalendarView
            events={events}
            onSelectEvent={(e) => setDetailEvent(e)}
            onBookEvent={(e) => handleInitiateBooking(e)}
          />
        )}

        {/* TAB 3: MAP VIEW */}
        {activeTab === 'map' && (
          <MapView
            events={events}
            onSelectEvent={(e) => setDetailEvent(e)}
            onBookEvent={(e) => handleInitiateBooking(e)}
          />
        )}

        {/* TAB 4: MY TICKETS */}
        {activeTab === 'my-tickets' && (
          <MyTicketsView bookings={bookings} onBrowseEvents={() => setActiveTab('browse')} />
        )}

        {/* TAB 5: ORGANIZER PORTAL */}
        {activeTab === 'organizer' && (
          <OrganizerPortal
            events={events}
            bookings={bookings}
            currentUser={currentUser}
            onOpenAuth={(mode) => {
              setAuthModalMode(mode || 'signin');
              setIsAuthModalOpen(true);
            }}
            onEventCreated={(newEvt) => {
              setEvents([newEvt, ...events]);
              addToast({
                type: 'new_event',
                title: `New Event Published: ${newEvt.title}`,
                message: `${newEvt.organizingDepartment} has published a new event! Registration is now open.`,
                department: newEvt.organizingDepartment,
                eventId: newEvt.id,
              });
            }}
            onBookingUpdated={loadData}
          />
        )}
      </main>

      {/* Toast Notification Container */}
      <ToastContainer
        toasts={toasts}
        onDismiss={dismissToast}
        onSelectEventById={handleSelectEventById}
      />

      {/* EventHive Footer Status Bar */}
      <footer className="h-10 bg-indigo-600 flex items-center px-4 sm:px-8 justify-between text-[10px] font-mono font-bold text-indigo-100 uppercase tracking-wider shrink-0 mt-auto">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>EVENTHIVE • REAL-TIME LOCKING SHIELD (ACTIVE)</span>
        </div>
        <div className="hidden sm:block text-indigo-200">
          SRHU DEHRADUN • TICKET POOL: SECURE
        </div>
      </footer>

      {/* MODALS */}
      {detailEvent && (
        <EventDetailModal
          event={detailEvent}
          userDepartment={userDepartment}
          onBook={(e) => handleInitiateBooking(e)}
          onClose={() => setDetailEvent(null)}
        />
      )}

      {seatPickerEvent && (
        <InteractiveSeatPicker
          event={seatPickerEvent}
          selectedSeats={selectedSeats}
          onToggleSeat={handleToggleSeat}
          onProceedToCheckout={() => {
            setCheckoutData({ event: seatPickerEvent, seats: selectedSeats });
            setSeatPickerEvent(null);
          }}
          onClose={() => setSeatPickerEvent(null)}
        />
      )}

      {checkoutData && (
        <CheckoutModal
          event={checkoutData.event}
          selectedSeats={checkoutData.seats}
          userDepartment={userDepartment}
          currentUser={currentUser}
          onSuccess={handleBookingSuccess}
          onClose={() => setCheckoutData(null)}
        />
      )}

      {isAuthModalOpen && (
        <AuthModal
          initialMode={authModalMode}
          onSuccess={handleAuthSuccess}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}

      {activeTicket && (
        <TicketModal booking={activeTicket} onClose={() => setActiveTicket(null)} />
      )}

      {isAiModalOpen && (
        <AiAssistantModal
          events={events}
          onSelectEvent={(e) => setDetailEvent(e)}
          onClose={() => setIsAiModalOpen(false)}
        />
      )}

      {isConcurrencyModalOpen && (
        <ConcurrencyTestModal
          onClose={() => setIsConcurrencyModalOpen(false)}
          onRefreshEvents={loadData}
        />
      )}
    </div>
  );
}
