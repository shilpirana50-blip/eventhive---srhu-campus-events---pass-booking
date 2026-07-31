import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, Ticket, ArrowRight } from 'lucide-react';
import { Event } from '../types';

interface CalendarViewProps {
  events: Event[];
  onSelectEvent: (event: Event) => void;
  onBookEvent: (event: Event) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ events, onSelectEvent, onBookEvent }) => {
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-08-05');

  // Days in August 2026 (starts on Saturday Aug 1)
  const daysInAugust = Array.from({ length: 31 }, (_, i) => {
    const dayNum = i + 1;
    const dateStr = `2026-08-${dayNum < 10 ? '0' + dayNum : dayNum}`;
    const dayEvents = events.filter((e) => e.date === dateStr);
    return { dayNum, dateStr, dayEvents };
  });

  const activeEvents = events.filter((e) => e.date === selectedDateStr);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest block mb-1">
            SCHEDULE OVERVIEW
          </span>
          <h2 className="text-2xl font-black text-white">Event Calendar Grid</h2>
          <p className="text-xs text-slate-400 mt-0.5 font-normal">
            Select highlighted date cells to filter local gatherings and available seat quotas.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-xl text-xs font-mono font-bold text-indigo-400 border border-slate-800">
          <span>AUGUST 2026</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Month Calendar Grid */}
        <div className="lg:col-span-2 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
          {/* Day Names Header */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-3">
            <span>SUN</span>
            <span>MON</span>
            <span>TUE</span>
            <span>WED</span>
            <span>THU</span>
            <span>FRI</span>
            <span>SAT</span>
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty offset for August 2026 starting Saturday */}
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={`blank-${idx}`} className="h-20 bg-slate-950/40 rounded-xl border border-slate-800/30" />
            ))}

            {daysInAugust.map((day) => {
              const isSelected = day.dateStr === selectedDateStr;
              const hasEvents = day.dayEvents.length > 0;

              return (
                <div
                  key={day.dateStr}
                  onClick={() => setSelectedDateStr(day.dateStr)}
                  className={`h-20 p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30'
                      : hasEvents
                      ? 'bg-slate-950 border-indigo-500/50 hover:border-indigo-400'
                      : 'bg-slate-950/80 border-slate-800/80 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                      {day.dayNum}
                    </span>
                    {hasEvents && (
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                    )}
                  </div>

                  {hasEvents && (
                    <div className="space-y-1">
                      {day.dayEvents.map((e) => (
                        <div
                          key={e.id}
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded truncate ${
                            isSelected ? 'bg-indigo-950 text-indigo-200' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          }`}
                        >
                          {e.title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Selected Date Events List */}
        <div className="space-y-4">
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider block">
                SELECTED DATE
              </span>
              <h3 className="text-lg font-mono font-bold text-white">{selectedDateStr}</h3>
            </div>
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-950 text-indigo-400 border border-slate-800">
              {activeEvents.length} EVENT(S)
            </span>
          </div>

          {activeEvents.length > 0 ? (
            <div className="space-y-3">
              {activeEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                        {evt.category}
                      </span>
                      <h4
                        onClick={() => onSelectEvent(evt)}
                        className="text-sm font-bold text-white hover:text-indigo-400 cursor-pointer transition-colors mt-2"
                      >
                        {evt.title}
                      </h4>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs font-mono text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{evt.time} ({evt.duration})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate">{evt.location}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-indigo-400">{evt.priceRange}</span>
                    <button
                      onClick={() => onBookEvent(evt)}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center gap-1 shadow-md shadow-indigo-600/20"
                    >
                      <span>BOOK</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-center text-slate-500 space-y-2">
              <CalendarIcon className="w-10 h-10 mx-auto text-slate-700" />
              <p className="text-xs font-mono font-bold text-slate-400">NO scheduled events on this date.</p>
              <p className="text-[11px] font-mono text-slate-600">Try selecting August 5, 8, 12, 15, or 20 on the grid.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
