import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Ticket, 
  Sparkles, 
  Bus, 
  ShieldCheck, 
  ArrowRight,
  Maximize2,
  X
} from 'lucide-react';
import { EventItem } from '../types/index.js';

interface HeroSectionProps {
  event: EventItem;
  onOpenBooking: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ event, onOpenBooking }) => {
  const [showPosterModal, setShowPosterModal] = useState(false);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="accueil" className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-6 pb-16">
      {/* Background with Dark Glass & Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={event.hero_bg_url || "/src/assets/images/beach_nightclub_hero_1790634663007.jpg"}
          alt="Amaya Beach Night Club Party Remix"
          referrerPolicy="no-referrer"
          decoding="async"
          loading="eager"
          className="w-full h-full object-cover object-center scale-105 filter brightness-45 contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090D] via-[#08090D]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#08090D] via-[#08090D]/60 to-purple-950/40" />
        <div className="absolute inset-0 pitch-pattern opacity-40 pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headline & Event Details */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-6 text-left">
            
            {/* Organizers Tag */}
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-purple-300 tracking-wider uppercase border border-purple-500/30 bg-purple-950/50 backdrop-blur-md px-3.5 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{event.organizers.join(' × ')} Présentent</span>
            </div>

            {/* Main Title */}
            <div className="space-y-1">
              <h2 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white uppercase font-display leading-none">
                JERSEY <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">PARTY</span>
              </h2>
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-100 uppercase font-display flex flex-wrap items-center gap-3">
                <span>NIGHT CLUB</span>
                <span className="px-3 py-1 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-extrabold text-2xl sm:text-4xl rounded-lg shadow-lg shadow-amber-500/20 transform -rotate-1">
                  {event.edition || 'REMIX 2026'}
                </span>
              </h1>
            </div>

            {/* Slogan */}
            <blockquote className="text-lg sm:text-xl text-slate-200 font-medium italic border-l-2 border-amber-400 pl-4 max-w-2xl">
              {event.slogan || "« Venez avec votre maillot… Repartez avec des souvenirs inoubliables. »"}
            </blockquote>

            {/* Key Event Badges / Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl text-sm pt-2">
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="p-2 rounded-lg bg-purple-600/20 text-purple-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Date & Heure</div>
                  <div className="font-bold text-white">
                    {new Date(event.date).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })} · {event.time || '20h'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Lieu de la soirée</div>
                  <div className="font-bold text-white">{event.location} · {event.venue_details}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Réservation & Billetterie</div>
                  <div className="font-bold text-white">
                    Tél : <a href={`tel:${event.reservation_phone}`} className="text-amber-400 hover:underline">{event.reservation_phone}</a>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="p-2 rounded-lg bg-pink-500/20 text-pink-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Avantage Spécial</div>
                  <div className="font-bold text-pink-300">Femme Libre jusqu’à {event.ladies_free_until || '1h'}</div>
                </div>
              </div>
            </div>

            {/* Shuttle notice banner */}
            <div className="flex items-center gap-2 text-xs text-amber-300/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3.5 py-2 w-full max-w-xl">
              <Bus className="w-4 h-4 flex-shrink-0 text-amber-400" />
              <span>
                <strong>Transport Gratuit :</strong> Départs depuis {event.free_transport_info && event.free_transport_info.length > 0 ? event.free_transport_info.join(', ') : 'Arrêt car Diamaguene, Station Dabo, Mosquée HLM & Station marché'}.
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2 w-full sm:w-auto">
              <button
                onClick={onOpenBooking}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-extrabold text-sm sm:text-base tracking-wider uppercase text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 shadow-xl shadow-purple-600/35 transition-all transform hover:-translate-y-1 active:translate-y-0"
              >
                <Ticket className="w-5 h-5 text-amber-300" />
                <span>ACHETER MON TICKET</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => scrollToSection('evenement')}
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-sm tracking-wide text-slate-200 bg-white/5 hover:bg-white/10 border border-white/15 backdrop-blur-sm transition-all"
              >
                <span>DÉCOUVRIR LA SOIRÉE</span>
              </button>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Paiement sécurisé via Wave
              </span>
              <span>·</span>
              <span>Billet électronique avec QR Code</span>
            </div>

          </div>

          {/* Right Column: Visual Event Flyer Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group max-w-sm sm:max-w-md w-full">
              {/* Neon Glow Aura */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-600 via-purple-600 to-amber-500 rounded-3xl blur-xl opacity-70 group-hover:opacity-100 transition duration-700 pointer-events-none" />
              
              <div className="relative rounded-2xl overflow-hidden border-2 border-white/20 bg-[#0a0d18] shadow-2xl">
                <img
                  src={event.poster_url || "/src/assets/images/official_jersey_flyer_1790635512344.jpg"}
                  alt="Affiche Officielle Fournie - Jersey Night Club Party Remix 2026"
                  referrerPolicy="no-referrer"
                  decoding="async"
                  loading="eager"
                  fetchPriority="high"
                  className="w-full h-auto object-contain rounded-xl select-none"
                />

                {/* Overlay actions */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-4 flex items-center justify-between">
                  <div className="text-left">
                    <div className="text-[11px] font-extrabold text-amber-400 tracking-wider uppercase flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>Affiche Officielle</span>
                    </div>
                    <div className="text-sm font-black text-white">Jersey Night Remix 2026</div>
                  </div>
                  <button
                    onClick={() => setShowPosterModal(true)}
                    className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold backdrop-blur-md transition-colors flex items-center gap-1.5 shadow-lg"
                    title="Agrandir l'affiche en plein écran"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Agrandir</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Poster Lightbox Modal */}
      {showPosterModal && (
        <div 
          onClick={() => setShowPosterModal(false)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 cursor-pointer"
        >
          <div className="relative max-w-2xl w-full max-h-[95vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <div className="w-full flex items-center justify-between pb-3 text-white">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                AFFICHE OFFICIELLE — JERSEY NIGHT REMIX 2026 (AMAYA BEACH)
              </span>
              <button
                onClick={() => setShowPosterModal(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <img
              src={event.poster_url || "/src/assets/images/official_jersey_flyer_1790635512344.jpg"}
              alt="Affiche Officielle Plein Écran"
              referrerPolicy="no-referrer"
              className="w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/25 bg-black"
            />
          </div>
        </div>
      )}
    </section>
  );
};
