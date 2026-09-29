import React from 'react';
import { Clock, Disc3, Flame, Sparkles, Moon, Sun } from 'lucide-react';
import { ProgramItem } from '../types/index.js';

interface ProgramSectionProps {
  programs: ProgramItem[];
}

export const ProgramSection: React.FC<ProgramSectionProps> = ({ programs }) => {
  const getIcon = (index: number) => {
    switch (index % 5) {
      case 0: return <Moon className="w-5 h-5 text-indigo-400" />;
      case 1: return <Disc3 className="w-5 h-5 text-purple-400 animate-spin-slow" />;
      case 2: return <Flame className="w-5 h-5 text-amber-400" />;
      case 3: return <Sparkles className="w-5 h-5 text-pink-400" />;
      default: return <Sun className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <section id="programme" className="py-20 bg-[#0c0d14] border-t border-white/5 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-purple-400 tracking-widest uppercase">
            <Clock className="w-4 h-4" />
            <span>Timeline de la Soirée</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white uppercase font-display tracking-tight">
            Le Programme
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Découvrez le timing officiel des sets DJ, animations football et shows nocturnes à Amaya Beach.
          </p>
        </div>

        {/* Timeline cards */}
        <div className="relative border-l-2 border-purple-500/30 ml-4 sm:ml-32 space-y-8 pb-4">
          {programs.map((item, idx) => (
            <div key={item.id || idx} className="relative pl-6 sm:pl-10 group">
              
              {/* Dot / Icon */}
              <div className="absolute -left-[17px] top-1 w-8 h-8 rounded-full bg-[#111827] border-2 border-purple-500 flex items-center justify-center shadow-lg shadow-purple-600/30 group-hover:scale-110 transition-transform">
                {getIcon(idx)}
              </div>

              {/* Time indicator for desktop on the left */}
              <div className="hidden sm:block absolute -left-36 top-1 text-right w-24">
                <span className="font-extrabold text-base text-amber-400 font-display tracking-wider">
                  {item.time}
                </span>
              </div>

              {/* Content box */}
              <div className="rounded-xl p-5 sm:p-6 bg-[#111827]/80 border border-white/10 group-hover:border-purple-500/40 backdrop-blur-sm transition-all shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <h3 className="text-lg sm:text-xl font-bold text-white font-display">
                    {item.title}
                  </h3>
                  <span className="sm:hidden text-xs font-bold px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">
                    {item.time}
                  </span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {item.description}
                </p>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
