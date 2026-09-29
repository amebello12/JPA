import React, { useState } from 'react';
import { 
  Ticket as TicketIcon, 
  Menu, 
  X, 
  QrCode, 
  Shield, 
  Sun, 
  Moon, 
  Phone,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  onOpenBooking: () => void;
  onOpenScanner: () => void;
  onOpenAdmin?: () => void;
  showAdminButton?: boolean;
  darkMode: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenBooking,
  onOpenScanner,
  onOpenAdmin,
  showAdminButton = false,
  darkMode,
  onToggleTheme
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#08090D]/85 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo / Brand */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-amber-400 p-[2px] transition-transform duration-300 group-hover:scale-105">
              <div className="w-full h-full bg-[#08090D] rounded-[10px] flex items-center justify-center">
                <span className="font-extrabold text-lg tracking-tighter text-white">JN</span>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-wider text-white">JERSEY NIGHT</span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-500/30">REMIX</span>
              </div>
              <span className="text-[11px] text-amber-400 font-medium tracking-wide">AMAYA BEACH · 03 OCT 2026</span>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <button onClick={() => scrollTo('accueil')} className="hover:text-purple-400 transition-colors">Accueil</button>
            <button onClick={() => scrollTo('evenement')} className="hover:text-purple-400 transition-colors">L’Événement</button>
            <button onClick={() => scrollTo('billetterie')} className="hover:text-purple-400 transition-colors">Billetterie</button>
            <button onClick={() => scrollTo('programme')} className="hover:text-purple-400 transition-colors">Programme</button>
            <button onClick={() => scrollTo('transports')} className="hover:text-purple-400 transition-colors">Navettes</button>
            <button onClick={() => scrollTo('faq')} className="hover:text-purple-400 transition-colors">FAQ</button>
          </nav>

          {/* Actions */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              title={darkMode ? "Passer en mode clair" : "Passer en mode sombre"}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-400" />}
            </button>

            {/* Door Control / Scanner button */}
            <button
              onClick={onOpenScanner}
              title="Scanner les billets (Contrôle Entrée)"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors"
            >
              <QrCode className="w-3.5 h-3.5 text-purple-400" />
              <span>Scanner</span>
            </button>

            {/* Admin button (hidden from public visitors, visible only when organizer unlocks it) */}
            {showAdminButton && onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                title="Espace Organisateur (Déverrouillé)"
                className="p-2 text-amber-400 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 rounded-lg border border-amber-500/30 transition-colors animate-fadeIn"
              >
                <Shield className="w-4 h-4" />
              </button>
            )}

            {/* Primary CTA */}
            <button
              onClick={onOpenBooking}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 shadow-lg shadow-purple-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <TicketIcon className="w-4 h-4 text-amber-300" />
              <span>Acheter mon ticket</span>
            </button>
          </div>

          {/* Mobile hamburger */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={onOpenScanner}
              className="p-2 rounded-lg text-purple-400 bg-purple-950/40 border border-purple-800/40"
              title="Scanner"
            >
              <QrCode className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-200 hover:bg-white/5 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-white/10 bg-[#0c0d14] px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-3 text-sm font-medium text-slate-200">
            <button onClick={() => scrollTo('accueil')} className="text-left py-2 hover:text-purple-400">Accueil</button>
            <button onClick={() => scrollTo('evenement')} className="text-left py-2 hover:text-purple-400">L’Événement</button>
            <button onClick={() => scrollTo('billetterie')} className="text-left py-2 hover:text-purple-400">Billetterie (Dès 1 500 F)</button>
            <button onClick={() => scrollTo('programme')} className="text-left py-2 hover:text-purple-400">Programme de la Soirée</button>
            <button onClick={() => scrollTo('transports')} className="text-left py-2 hover:text-purple-400">Navettes Gratuites</button>
            <button onClick={() => scrollTo('faq')} className="text-left py-2 hover:text-purple-400">FAQ & Informations</button>
          </nav>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking();
              }}
              className="w-full py-3 rounded-xl font-bold text-center text-sm uppercase tracking-wider text-white bg-gradient-to-r from-purple-600 to-indigo-600 shadow-md shadow-purple-600/30"
            >
              Acheter mon ticket (Dès 1 500 FCFA)
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenScanner();
                }}
                className="flex-1 py-2.5 px-3 rounded-lg text-xs font-medium text-center bg-white/5 border border-white/10 text-slate-300 flex items-center justify-center gap-1.5"
              >
                <QrCode className="w-4 h-4 text-purple-400" />
                Contrôle Entrée
              </button>
              {showAdminButton && onOpenAdmin && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className="py-2.5 px-3 rounded-lg text-xs font-medium text-center bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center gap-1.5 animate-fadeIn"
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
