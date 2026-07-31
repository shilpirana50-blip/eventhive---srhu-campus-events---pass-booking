import React, { useState } from 'react';
import { QrCode, Download, Mail, CheckCircle2, Calendar, MapPin, Ticket, ShieldCheck, Printer, ArrowRight } from 'lucide-react';
import { Booking } from '../types';
import { EmailConfirmationDrawer } from './EmailConfirmationDrawer';

interface TicketModalProps {
  booking: Booking;
  onClose: () => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({ booking, onClose }) => {
  const [showEmailDrawer, setShowEmailDrawer] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <div className="bg-slate-900 text-white rounded-3xl w-full max-w-md border border-slate-800 shadow-2xl overflow-hidden my-auto flex flex-col">
          {/* Top Banner */}
          <div className="p-5 bg-indigo-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono">
              <CheckCircle2 className="w-5 h-5 text-indigo-200" />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider block">BOOKING CONFIRMED</span>
                <span className="text-[10px] font-mono text-indigo-200">REF: {booking.bookingReference}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-indigo-700 hover:bg-indigo-800 flex items-center justify-center text-white font-bold"
            >
              ✕
            </button>
          </div>

          {/* Ticket Visual Pass */}
          <div className="p-6 space-y-6 bg-slate-900">
            <div className="text-center">
              <h3 className="text-xl font-black text-white">{booking.eventTitle}</h3>
              <div className="flex items-center justify-center gap-3 text-xs text-slate-400 mt-2">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  {booking.eventDate} • {booking.eventTime}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                {booking.eventLocation}
              </p>
            </div>

            {/* QR Code Container */}
            <div className="bg-white p-4 rounded-2xl shadow-xl flex flex-col items-center justify-center text-slate-900 border-2 border-dashed border-slate-300">
              {booking.qrCodeDataUrl ? (
                <img
                  src={booking.qrCodeDataUrl}
                  alt="Ticket Check-in QR Code"
                  className="w-48 h-48 object-contain"
                />
              ) : (
                <div className="w-48 h-48 bg-slate-100 rounded flex items-center justify-center text-slate-400">
                  <QrCode className="w-12 h-12" />
                </div>
              )}
              <span className="font-mono text-xs font-bold text-slate-700 tracking-widest mt-2 uppercase">
                {booking.bookingReference}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5">Scan for organizer entrance check-in</span>
            </div>

            {/* Attendee & Seats Summary */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Primary Attendee:</span>
                <span className="font-bold text-white">{booking.attendee.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email Contact:</span>
                <span className="font-bold text-slate-300">{booking.attendee.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Reserved Seats:</span>
                <span className="font-extrabold text-emerald-400">
                  {booking.seats.length > 0
                    ? booking.seats.map((s) => `Row ${s.row}-${s.number}`).join(', ')
                    : 'General Admission'}
                </span>
              </div>
              {booking.addOns.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Included Perks:</span>
                  <span className="font-medium text-slate-300">
                    {booking.addOns.map((a) => a.title).join(', ')}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                onClick={() => setShowEmailDrawer(true)}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
              >
                <Mail className="w-4 h-4" />
                <span>Simulate Confirmation Email (Spring Mail)</span>
              </button>

              <button
                onClick={handlePrint}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center gap-2 border border-slate-700 transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Export PDF Pass</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showEmailDrawer && (
        <EmailConfirmationDrawer booking={booking} onClose={() => setShowEmailDrawer(false)} />
      )}
    </>
  );
};
