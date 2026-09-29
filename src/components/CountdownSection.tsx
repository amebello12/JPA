import React, { useState, useEffect } from 'react';
import { Flame, Clock } from 'lucide-react';

interface CountdownSectionProps {
  targetDateStr?: string;
}

export const CountdownSection: React.FC<CountdownSectionProps> = ({ targetDateStr = '2026-10-03T20:00:00Z' }) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isLive: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isLive: false
  });

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(targetDateStr).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isLive: true
        });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isLive: false
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDateStr]);

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="w-full max-w-5xl mx-auto px-4 -mt-8 relative z-20">
      <div className="rounded-2xl p-6 sm:p-8 bg-[#111827]/90 border border-purple-500/30 backdrop-blur-xl shadow-2xl neon-glow-purple">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Header text */}
          <div className="flex items-center gap-3 text-left">
            <div className="p-3 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest text-amber-400 font-extrabold">Compte à Rebours Officiel</span>
              <h3 className="text-xl sm:text-2xl font-black text-white font-display uppercase tracking-tight">
                Le Rendez-vous des Maillots
              </h3>
            </div>
          </div>

          {/* Counter blocks or Live Indicator */}
          {timeLeft.isLive ? (
            <div className="flex items-center gap-3 px-6 py-4 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-black text-xl sm:text-2xl uppercase tracking-wider animate-pulse shadow-lg shadow-red-500/30">
              <Flame className="w-8 h-8 text-amber-300" />
              <span>🔥 L'ÉVÉNEMENT EST EN COURS</span>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 sm:gap-4 w-full md:w-auto">
              {/* Days */}
              <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl bg-black/50 border border-white/10 min-w-[70px] sm:min-w-[90px]">
                <span className="text-2xl sm:text-4xl font-black text-white font-display tracking-tight">
                  {timeLeft.days}
                </span>
                <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-400 tracking-wider">
                  Jours
                </span>
              </div>

              {/* Hours */}
              <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl bg-black/50 border border-white/10 min-w-[70px] sm:min-w-[90px]">
                <span className="text-2xl sm:text-4xl font-black text-white font-display tracking-tight">
                  {pad(timeLeft.hours)}
                </span>
                <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-400 tracking-wider">
                  Heures
                </span>
              </div>

              {/* Minutes */}
              <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl bg-black/50 border border-white/10 min-w-[70px] sm:min-w-[90px]">
                <span className="text-2xl sm:text-4xl font-black text-white font-display tracking-tight">
                  {pad(timeLeft.minutes)}
                </span>
                <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-400 tracking-wider">
                  Minutes
                </span>
              </div>

              {/* Seconds */}
              <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl bg-purple-950/40 border border-purple-500/40 min-w-[70px] sm:min-w-[90px]">
                <span className="text-2xl sm:text-4xl font-black text-amber-400 font-display tracking-tight">
                  {pad(timeLeft.seconds)}
                </span>
                <span className="text-[10px] sm:text-xs uppercase font-bold text-purple-300 tracking-wider">
                  Secondes
                </span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
