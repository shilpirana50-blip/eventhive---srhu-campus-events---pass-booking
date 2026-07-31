import React from 'react';
import { Building2, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { SRHU_DEPARTMENTS, SRHUDepartment } from '../types';
import { SRHU_DEPARTMENT_IMAGES } from '../data/mockEvents';

interface SrhuDepartmentsGridProps {
  selectedDepartment?: string;
  onSelectDepartment: (dept: string) => void;
}

const DEPT_SUBTITLES: Record<SRHUDepartment, string> = {
  'School of Science & Technology': 'Computer Science, AI, IoT & Engineering Innovation',
  'School of Nursing': 'Clinical Care, ICU Simulation & Himalayan Healthcare',
  'School of Yoga Science': 'Yogic Philosophy, Pranayama & Neurological Mind Sciences',
  'School of Management Studies': 'Hospital Administration, Business & Leadership',
  'School of Bio Sciences': 'Genomics, Botanical Biodiversity & Molecular Biology',
  'School of Pharmaceutical Sciences': 'Drug Formulations, Industrial Pharmacy & HPLC Labs',
};

export const SrhuDepartmentsGrid: React.FC<SrhuDepartmentsGridProps> = ({
  selectedDepartment,
  onSelectDepartment,
}) => {
  return (
    <div className="bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-bold uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>SWAMI RAMA HIMALAYAN UNIVERSITY (SRHU)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">Campus Schools & Departments</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Select an SRHU department to view upcoming department events, workshops & exclusive student pass access.
          </p>
        </div>

        {selectedDepartment && (
          <button
            onClick={() => onSelectDepartment('')}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-bold border border-slate-700 transition-all"
          >
            Clear Department Filter
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SRHU_DEPARTMENTS.map((dept) => {
          const isSelected = selectedDepartment === dept;
          const bgImg = SRHU_DEPARTMENT_IMAGES[dept];
          const subtitle = DEPT_SUBTITLES[dept];

          return (
            <div
              key={dept}
              onClick={() => onSelectDepartment(isSelected ? '' : dept)}
              className={`group relative rounded-2xl overflow-hidden border cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-500 ring-2 ring-indigo-500/50 shadow-xl scale-[1.02]'
                  : 'border-slate-800 hover:border-indigo-500/50 hover:shadow-lg hover:-translate-y-0.5'
              }`}
            >
              <div className="relative h-36 w-full overflow-hidden bg-slate-950">
                <img
                  src={bgImg}
                  alt={dept}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                <div className="absolute top-2.5 right-2.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow'
                      : 'bg-slate-950/80 text-slate-300 border border-slate-800'
                  }`}>
                    {isSelected ? 'Active Filter' : 'SRHU School'}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-950 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <h3 className="text-sm font-extrabold text-white group-hover:text-indigo-300 transition-colors flex items-center gap-1.5">
                    <span>{dept}</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 leading-snug mt-1 font-sans">
                    {subtitle}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] font-mono font-bold text-slate-400">
                  <span className="flex items-center gap-1 text-indigo-400">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Jolly Grant, Dehradun</span>
                  </span>
                  <span className="text-indigo-300 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Explore Events</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
