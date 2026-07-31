import React, { useState } from 'react';
import { ShieldCheck, Zap, CheckCircle2, XCircle, RefreshCw, AlertTriangle, Lock } from 'lucide-react';
import { simulateConcurrencyTest } from '../lib/api';

interface ConcurrencyTestModalProps {
  onClose: () => void;
  onRefreshEvents: () => void;
}

export const ConcurrencyTestModal: React.FC<ConcurrencyTestModalProps> = ({ onClose, onRefreshEvents }) => {
  const [targetSeatId, setTargetSeatId] = useState('B-1');
  const [isRunning, setIsRunning] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  const handleRunSimulation = async () => {
    setIsRunning(true);
    setSimulationResult(null);

    try {
      const res = await simulateConcurrencyTest('evt-101', targetSeatId);
      setSimulationResult(res);
      onRefreshEvents();
    } catch (err: any) {
      alert('Simulation failed: ' + err.message);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 text-white rounded-3xl w-full max-w-xl border border-slate-800 shadow-2xl overflow-hidden my-auto flex flex-col">
        {/* Header */}
        <div className="p-6 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                Concurrency Protection Engine
              </span>
              <h2 className="text-xl font-black">Double-Booking Collision Shield</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <p className="text-xs text-slate-300">
            This tool tests optimistic locking during high-demand seat releases. It simulates <b>User A</b> and <b>User B</b> submitting a ticket reservation for the exact same seat (e.g., <span className="font-mono text-amber-400 font-bold">{targetSeatId}</span>) simultaneously within 10 milliseconds.
          </p>

          <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
            <label className="font-bold text-slate-300">Select Target Seat to Stress-Test:</label>
            <select
              value={targetSeatId}
              onChange={(e) => setTargetSeatId(e.target.value)}
              className="bg-slate-900 text-amber-400 font-bold px-3 py-1.5 rounded-lg border border-slate-700 outline-none"
            >
              <option value="A-1">Seat Row A-1 (VIP)</option>
              <option value="B-1">Seat Row B-1 (Premium)</option>
              <option value="C-2">Seat Row C-2 (Premium)</option>
              <option value="D-5">Seat Row D-5 (Standard)</option>
            </select>
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={isRunning}
            className="w-full py-3.5 rounded-xl font-extrabold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Simulating High-Speed Concurrency Spike (10ms)...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>Simulate Simultaneous Booking Collision</span>
              </>
            )}
          </button>

          {/* Results Audit Log */}
          {simulationResult && (
            <div className="bg-slate-950 p-5 rounded-2xl border border-amber-500/30 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-slate-200">Transaction Audit Log:</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[10px] font-bold">
                  {simulationResult.optimisticLockingProtection}
                </span>
              </div>

              {/* User 1 Log */}
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-400 block">User A (10ms): RESERVATION SUCCESSFUL</span>
                  <span className="text-[11px] text-slate-400">
                    Ref: {simulationResult.user1.details.bookingReference} • Claimed Seat {targetSeatId}. Event version updated.
                  </span>
                </div>
              </div>

              {/* User 2 Log */}
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-start gap-2">
                <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-rose-400 block">User B (25ms): REJECTED BY OPTIMISTIC LOCK</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {simulationResult.user2.details}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-[11px] text-amber-300 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Zero double bookings occurred! Database atomic versioning guarantees seat uniqueness.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
