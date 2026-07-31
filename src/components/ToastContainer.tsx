import React from 'react';
import { Bell, Sparkles, X, ArrowRight, Building2, Ticket, CheckCircle2 } from 'lucide-react';
import { ToastAlert } from '../types';

interface ToastContainerProps {
  toasts: ToastAlert[];
  onDismiss: (id: string) => void;
  onSelectEventById?: (eventId: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
  onSelectEventById,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm sm:max-w-md w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-slate-900/95 text-white border border-indigo-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-lg transform transition-all duration-300 hover:border-indigo-400 animate-slide-up space-y-2"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center shrink-0 text-indigo-300">
                {toast.type === 'new_event' ? (
                  <Sparkles className="w-4 h-4 text-amber-400" />
                ) : toast.type === 'slots_open' ? (
                  <Ticket className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Bell className="w-4 h-4 text-indigo-400" />
                )}
              </div>
              <div>
                <span className="text-[10px] font-mono text-indigo-300 uppercase font-bold tracking-wider block">
                  EventHive Alert • {toast.timestamp}
                </span>
                <h4 className="text-xs font-black text-white leading-tight">{toast.title}</h4>
              </div>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300 font-normal leading-relaxed">{toast.message}</p>

          {toast.department && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-mono text-indigo-300 font-bold">
              <Building2 className="w-3 h-3 text-indigo-400 shrink-0" />
              <span>{toast.department}</span>
            </div>
          )}

          {toast.eventId && onSelectEventById && (
            <div className="pt-1 flex justify-end">
              <button
                onClick={() => {
                  onDismiss(toast.id);
                  onSelectEventById(toast.eventId!);
                }}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-[11px] flex items-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                <span>View Event Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
