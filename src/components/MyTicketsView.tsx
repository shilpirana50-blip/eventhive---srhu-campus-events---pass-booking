import React, { useState } from 'react';
import { Ticket, QrCode, Calendar, MapPin, CheckCircle2, Mail, ExternalLink, Printer } from 'lucide-react';
import { Booking } from '../types';
import { TicketModal } from './TicketModal';

interface MyTicketsViewProps {
  bookings: Booking[];
  onBrowseEvents: () => void;
}

export const MyTicketsView: React.FC<MyTicketsViewProps> = ({ bookings, onBrowseEvents }) => {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest block mb-1">
            DIGITAL PASSBOOK
          </span>
          <h2 className="text-2xl font-black text-white">My Reserved Tickets ({bookings.length})</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Access your QR check-in codes, seat assignments, and emailed receipts.
          </p>
        </div>

        <button
          onClick={onBrowseEvents}
          className="px-4 py-2.5 rounded-xl text-xs font-mono font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
        >
          DISCOVER EVENTS
        </button>
      </div>

      {bookings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4 hover:border-emerald-500/50 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Ref: {b.bookingReference}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      b.status === 'checked_in'
                        ? 'bg-indigo-500 text-white'
                        : 'bg-amber-500 text-slate-950'
                    }`}
                  >
                    {b.status === 'checked_in' ? 'Checked In' : 'Confirmed'}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-white">{b.eventTitle}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{b.eventDate} • {b.eventTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">{b.eventLocation}</span>
                  </div>
                </div>

                {/* Seat tags */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                  <div className="text-slate-400 text-[11px]">Attendee: <span className="font-bold text-white">{b.attendee.fullName}</span></div>
                  <div className="text-slate-400 text-[11px]">
                    Reserved Seats:{' '}
                    <span className="font-extrabold text-emerald-400">
                      {b.seats.length > 0 ? b.seats.map((s) => `Row ${s.row}-${s.number}`).join(', ') : 'General Admission'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-base font-black text-white">${b.totalPrice}</span>
                <button
                  onClick={() => setSelectedBooking(b)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                >
                  <QrCode className="w-4 h-4" />
                  <span>View QR Pass</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <Ticket className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No active ticket reservations</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven’t booked any event slots yet. Browse community events and reserve your interactive seats!
          </p>
          <button
            onClick={onBrowseEvents}
            className="mt-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-emerald-600 text-white transition-all shadow-md"
          >
            Browse Community Events
          </button>
        </div>
      )}

      {selectedBooking && (
        <TicketModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />
      )}
    </div>
  );
};
