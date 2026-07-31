import React from 'react';
import { Mail, CheckCircle, Calendar, MapPin, Ticket, Download, FileText, ArrowLeft } from 'lucide-react';
import { Booking } from '../types';

interface EmailConfirmationDrawerProps {
  booking: Booking;
  onClose: () => void;
}

export const EmailConfirmationDrawer: React.FC<EmailConfirmationDrawerProps> = ({ booking, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-end">
      <div className="bg-slate-100 text-slate-900 w-full max-w-xl h-full shadow-2xl overflow-y-auto flex flex-col border-l border-slate-300">
        {/* Email Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-400" />
            <div>
              <span className="text-xs font-bold block">SRHU EventHive Dispatcher Simulation</span>
              <span className="text-[10px] text-slate-400">SMTP Host: mail.eventhive.srhu.edu.in (200 OK)</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Email Client Envelope Metadata */}
        <div className="p-4 bg-white border-b border-slate-200 text-xs space-y-1">
          <div>
            <span className="font-bold text-slate-500">From:</span> EventHive SRHU Bookings &lt;noreply@eventhive.srhu.edu.in&gt;
          </div>
          <div>
            <span className="font-bold text-slate-500">To:</span> {booking.attendee.fullName} &lt;{booking.attendee.email}&gt;
          </div>
          <div>
            <span className="font-bold text-slate-500">Subject:</span> Your Confirmed EventHive Pass [{booking.bookingReference}] for {booking.eventTitle}
          </div>
          <div>
            <span className="font-bold text-slate-500">Date:</span> {new Date(booking.createdAt).toLocaleString()}
          </div>
        </div>

        {/* HTML Rendered Email Body */}
        <div className="p-6 space-y-6 flex-1 bg-slate-50">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
            {/* Logo */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black">
                  EH
                </div>
                <span className="font-black text-lg text-slate-900">EventHive</span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                Official SRHU Pass
              </span>
            </div>

            {/* Greeting */}
            <div>
              <h2 className="text-base font-bold text-slate-900">Hello {booking.attendee.fullName},</h2>
              <p className="text-xs text-slate-600 mt-1">
                Thank you for reserving your slot! Your payment has been processed and your venue seats are securely locked in our database.
              </p>
            </div>

            {/* Event Summary Card inside Email */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <h3 className="text-sm font-bold text-slate-900">{booking.eventTitle}</h3>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>{booking.eventDate} at {booking.eventTime}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{booking.eventLocation}</span>
              </div>
            </div>

            {/* Embedded QR Code */}
            <div className="text-center bg-slate-900 text-white p-5 rounded-2xl space-y-2">
              <span className="text-[11px] font-bold text-emerald-400 tracking-wider uppercase block">
                Your Entrance QR Check-In Pass
              </span>
              <div className="bg-white p-3 rounded-xl inline-block">
                <img src={booking.qrCodeDataUrl} alt="QR Pass" className="w-36 h-36 object-contain mx-auto" />
              </div>
              <p className="font-mono text-xs text-slate-300">REF: {booking.bookingReference}</p>
              <p className="text-[10px] text-slate-400">Present this QR code on your mobile device at entry.</p>
            </div>

            {/* Pricing Breakdown Table */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 mb-2">Order Line Items</h4>
              <table className="w-full text-xs text-left text-slate-600 border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-slate-800 font-bold">
                  <tr>
                    <th className="p-2">Item</th>
                    <th className="p-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {booking.seats.map((s, idx) => (
                    <tr key={idx}>
                      <td className="p-2">Seat Row {s.row}-{s.number} ({s.tier})</td>
                      <td className="p-2 text-right font-semibold">${s.price}</td>
                    </tr>
                  ))}
                  {booking.addOns.map((a, idx) => (
                    <tr key={idx}>
                      <td className="p-2">Perk: {a.title}</td>
                      <td className="p-2 text-right font-semibold">${a.price}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold text-slate-900">
                    <td className="p-2">Total Paid</td>
                    <td className="p-2 text-right text-emerald-600 font-extrabold">${booking.totalPrice}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footer Notice */}
            <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-3">
              Questions or venue accessibility needs? Contact the organizer at support@gatherpulse.org or call +1 (800) 555-EVENT.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
