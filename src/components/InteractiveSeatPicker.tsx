import React, { useState, useEffect } from 'react';
import { Armchair, CheckCircle2, Lock, AlertTriangle, Clock, ShieldCheck, Info } from 'lucide-react';
import { Event, Seat, SelectedSeatInfo } from '../types';

interface InteractiveSeatPickerProps {
  event: Event;
  selectedSeats: SelectedSeatInfo[];
  onToggleSeat: (seat: Seat) => void;
  onProceedToCheckout: () => void;
  onClose: () => void;
}

export const InteractiveSeatPicker: React.FC<InteractiveSeatPickerProps> = ({
  event,
  selectedSeats,
  onToggleSeat,
  onProceedToCheckout,
  onClose,
}) => {
  // Hold timer countdown (5 minutes = 300s)
  const [timeLeft, setTimeLeft] = useState<number>(300);

  useEffect(() => {
    if (selectedSeats.length === 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedSeats.length]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getSeatColorClass = (seat: Seat, isSelected: boolean) => {
    if (seat.status === 'booked') {
      return 'bg-slate-800 text-slate-600 border-none cursor-not-allowed';
    }
    if (isSelected) {
      return 'border border-indigo-500 bg-indigo-500/20 text-indigo-300 shadow-lg shadow-indigo-500/20 font-mono font-black scale-105';
    }
    return 'border border-slate-700 bg-slate-800/40 text-slate-300 hover:border-indigo-400 hover:text-white font-mono';
  };

  const totalPrice = selectedSeats.reduce((acc, s) => acc + s.price, 0);

  // Group seats by row
  const rows = Array.from(new Set(event.seats.map((s) => s.row))).sort();

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 text-white rounded-3xl w-full max-w-4xl border border-slate-800 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <div className="text-xs text-indigo-400 font-mono mb-1 uppercase tracking-wider">
              {event.location} • {event.date}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">{event.title}</h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Legend & Safety Notice */}
        <div className="px-6 py-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono shrink-0">
          <div className="flex flex-wrap items-center gap-5 text-[10px] uppercase font-bold text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div> TAKEN
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div> SELECTED
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full border border-slate-600"></div> AVAILABLE
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-indigo-400 text-[10px] uppercase font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>OPTIMISTIC LOCK PROTECTION ACTIVE</span>
          </div>
        </div>

        {/* Venue Seating Map Stage */}
        <div className="p-8 overflow-x-auto overflow-y-auto flex-1 flex flex-col items-center justify-start bg-slate-950/80">
          {/* Stage Graphic matching Design HTML */}
          <div className="w-full max-w-lg my-4 flex flex-col items-center">
            <div className="w-3/4 h-2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent rounded-full mb-4 opacity-60 shadow-lg shadow-indigo-500/30"></div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] font-mono">
              STAGE
            </div>
          </div>

          {/* Seat Grid */}
          <div className="space-y-3 my-6">
            {rows.map((rowName) => {
              const rowSeats = event.seats.filter((s) => s.row === rowName);
              return (
                <div key={rowName} className="flex items-center gap-3">
                  <span className="w-6 text-center text-xs font-mono font-bold text-slate-500">{rowName}</span>
                  <div className="flex items-center gap-2 flex-nowrap">
                    {rowSeats.map((seat) => {
                      const isSelected = selectedSeats.some((s) => s.seatId === seat.id);
                      const isBooked = seat.status === 'booked';

                      return (
                        <button
                          key={seat.id}
                          disabled={isBooked}
                          onClick={() => onToggleSeat(seat)}
                          title={`Row ${seat.row} Seat ${seat.number} - ${seat.tier} ($${seat.price})`}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md transition-all flex items-center justify-center text-xs ${getSeatColorClass(
                            seat,
                            isSelected
                          )}`}
                        >
                          {isBooked ? (
                            <Lock className="w-3 h-3 text-slate-600" />
                          ) : (
                            seat.number
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <span className="w-6 text-center text-xs font-mono font-bold text-slate-500">{rowName}</span>
                </div>
              );
            })}
          </div>

          <div className="text-[10px] text-slate-600 uppercase tracking-widest font-mono mt-2">
            Ground Floor & VIP Tier Seats
          </div>
        </div>

        {/* Footer Selected Seats & Proceed CTA */}
        <div className="p-5 bg-slate-900 border-t border-slate-800 shrink-0">
          {selectedSeats.length > 0 ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-mono text-slate-400">Selected Seats:</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedSeats.map((s) => (
                      <span
                        key={s.seatId}
                        className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                      >
                        {s.row}-{s.number} (${s.price})
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1 text-amber-400">
                    <Clock className="w-3.5 h-3.5" />
                    Holding lock: {formatTimer(timeLeft)}
                  </span>
                  <span>• Transaction atomic</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Total</span>
                  <span className="text-2xl font-mono font-bold text-indigo-400">${totalPrice}</span>
                </div>

                <button
                  id="btn-proceed-checkout"
                  onClick={onProceedToCheckout}
                  className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-mono font-bold text-xs transition-all shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center gap-2"
                >
                  <Armchair className="w-4 h-4" />
                  <span>CONFIRM SELECTION</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-400" />
                <span>Select open seat tiles on the stage layout above.</span>
              </div>
              <span className="text-slate-500">MAX 6 SEATS PER TRANSACTION</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
