import React from 'react';
import { Calendar, MapPin, Ticket, Users, Clock, Armchair, ArrowRight, ShieldCheck, Mail, Building2, Lock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Event } from '../types';

interface EventDetailModalProps {
  event: Event;
  userDepartment?: string;
  onBook: (event: Event) => void;
  onClose: () => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, userDepartment, onBook, onClose }) => {
  const allowedDepts = event.allowedDepartments || ['ALL'];
  const isAllAllowed = allowedDepts.includes('ALL');
  const isUserEligible = !userDepartment || isAllAllowed || allowedDepts.includes(userDepartment);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-3xl w-full max-w-2xl border border-slate-200 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header Hero Image */}
        <div className="relative h-56 sm:h-64 w-full bg-slate-900 shrink-0">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-950/60 hover:bg-slate-950 text-white flex items-center justify-center transition-colors"
          >
            ✕
          </button>

          <div className="absolute bottom-4 left-6 right-6 text-white space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white uppercase tracking-wider">
                {event.category}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-indigo-300 border border-slate-700">
                SRHU Jolly Grant
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">{event.title}</h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                {event.date} • {event.time}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {event.location}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Body Details */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* SRHU Department Info Box */}
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-950">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span>Organized By: {event.organizingDepartment || 'Swami Rama Himalayan University'}</span>
              </div>
            </div>
            <div className="text-xs text-indigo-900 flex items-start gap-1.5 pt-1">
              <span className="font-bold shrink-0">Allowed Departments:</span>
              <span className="font-medium">
                {isAllAllowed ? 'Open for ALL SRHU Departments' : allowedDepts.join(', ')}
              </span>
            </div>
          </div>

          {/* Non-Eligible Read-Only Alert Banner */}
          {!isUserEligible && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
              <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Read-Only Portal View (Registration Restricted)</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                The organizer has specified that registration for this event is restricted strictly to students/faculty of:{' '}
                <strong>{allowedDepts.join(', ')}</strong>. As a member of <strong>{userDepartment}</strong>, you can view the full event agenda and schedule details, but ticket registration is not permitted.
              </p>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
              Event Overview
            </h3>
            <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
              {event.longDescription || event.description}
            </p>
          </div>

          {/* Seating Tiers Breakdown */}
          {event.seatingTiers && event.seatingTiers.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                Available Pass Tiers
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {event.seatingTiers.map((tier, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
                      <span>{tier.name} Tier</span>
                      <span className="text-indigo-600 font-black">{tier.price === 0 ? 'Free' : `$${tier.price}`}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">{tier.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Agenda */}
          {event.agenda && event.agenda.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                Schedule & Agenda
              </h3>
              <div className="space-y-2">
                {event.agenda.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3 text-xs">
                    <span className="font-mono font-bold text-indigo-600 shrink-0">{item.time}</span>
                    <div>
                      <span className="font-bold text-slate-900 block">{item.title}</span>
                      <span className="text-slate-500 text-[11px]">{item.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 shrink-0 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Entry Fee</span>
            <span className="text-xl font-extrabold text-slate-900">{event.priceRange}</span>
          </div>

          {isUserEligible ? (
            <button
              onClick={() => {
                onClose();
                onBook(event);
              }}
              className="px-6 py-3 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md flex items-center gap-2"
            >
              <span>{event.seatingType === 'seat_map' ? 'Select Seats' : 'Reserve Pass'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="px-4 py-2.5 rounded-xl text-xs font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600" />
              <span>REGISTRATION RESTRICTED TO ALLOWED DEPTS</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
