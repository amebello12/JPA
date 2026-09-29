import React from 'react';
import { 
  Shirt, 
  Music, 
  MapPin, 
  Bus, 
  Sparkles, 
  AlertCircle, 
  Flame, 
  PhoneCall,
  CheckCircle2,
  Trophy
} from 'lucide-react';
import { EventItem } from '../types/index.js';

interface EventDetailsSectionProps {
  event: EventItem;
  onOpenBooking: () => void;
}

export const EventDetailsSection: React.FC<EventDetailsSectionProps> = ({ event, onOpenBooking }) => {
  return (
    <section id="evenement" className="py-24 relative overflow-hidden bg-[#08090D]">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 tracking-widest uppercase">
            <Trophy className="w-4 h-4" />
            <span>L’Expérience Jersey Night 2026</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white uppercase font-display tracking-tight">
            Le Concept & La Soirée
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Une fusion inédite entre la passion des maillots de football légendaires, l’énergie vibrante du clubbing et la brise marine d’Amaya Beach.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          {/* Card 1: LE CONCEPT */}
          <div className="md:col-span-2 rounded-2xl p-8 bg-[#111827]/80 border border-white/10 hover:border-purple-500/40 backdrop-blur-sm transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-2xl group-hover:bg-purple-600/20 transition-all pointer-events-none" />
            
            <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Le Concept</span>
                </div>
                
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display uppercase tracking-tight">
                  Football × Streetwear × Nightclub
                </h3>
                
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  {event.description}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  <div className="flex items-center gap-2 text-sm text-slate-200">
                    <span className="text-base">⚽</span>
                    <span>Football Culture</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-200">
                    <span className="text-base">🎶</span>
                    <span>DJ Sets & Remix</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-200">
                    <span className="text-base">🕺</span>
                    <span>Dance Floor Plage</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-200">
                    <span className="text-base">👕</span>
                    <span>Jersey Parade</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-200">
                    <span className="text-base">✨</span>
                    <span>Light Show & Néon</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-200">
                    <span className="text-base">🔥</span>
                    <span>Ambiance Garantie</span>
                  </div>
                </div>
              </div>

              {/* Photo Showcase */}
              <div className="rounded-xl overflow-hidden border border-white/10 mt-4 max-h-48">
                <img
                  src={event.crowd_img_url || "/src/assets/images/jersey_crowd_vibe_1790634672721.jpg"}
                  alt="Ambiance Jersey Night Party"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>

          {/* Card 2: DRESS CODE */}
          <div className="rounded-2xl p-8 bg-gradient-to-b from-[#161c2e] to-[#111827] border border-amber-500/30 hover:border-amber-400/60 backdrop-blur-sm transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Shirt className="w-3.5 h-3.5 text-amber-400" />
                <span>Dress Code Officiel</span>
              </div>

              <h3 className="text-2xl font-black text-white font-display uppercase tracking-tight">
                Ton Plus Beau Maillot
              </h3>

              <div className="p-4 rounded-xl bg-black/40 border border-amber-500/20 text-sm text-amber-200 font-medium italic">
                {event.dress_code || "« Venez avec votre maillot préféré : club, équipe nationale ou maillot de football iconique. »"}
              </div>

              <ul className="space-y-2.5 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Maillots de club (PSG, Real, Barça, etc.)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Maillots de sélection nationale (Sénégal...)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Maillots vintage & collectors rétro</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Style streetwear & baskets assorties</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 border-t border-white/10 mt-6">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Conseil Style</div>
              <div className="text-xs text-amber-300 mt-1">Floquez votre nom ou venez avec vos numéros légendaires 7, 10, 23 !</div>
            </div>
          </div>

        </div>

        {/* Second Row: Venue, Shuttles & Ladies Promo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 3: LIEU */}
          <div className="rounded-2xl p-6 sm:p-8 bg-[#111827]/80 border border-white/10 hover:border-purple-500/30 backdrop-blur-sm transition-all space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-950/60 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span>Le Lieu d'Exception</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white font-display uppercase tracking-tight">
              {event.location} · {event.venue_details}
            </h3>

            <p className="text-sm text-slate-300 leading-relaxed">
              Un cadre idyllique face à l'océan, spécialement aménagé pour la nuit avec projecteurs nightclub, sound system festival, espace lounge et bar à cocktails.
            </p>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span>Réservations & tables :</span>
              <a 
                href={`tel:${event.reservation_phone}`} 
                className="font-bold text-amber-400 hover:underline flex items-center gap-1"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{event.reservation_phone}</span>
              </a>
            </div>
          </div>

          {/* Card 4: TRANSPORT GRATUIT (SHUTTLES) */}
          <div id="transports" className="rounded-2xl p-6 sm:p-8 bg-[#111827]/80 border border-white/10 hover:border-purple-500/30 backdrop-blur-sm transition-all space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Bus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Transport Gratuit</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white font-display uppercase tracking-tight">
              Navettes & Points de Départ
            </h3>

            <p className="text-sm text-slate-300">
              Des navettes gratuites sont mises à disposition pour faciliter vos déplacements aller et retour vers {event.location} :
            </p>

            <ul className="space-y-2 text-xs sm:text-sm text-slate-200">
              {event.free_transport_info.map((station, i) => (
                <li key={i} className="flex items-center gap-2 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>{station}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 5: FEMME LIBRE & 18+ */}
          <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-b from-purple-950/50 to-[#111827] border border-purple-500/40 backdrop-blur-sm transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-pink-950/60 border border-pink-500/40 text-pink-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                <span>Privilège Spécial</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white font-display uppercase tracking-tight">
                Femme Libre jusqu'à {event.ladies_free_until || '1h'}
              </h3>

              <div className="text-sm text-pink-200/90 leading-relaxed">
                Entrée libre et gratuite pour toutes les dames arrivant avant {event.ladies_free_until || '01h00 du matin'} à {event.location} !
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-red-500/30 flex items-start gap-2 text-xs text-red-200">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>18+ :</strong> Soirée strictement réservée aux personnes majeures. L'abus d'alcool est dangereux pour la santé.
                </span>
              </div>
            </div>

            <button
              onClick={onOpenBooking}
              className="w-full py-3 rounded-xl font-bold text-center text-xs tracking-wider uppercase text-white bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-600/30 transition-all mt-4"
            >
              Réserver mes billets
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
