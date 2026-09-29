import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  MessageSquare,
  Sparkles,
  ExternalLink,
  X
} from 'lucide-react';

interface FooterProps {
  onOpenBooking: () => void;
  reservationPhone: string;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenBooking, reservationPhone, onOpenAdmin }) => {
  const [legalModal, setLegalModal] = useState<'cgv' | 'privacy' | null>(null);
  const [clickCount, setClickCount] = useState<number>(0);

  const handleSecretCopyrightClick = () => {
    setClickCount(prev => {
      const next = prev + 1;
      if (next >= 3) {
        if (onOpenAdmin) onOpenAdmin();
        return 0;
      }
      return next;
    });

    // Reset counter after 2.5 seconds
    setTimeout(() => {
      setClickCount(0);
    }, 2500);
  };

  return (
    <footer className="bg-[#050609] border-t border-white/10 text-slate-400 text-xs pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          
          {/* Col 1 & 2: Brand & Identity */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 to-amber-400 p-[2px]">
                <div className="w-full h-full bg-[#08090D] rounded-[10px] flex items-center justify-center">
                  <span className="font-black text-white text-base">JN</span>
                </div>
              </div>
              <div>
                <div className="font-black text-white text-base sm:text-lg tracking-wider font-display">
                  JERSEY NIGHT CLUB PARTY REMIX 2026
                </div>
                <div className="text-[11px] text-amber-400 font-semibold">
                  Amaya Beach · Mboro Plage
                </div>
              </div>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              La plus grande célébration nocturne alliant passion des maillots de football, streetwear chic, musique électrisante et ambiance balnéaire à Mboro Plage.
            </p>

            <div className="pt-2">
              <button
                onClick={onOpenBooking}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 transition-all"
              >
                Acheter mon ticket
              </button>
            </div>
          </div>

          {/* Col 3: Organisateurs & Partenaires */}
          <div className="space-y-4">
            <div>
              <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-2">
                Organisateurs
              </h4>
              <ul className="space-y-1 text-slate-300">
                <li className="font-medium text-white">Amaya</li>
                <li className="font-medium text-white">AJCD Cogne Diola</li>
              </ul>
            </div>

            <div className="pt-2">
              <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-2">
                Partenaires Officiels
              </h4>
              <ul className="space-y-1 text-slate-300">
                <li>Amaya</li>
                <li>Wa Cogne Diola</li>
                <li>Ressortissants de Cogne Diola</li>
              </ul>
            </div>
          </div>

          {/* Col 4: Réseaux Sociaux & Contact */}
          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-2">
              Suivez-nous & Réseaux
            </h4>
            <div className="flex flex-col space-y-2">
              <a
                href={`https://wa.me/221${reservationPhone.replace(/\s+/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-400 flex items-center gap-2"
              >
                <span>💬 WhatsApp : +221 {reservationPhone}</span>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-pink-400 flex items-center gap-2"
              >
                <span>📸 Instagram @JerseyNightClub</span>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-400 flex items-center gap-2"
              >
                <span>📘 Facebook : Amaya Beach Party</span>
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-200 flex items-center gap-2"
              >
                <span>🎵 TikTok : @JerseyNightParty</span>
              </a>
            </div>
          </div>

          {/* Col 5: Liens Légaux & Sécurité */}
          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-2">
              Informations & Légal
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setLegalModal('cgv')} className="hover:text-white">
                  Conditions Générales de Vente
                </button>
              </li>
              <li>
                <button onClick={() => setLegalModal('privacy')} className="hover:text-white">
                  Politique de Confidentialité
                </button>
              </li>
              <li>
                <a href="#faq" className="hover:text-white">
                  Foire Aux Questions (FAQ)
                </a>
              </li>
              <li className="flex items-center gap-1.5 text-emerald-400 pt-2 font-medium">
                <ShieldCheck className="w-4 h-4" />
                <span>Paiement sécurisé Wave</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p 
            onClick={handleSecretCopyrightClick}
            className="text-slate-500 text-xs cursor-default select-none transition-colors hover:text-slate-400"
            title="Amaya & AJCD Cogne Diola"
          >
            © 2026 Expert Even & AJCD Cogne Diola — Tous droits réservés.
          </p>
          <div className="flex items-center gap-4 text-slate-500 text-xs">
            <span>Amaya Beach · Mboro Plage (Sénégal)</span>
            <span>·</span>
            <span>Soirée 18+</span>
          </div>
        </div>

      </div>

      {/* Legal Modal Lightbox */}
      {legalModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-white/20 rounded-2xl max-w-lg w-full p-6 text-slate-300 space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-base">
                {legalModal === 'cgv' ? 'Conditions Générales de Vente' : 'Politique de Confidentialité'}
              </h3>
              <button onClick={() => setLegalModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs space-y-2.5 leading-relaxed max-h-80 overflow-y-auto pr-1">
              {legalModal === 'cgv' ? (
                <>
                  <p>1. Les billets achetés sur cette plateforme officielle sont valables pour l'événement Jersey Night Club Party Remix 2026 le samedi 03 octobre 2026 à Amaya Beach.</p>
                  <p>2. Tout billet acheté est ferme et définitif. Chaque billet possède un QR Code unique contrôlé à l'entrée. Tout billet déjà scanné sera refusé.</p>
                  <p>3. Les participants doivent respecter le Dress Code (maillot de football : club, équipe nationale ou rétro) et avoir plus de 18 ans.</p>
                  <p>4. L'organisation décline toute responsabilité en cas de perte de billet ou d'achat auprès d'un revendeur non officiel.</p>
                </>
              ) : (
                <>
                  <p>1. Vos informations (nom, téléphone, email facultatif) sont uniquement collectées dans le cadre de la gestion de votre commande et de l'envoi de vos e-billets.</p>
                  <p>2. Vos numéros de téléphone ne sont jamais revendus ni cédés à des tiers.</p>
                  <p>3. Les transactions financières sont directement gérées par Wave selon les normes de sécurité bancaire en vigueur.</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
