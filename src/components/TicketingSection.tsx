import React from 'react';
import { 
  Ticket as TicketIcon, 
  Check, 
  ShieldCheck, 
  Zap, 
  CreditCard, 
  Users,
  Sparkles
} from 'lucide-react';
import { TicketType } from '../types/index.js';

interface TicketingSectionProps {
  ticketTypes: TicketType[];
  onSelectTicket: (ticket: TicketType) => void;
}

export const TicketingSection: React.FC<TicketingSectionProps> = ({ ticketTypes, onSelectTicket }) => {
  return (
    <section id="billetterie" className="py-24 relative overflow-hidden bg-[#08090D]">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 tracking-widest uppercase">
            <TicketIcon className="w-4 h-4" />
            <span>Billetterie Officielle</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white uppercase font-display tracking-tight">
            Réservez Vos Places
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Paiement 100% sécurisé via Wave. Réception instantanée de vos e-billets avec QR Code unique et sécurisé.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {ticketTypes.map((ticket) => {
            const isPromo = ticket.name.toLowerCase().includes('prévente') || ticket.price < 2000;
            const remaining = Math.max(0, ticket.available_quantity - ticket.sold_quantity);
            const percentageSold = Math.round((ticket.sold_quantity / ticket.available_quantity) * 100);

            return (
              <div
                key={ticket.id}
                className={`relative rounded-3xl p-8 transition-all duration-300 flex flex-col justify-between ${
                  isPromo
                    ? 'bg-gradient-to-b from-purple-950/40 via-[#111827] to-[#111827] border-2 border-purple-500/50 shadow-2xl neon-glow-purple'
                    : 'bg-[#111827]/80 border border-white/10 hover:border-white/20'
                }`}
              >
                {/* Badge if available */}
                {ticket.badge && (
                  <div className="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-md">
                    {ticket.badge}
                  </div>
                )}

                <div>
                  {/* Category & Title */}
                  <div className="text-xs uppercase tracking-wider text-purple-400 font-bold mb-1">
                    Accès Officiel
                  </div>
                  <h3 className="text-2xl font-black text-white font-display mb-4">
                    {ticket.name}
                  </h3>

                  {/* Price */}
                  <div className="flex items-baseline gap-3 mb-6">
                    <span className="text-4xl sm:text-5xl font-black text-white font-display">
                      {ticket.price.toLocaleString('fr-FR')}
                    </span>
                    <span className="text-lg font-bold text-amber-400 uppercase">FCFA</span>
                    {ticket.original_price && (
                      <span className="text-sm line-through text-slate-500">
                        {ticket.original_price.toLocaleString('fr-FR')} FCFA
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed mb-6">
                    {ticket.description}
                  </p>

                  {/* Availability Gauge */}
                  <div className="space-y-1.5 mb-8">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-400">Disponibilité</span>
                      <span className="text-amber-400 font-bold">{remaining} billets restants</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-amber-400 transition-all duration-500"
                        style={{ width: `${Math.min(100, percentageSold)}%` }}
                      />
                    </div>
                  </div>

                  {/* Included Perks */}
                  <ul className="space-y-3 text-sm text-slate-300 mb-8">
                    <li className="flex items-center gap-2.5">
                      <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span>Accès complet à la soirée à Amaya Beach</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span>Transport navette gratuit aller-retour</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span>E-billet PDF sécurisé avec QR Code unique</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span>Confirmation immédiate WhatsApp & Email</span>
                    </li>
                  </ul>
                </div>

                {/* Buy Button */}
                <button
                  onClick={() => onSelectTicket(ticket)}
                  disabled={remaining === 0}
                  className={`w-full py-4 rounded-xl font-extrabold text-sm sm:text-base uppercase tracking-wider transition-all transform active:scale-98 flex items-center justify-center gap-2 ${
                    remaining === 0
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : isPromo
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-xl shadow-purple-600/30 hover:-translate-y-0.5'
                      : 'bg-white text-slate-950 hover:bg-slate-100 shadow-lg shadow-white/10 hover:-translate-y-0.5'
                  }`}
                >
                  <TicketIcon className="w-4 h-4" />
                  <span>{remaining === 0 ? 'COMPLET' : 'ACHETER CE BILLET'}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Wave Trust Banner */}
        <div className="mt-12 max-w-2xl mx-auto rounded-2xl p-5 bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Paiement instantané Wave</div>
              <div className="text-xs text-slate-400">Sécurisé, simple, sans frais supplémentaires</div>
            </div>
          </div>
          <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Anti-fraude & QR Code crypté</span>
          </div>
        </div>

      </div>
    </section>
  );
};
