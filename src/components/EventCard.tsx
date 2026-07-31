import React from 'react';
import { Calendar, MapPin, Ticket, Users, Armchair, ArrowRight, ShieldAlert, Building2, Lock, CheckCircle2, Eye } from 'lucide-react';
import { Event } from '../types';

interface EventCardProps {
  event: Event;
  userDepartment?: string;
  onSelectEvent: (event: Event) => void;
  onQuickBook: (event: Event) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, userDepartment, onSelectEvent, onQuickBook }) => {
  const percentFilled = Math.min(100, Math.round((event.bookedCount / event.totalCapacity) * 100));
  const isHighDemand = percentFilled >= 75;

  const allowedDepts = event.allowedDepartments || ['ALL'];
  const isAllAllowed = allowedDepts.includes('ALL');

  // Check if current user department is eligible
  const isUserEligible = !userDepartment || isAllAllowed || allowedDepts.includes(userDepartment);

  return (
    <div
      id={`event-card-${event.id}`}
      className="group bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 hover:border-indigo-500/40 shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        {/* Card Header Image & Overlay Badges */}
        <div className="relative h-48 w-full overflow-hidden bg-slate-950">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 backdrop-blur-md truncate max-w-[160px]">
              {event.category}
            </span>

            {/* Department Eligibility Status Badge */}
            {isUserEligible ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 backdrop-blur-md shrink-0">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Open for You</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 backdrop-blur-md shrink-0">
                <Lock className="w-3 h-3 text-amber-400" />
                <span>View-Only</span>
              </span>
            )}
          </div>

          {/* Seating Type Badge */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-slate-950/80 text-slate-300 border border-slate-800 backdrop-blur-md">
            {event.seatingType === 'seat_map' ? (
              <>
                <Armchair className="w-3.5 h-3.5 text-indigo-400" />
                <span>Interactive Venue Map</span>
              </>
            ) : (
              <>
                <Ticket className="w-3.5 h-3.5 text-slate-400" />
                <span>General Admission</span>
              </>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5 space-y-3">
          {/* SRHU Organizing & Allowed Department Badge Bar */}
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1 text-[11px] font-mono">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="text-slate-500">Organizer:</span>
              <span className="font-bold text-indigo-300 truncate">{event.organizingDepartment || 'SRHU Campus'}</span>
            </div>
            <div className="flex items-start gap-1.5 text-slate-400 text-[10px]">
              <span className="text-slate-500 shrink-0">Eligible:</span>
              <span className={`font-semibold ${isAllAllowed ? 'text-emerald-400' : 'text-amber-300'}`}>
                {isAllAllowed ? 'All SRHU Departments' : allowedDepts.join(', ')}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1 text-indigo-400">
              <Calendar className="w-3.5 h-3.5" />
              {event.date}
            </span>
            <span>{event.time}</span>
          </div>

          <h3
            onClick={() => onSelectEvent(event)}
            className="text-lg font-bold text-white group-hover:text-indigo-400 cursor-pointer transition-colors line-clamp-1"
          >
            {event.title}
          </h3>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{event.description}</p>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>

          {/* Capacity Progress Bar */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1.5">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                AVAILABILITY
              </span>
              <span className="font-bold text-slate-200">
                {event.totalCapacity - event.bookedCount} left ({percentFilled}% reserved)
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  isHighDemand ? 'bg-indigo-500' : 'bg-emerald-400'
                }`}
                style={{ width: `${percentFilled}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Pricing & CTA */}
      <div className="px-5 pb-5 pt-3 flex items-center justify-between border-t border-slate-800/80 mt-auto bg-slate-950/30">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold block">
            PASS PRICE
          </span>
          <span className="text-sm font-mono font-bold text-indigo-400">{event.priceRange}</span>
        </div>

        {isUserEligible ? (
          <button
            id={`btn-select-seats-${event.id}`}
            onClick={() => onQuickBook(event)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            <span>{event.seatingType === 'seat_map' ? 'SELECT SEATS' : 'BOOK PASS'}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        ) : (
          <button
            id={`btn-view-only-${event.id}`}
            onClick={() => onSelectEvent(event)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all active:scale-95"
            title="Registration restricted to allowed departments. Click to view event details."
          >
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span>VIEW ONLY</span>
          </button>
        )}
      </div>
    </div>
  );
};

