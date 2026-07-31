import React, { useState } from 'react';
import { MapPin, Navigation, Calendar, Clock, ArrowRight, Compass } from 'lucide-react';
import { Event } from '../types';

interface MapViewProps {
  events: Event[];
  onSelectEvent: (event: Event) => void;
  onBookEvent: (event: Event) => void;
}

export const MapView: React.FC<MapViewProps> = ({ events, onSelectEvent, onBookEvent }) => {
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');

  const activeEvent = events.find((e) => e.id === selectedEventId) || events[0];

  // Map pin relative positions on SVG canvas
  const pinPositions: { [key: string]: { x: number; y: number } } = {
    'evt-101': { x: 30, y: 35 }, // Silicon District
    'evt-102': { x: 75, y: 25 }, // Waterfront
    'evt-103': { x: 50, y: 45 }, // Skyline
    'evt-104': { x: 25, y: 70 }, // Green Garden
    'evt-105': { x: 60, y: 60 }, // Civic Plaza
    'evt-106': { x: 80, y: 75 }, // Venture Hall
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest block mb-1">
            GEOGRAPHIC DISCOVERY
          </span>
          <h2 className="text-2xl font-black text-white">Interactive Venue Map</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Explore local venue locations across the city district and reserve interactive seats near you.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 text-indigo-400 border border-slate-800 px-3.5 py-2 rounded-xl text-xs font-mono font-bold">
          <Compass className="w-4 h-4 text-indigo-400" />
          <span>ACTIVE VENUES: {events.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Interactive Map Container */}
        <div className="lg:col-span-2 bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-xl relative min-h-[420px] p-6 flex flex-col justify-between">
          {/* Map Grid Canvas Background */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:24px_24px]" />

          {/* District Labels */}
          <div className="relative z-10 flex justify-between text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
            <span>NORTH WATERFRONT BAY</span>
            <span>EAST TECH CORRIDOR</span>
          </div>

          {/* Map Pins */}
          <div className="relative w-full h-[320px] my-auto">
            {/* SVG District Road Overlay */}
            <svg className="absolute inset-0 w-full h-full text-slate-800" stroke="currentColor" strokeWidth="2">
              <path d="M 50 100 Q 200 150 400 100 T 800 200" fill="none" strokeDasharray="4 4" />
              <path d="M 200 50 Q 300 250 500 350" fill="none" strokeDasharray="4 4" />
            </svg>

            {events.map((evt) => {
              const pos = pinPositions[evt.id] || { x: 50, y: 50 };
              const isSelected = evt.id === selectedEventId;

              return (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEventId(evt.id)}
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                >
                  <div
                    className={`p-2.5 rounded-xl flex items-center gap-2 transition-all shadow-xl font-mono ${
                      isSelected
                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-600/30 scale-110 font-bold border border-indigo-400'
                        : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-indigo-400'}`} />
                    <span className="text-xs whitespace-nowrap">{evt.title}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Map Legend */}
          <div className="relative z-10 flex items-center justify-between text-xs font-mono text-slate-400 border-t border-slate-800 pt-3">
            <span>Click map pins to view venue capacity</span>
            <span className="text-indigo-400 font-bold">GRID ONLINE</span>
          </div>
        </div>

        {/* Selected Venue / Event Detail Panel */}
        {activeEvent && (
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="relative h-40 rounded-2xl overflow-hidden bg-slate-950">
                <img
                  src={activeEvent.image}
                  alt={activeEvent.title}
                  className="w-full h-full object-cover opacity-85"
                />
                <span className="absolute top-2 left-2 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 backdrop-blur-md uppercase">
                  {activeEvent.category}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">{activeEvent.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">{activeEvent.description}</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs font-mono text-slate-300">
                <div className="flex items-center gap-2 font-bold text-indigo-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{activeEvent.date} at {activeEvent.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-bold text-white">{activeEvent.location}</span>
                </div>
                <div className="text-[11px] text-slate-400 pl-5.5">{activeEvent.address}</div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-3 font-mono">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 uppercase tracking-wider">Pass Price</span>
                <span className="font-bold text-indigo-400">{activeEvent.priceRange}</span>
              </div>

              <button
                id="btn-map-book"
                onClick={() => onBookEvent(activeEvent)}
                className="w-full py-3 rounded-xl font-mono font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95"
              >
                <span>SELECT SEATS</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
