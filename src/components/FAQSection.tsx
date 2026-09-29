import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';

const faqs = [
  {
    q: "Comment fonctionne le paiement via Wave ?",
    a: "Lors de votre commande, vous serez invité à effectuer le règlement via l'application Wave officielle sur le lien fourni. Votre commande est enregistrée avec un numéro unique (ex: JP-2026-00482). Dès confirmation de votre règlement, vos billets numériques avec QR Code haute sécurité sont immédiatement générés."
  },
  {
    q: "Quand et comment vais-je recevoir mon billet ?",
    a: "Dès que le paiement est confirmé, votre billet électronique officiel s'affiche sur votre écran. Vous pouvez l'imprimer, le sauvegarder en PDF sur votre téléphone ou le recevoir par WhatsApp. Chaque billet dispose d'un identifiant et d'un QR Code unique et infalsifiable."
  },
  {
    q: "Quel maillot dois-je porter pour le Dress Code ?",
    a: "Le mot d'ordre est 'Ton plus beau maillot' ! Vous êtes libre de venir avec le maillot de votre club préféré (PSG, Real Madrid, Barça, Manchester...), le maillot de votre équipe nationale (Sénégal, Brésil...), ou un maillot rétro vintage collector. Accompagnez-le de vos plus belles baskets streetwear."
  },
  {
    q: "L'entrée des femmes est-elle réellement gratuite ?",
    a: "Oui ! Toutes les femmes bénéficient d'une entrée totalement libre et gratuite avant 01h00 du matin à Amaya Beach le samedi 03 octobre 2026."
  },
  {
    q: "Comment fonctionnent les navettes gratuites (Transport Gratuit) ?",
    a: "Des bus sont mis à disposition des participants sans frais supplémentaires depuis 4 points de rassemblement : Arrêt car Diamaguene, Station Dabo, Mosquée HLM, et Station marché (Lycée pour Cité Mariama). Les départs se font avant le début de la soirée et les retours sont organisés en fin de nuit."
  },
  {
    q: "L'événement est-il accessible aux mineurs ?",
    a: "Non, la soirée est strictement réservée aux personnes majeures (18+). Une pièce d'identité pourra être demandée aux entrées."
  }
];

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 bg-[#0c0f18] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 tracking-widest uppercase">
            <HelpCircle className="w-4 h-4" />
            <span>Questions Fréquentes</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white uppercase font-display tracking-tight">
            Tout Ce Que Vous Devez Savoir
          </h2>
          <p className="text-slate-400 text-sm">
            Retrouvez toutes les réponses concernant la billetterie, l'accès à Amaya Beach et le déroulement de la nuit.
          </p>
        </div>

        {/* Accordions */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-white/10 bg-[#121726]/80 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-white hover:text-purple-300 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-purple-400 transition-transform duration-300 flex-shrink-0 ${
                      isOpen ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-slate-300 leading-relaxed border-t border-white/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
