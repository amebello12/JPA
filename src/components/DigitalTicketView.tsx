import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  Printer, 
  Share2, 
  CheckCircle, 
  Calendar, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Shirt, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Ticket, Order } from '../types/index.js';

interface DigitalTicketViewProps {
  order: Order;
  tickets: Ticket[];
  onClose: () => void;
}

export const DigitalTicketView: React.FC<DigitalTicketViewProps> = ({ order, tickets, onClose }) => {
  const [activeTicketIndex, setActiveTicketIndex] = useState<number>(0);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const ticketRef = useRef<HTMLDivElement>(null);

  const currentTicket = tickets[activeTicketIndex] || tickets[0];

  useEffect(() => {
    if (currentTicket) {
      QRCode.toDataURL(currentTicket.qr_token, {
        width: 320,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H'
      })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('Error generating QR code', err));
    }
  }, [currentTicket]);

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🎫 *Mon Billet Officiel — JERSEY NIGHT CLUB REMIX 2026*\n\n` +
      `👤 *Participant :* ${currentTicket.customer_name}\n` +
      `🎟️ *Billet N° :* ${currentTicket.ticket_number}\n` +
      `📦 *Commande :* ${currentTicket.order_number}\n` +
      `📅 *Date :* Samedi 03 Octobre 2026 à 20h00\n` +
      `📍 *Lieu :* Amaya Beach, Mboro Plage\n` +
      `👕 *Dress Code :* Ton plus beau maillot (club ou sélection) !\n` +
      `✨ *Avantage :* Navettes gratuites incluses !\n\n` +
      `Présentez le QR Code officiel à l'entrée d'Amaya Beach.`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#0b0e17] border border-white/15 rounded-3xl shadow-2xl overflow-hidden my-4">
        
        {/* Navigation / Header Bar */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-[#121826]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Billet Électronique Officiel ({activeTicketIndex + 1}/{tickets.length})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Imprimer / Télécharger le billet"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="p-2 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-400 transition-colors"
              title="Partager sur WhatsApp"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Multi-Ticket Tab Selector if more than 1 ticket */}
        {tickets.length > 1 && (
          <div className="flex items-center justify-between px-6 py-2.5 bg-black/40 border-b border-white/5 text-xs">
            <button
              onClick={() => setActiveTicketIndex(Math.max(0, activeTicketIndex - 1))}
              disabled={activeTicketIndex === 0}
              className="p-1 rounded text-slate-300 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-1.5 overflow-x-auto py-1">
              {tickets.map((t, idx) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTicketIndex(idx)}
                  className={`px-3 py-1 rounded-full text-xs font-bold font-mono transition-all ${
                    idx === activeTicketIndex
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {t.ticket_number}
                </button>
              ))}
            </div>
            <button
              onClick={() => setActiveTicketIndex(Math.min(tickets.length - 1, activeTicketIndex + 1))}
              disabled={activeTicketIndex === tickets.length - 1}
              className="p-1 rounded text-slate-300 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* TICKET PASS CONTAINER (PRINTABLE AREA) */}
        <div ref={ticketRef} className="p-6 sm:p-8 space-y-6">
          <div className="relative rounded-2xl bg-gradient-to-b from-[#181f33] via-[#121727] to-[#0d101c] border-2 border-purple-500/40 p-6 sm:p-7 shadow-2xl overflow-hidden neon-glow-purple">
            
            {/* Top Pass Brand Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <div className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest">
                  Amaya × AJCD Cogne Diola
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white font-display uppercase tracking-tight">
                  JERSEY NIGHT REMIX
                </h2>
                <div className="text-xs text-purple-300 font-semibold tracking-wide">
                  PARTY REMIX 2026 · PASS OFFICIEL
                </div>
              </div>

              {/* Status Badge */}
              <div className="text-right">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-black shadow-md">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{currentTicket.status === 'VALID' ? 'VALIDE' : 'UTILISÉ'}</span>
                </span>
                <div className="text-[10px] text-slate-400 font-mono mt-1">
                  N° {currentTicket.ticket_number}
                </div>
              </div>
            </div>

            {/* QR Code Card - Centerpiece */}
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-xl my-4 text-center">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR Code Billet ${currentTicket.ticket_number}`}
                  className="w-52 h-52 sm:w-60 sm:h-60 object-contain"
                />
              ) : (
                <div className="w-52 h-52 flex items-center justify-center text-slate-900">
                  Génération du QR Code...
                </div>
              )}
              
              <div className="mt-2 text-slate-900 text-center">
                <span className="text-[11px] font-black uppercase tracking-wider block text-purple-900">
                  PRÉSENTEZ CE QR CODE À L'ENTRÉE
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Token: {currentTicket.qr_token.slice(0, 18)}...
                </span>
              </div>
            </div>

            {/* Participant Details */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-black/40 border border-white/10 text-xs">
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-bold block">Participant</span>
                <span className="text-white font-bold text-sm block truncate">{currentTicket.customer_name}</span>
                <span className="text-slate-400 text-[11px]">{currentTicket.customer_phone}</span>
              </div>

              <div className="text-right">
                <span className="text-slate-400 uppercase text-[10px] font-bold block">Type d'accès</span>
                <span className="text-amber-400 font-extrabold text-sm block">{currentTicket.ticket_type}</span>
                <span className="text-slate-400 text-[11px]">Prix : {currentTicket.price.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>

            {/* Event Details Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span>Samedi 03 Oct. 2026</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Dès 20h00</span>
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Amaya Beach · Mboro Plage</span>
              </div>
              <div className="flex items-center gap-2 col-span-2 text-pink-300">
                <Shirt className="w-4 h-4 text-pink-400 flex-shrink-0" />
                <span>Dress code : Maillot de foot obligatoire</span>
              </div>
            </div>

            {/* Bottom Guarantee */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-mono">Réf: {currentTicket.order_number}</span>
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                Vérifié & Authentifié
              </span>
            </div>

          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handlePrint}
              className="py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger / Imprimer</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Partager sur WhatsApp</span>
            </button>
          </div>

          <div className="text-center text-xs text-slate-400">
            Une copie de votre confirmation a également été préparée pour votre numéro{' '}
            <strong className="text-white">{currentTicket.customer_phone}</strong>.
          </div>
        </div>

      </div>
    </div>
  );
};
