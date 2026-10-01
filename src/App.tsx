/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Header } from './components/Header.js';
import { HeroSection } from './components/HeroSection.js';
import { CountdownSection } from './components/CountdownSection.js';
import { EventDetailsSection } from './components/EventDetailsSection.js';
import { ProgramSection } from './components/ProgramSection.js';
import { TicketingSection } from './components/TicketingSection.js';
import { FAQSection } from './components/FAQSection.js';
import { Footer } from './components/Footer.js';
import { api } from './services/api.js';
import { EventItem, TicketType, ProgramItem, Order, Ticket } from './types/index.js';
import { Ticket as TicketIcon, Search, QrCode } from 'lucide-react';

// Lazy-load heavy modals on demand to drastically speed up initial page loading
const BookingModal = lazy(() => import('./components/BookingModal.js').then(m => ({ default: m.BookingModal })));
const DigitalTicketView = lazy(() => import('./components/DigitalTicketView.js').then(m => ({ default: m.DigitalTicketView })));
const ScannerModal = lazy(() => import('./components/ScannerModal.js').then(m => ({ default: m.ScannerModal })));
const AdminModal = lazy(() => import('./components/AdminModal.js').then(m => ({ default: m.AdminModal })));

const DEFAULT_EVENT: EventItem = {
  id: 'event-jersey-2026',
  name: 'JERSEY PARTY',
  edition: 'REMIX 2026',
  slogan: '« Venez avec votre maillot… Repartez avec des souvenirs inoubliables. »',
  date: '2026-10-03',
  time: '20h00',
  location: 'Amaya Beach',
  venue_details: 'Mboro Plage',
  organizers: ['Amaya', 'AJCD Cogne Diola'],
  partners: ['Wave', 'X-Press Mboro', 'Radio Mboro FM', 'Sound System Senegal'],
  poster_url: '/src/assets/images/official_jersey_flyer_1790635512344.jpg',
  hero_bg_url: '/src/assets/images/beach_nightclub_hero_1790634663007.jpg',
  crowd_img_url: '/src/assets/images/jersey_crowd_vibe_1790634672721.jpg',
  description: 'La plus grande soirée maillot de football du Sénégal ! Venez vêtus de votre maillot préféré et profitez d’un line-up de DJ exclusifs, d’un sound system haute puissance, et d’un show lumière spectaculaire face à l’océan.',
  dress_code: 'Maillot de club (Real Madrid, PSG, Barça...), équipe nationale (Sénégal...), maillot rétro collector vintage ou streetwear assorti.',
  reservation_phone: '70717281',
  free_transport_info: [
    'Arrêt car Diamaguene',
    'Station Dabo',
    'Mosquée HLM',
    'Station marché Mboro'
  ],
  ladies_free_until: '01h00 du matin',
  capacity: 1200,
  status: 'ACTIVE'
};

const DEFAULT_TICKET_TYPES: TicketType[] = [
  {
    id: 'tt-prevente',
    event_id: 'event-jersey-2026',
    name: 'Ticket Prévente',
    price: 1500,
    original_price: 2000,
    badge: 'RECOMMANDÉ',
    available_quantity: 600,
    sold_quantity: 142,
    max_per_order: 10,
    description: 'Accès coupe-file à la soirée + Navette aller/retour gratuite incluse.',
    active: true
  },
  {
    id: 'tt-jourj',
    event_id: 'event-jersey-2026',
    name: 'Ticket Standard Jour J',
    price: 2000,
    badge: 'SUR PLACE',
    available_quantity: 400,
    sold_quantity: 38,
    max_per_order: 10,
    description: 'Accès général à la soirée Amaya Beach + Navettes gratuites.',
    active: true
  }
];

const DEFAULT_PROGRAMS: ProgramItem[] = [
  {
    id: 'prog-1',
    event_id: 'event-jersey-2026',
    time: '20h00 - 22h00',
    title: 'Accueil & Navettes gratuites',
    description: 'Mise en place des navettes de ramassage. Arrivée des premiers festivaliers et ambiance lounge.',
    order_index: 1
  },
  {
    id: 'prog-2',
    event_id: 'event-jersey-2026',
    time: '22h00 - 01h00',
    title: 'Warm-up & Privilège Femme Libre',
    description: 'Entrée gratuite pour toutes les dames arrivant avant 01h00 ! Début des sets Afrobeat & Jersey Club.',
    order_index: 2
  },
  {
    id: 'prog-3',
    event_id: 'event-jersey-2026',
    time: '01h00 - 03h30',
    title: 'Jersey Parade & Battle DJ Remix',
    description: 'Le climax de la soirée ! Présentation des plus beaux maillots, surprises et mix explosifs.',
    order_index: 3
  },
  {
    id: 'prog-4',
    event_id: 'event-jersey-2026',
    time: '03h30 - 05h00',
    title: 'Beach Party After & Clôture',
    description: 'Dernière vague musicale face à l’océan et navettes retours sécurisées.',
    order_index: 4
  }
];

const getInitialEvent = (): EventItem => {
  try {
    const cached = localStorage.getItem('cached_jn_event');
    if (cached) return JSON.parse(cached);
  } catch (e) {}
  return DEFAULT_EVENT;
};

const getInitialTickets = (): TicketType[] => {
  try {
    const cached = localStorage.getItem('cached_jn_tickets');
    if (cached) return JSON.parse(cached);
  } catch (e) {}
  return DEFAULT_TICKET_TYPES;
};

const getInitialPrograms = (): ProgramItem[] => {
  try {
    const cached = localStorage.getItem('cached_jn_programs');
    if (cached) return JSON.parse(cached);
  } catch (e) {}
  return DEFAULT_PROGRAMS;
};

export default function App() {
  const [eventData, setEventData] = useState<EventItem>(getInitialEvent);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>(getInitialTickets);
  const [programs, setPrograms] = useState<ProgramItem[]>(getInitialPrograms);
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Modals state
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [selectedTicketType, setSelectedTicketType] = useState<TicketType | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    try {
      return localStorage.getItem('jn_admin_unlocked') === 'true';
    } catch {
      return false;
    }
  });

  const unlockAndOpenAdmin = () => {
    setIsAdminUnlocked(true);
    setIsAdminOpen(true);
    try {
      localStorage.setItem('jn_admin_unlocked', 'true');
    } catch {}
  };

  const lockAdminAccess = () => {
    setIsAdminUnlocked(false);
    setIsAdminOpen(false);
    try {
      localStorage.removeItem('jn_admin_unlocked');
    } catch {}
  };

  // Digital Ticket view state (when an order is created & confirmed)
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [confirmedTickets, setConfirmedTickets] = useState<Ticket[]>([]);
  const [isTicketViewOpen, setIsTicketViewOpen] = useState<boolean>(false);

  // Quick order search bar
  const [searchOrderNumber, setSearchOrderNumber] = useState<string>('');
  const [isSearchingOrder, setIsSearchingOrder] = useState<boolean>(false);

  // Fetch Event Data from Central Database (Cross-device synchronized)
  const fetchData = async () => {
    try {
      const data = await api.getEventData();
      if (data && data.success && data.event) {
        setEventData(prev => {
          // Only update if changed to avoid unnecessary re-renders
          if (JSON.stringify(prev) !== JSON.stringify(data.event)) {
            return data.event;
          }
          return prev;
        });

        if (data.ticketTypes) {
          setTicketTypes(prev => {
            if (JSON.stringify(prev) !== JSON.stringify(data.ticketTypes)) {
              return data.ticketTypes;
            }
            return prev;
          });
        }

        if (data.programs) {
          setPrograms(prev => {
            if (JSON.stringify(prev) !== JSON.stringify(data.programs)) {
              return data.programs;
            }
            return prev;
          });
        }

        try {
          localStorage.setItem('cached_jn_event', JSON.stringify(data.event));
          if (data.ticketTypes) localStorage.setItem('cached_jn_tickets', JSON.stringify(data.ticketTypes));
          if (data.programs) localStorage.setItem('cached_jn_programs', JSON.stringify(data.programs));
        } catch (e) {}
      }
    } catch (err) {
      console.error('Error fetching event data', err);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Listen to local admin update events
    const handleEventUpdated = (e: any) => {
      if (e?.detail) {
        setEventData(e.detail);
      }
      fetchData();
    };

    // Cross-tab broadcast channel
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        channel = new BroadcastChannel('jerseynight_sync_channel');
        channel.onmessage = () => {
          fetchData();
        };
      }
    } catch {}

    // Live continuous sync across different phones and devices (every 5 seconds)
    const liveSyncInterval = setInterval(() => {
      fetchData();
    }, 5000);

    // Refresh immediately when returning to tab or unlocking phone
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchData();
      }
    };

    window.addEventListener('jn_event_updated', handleEventUpdated);
    window.addEventListener('focus', fetchData);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(liveSyncInterval);
      window.removeEventListener('jn_event_updated', handleEventUpdated);
      window.removeEventListener('focus', fetchData);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (channel) {
        try {
          channel.close();
        } catch {}
      }
    };
  }, []);

  // Listen for admin triggers: URL hash (#admin, #organisateur), query param (?admin), Alt+A shortcut
  useEffect(() => {
    const checkAdminTrigger = () => {
      const hash = window.location.hash.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      if (
        hash === '#admin' || 
        hash === '#organisateur' || 
        hash === '#ajcd' || 
        params.has('admin') || 
        params.has('manage')
      ) {
        unlockAndOpenAdmin();
      }
    };

    checkAdminTrigger();
    window.addEventListener('hashchange', checkAdminTrigger);

    // Keyboard shortcut: Alt + A or Ctrl + Shift + A
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && e.key.toLowerCase() === 'a') || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a')) {
        e.preventDefault();
        unlockAndOpenAdmin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', checkAdminTrigger);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Open direct ticket view if ?order= or ?ticket= is present in URL (e.g. from WhatsApp)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderQuery = params.get('order') || params.get('ticket');
    if (orderQuery) {
      api.getOrder(orderQuery.trim()).then((res) => {
        if (res.success && res.order) {
          setConfirmedOrder(res.order);
          setConfirmedTickets(res.order.tickets || []);
          setIsTicketViewOpen(true);
        }
      }).catch(err => console.error('Error opening ticket from URL param', err));
    }
  }, []);

  // Theme effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleOpenBooking = (ticketType?: TicketType) => {
    setSelectedTicketType(ticketType || null);
    setIsBookingOpen(true);
  };

  const handleOrderSuccess = (order: Order, tickets: Ticket[]) => {
    setConfirmedOrder(order);
    setConfirmedTickets(tickets);
    setIsBookingOpen(false);
    setIsTicketViewOpen(true);
  };

  // Lookup existing order to view tickets
  const handleLookupOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchOrderNumber.trim()) return;
    setIsSearchingOrder(true);
    try {
      const res = await api.getOrder(searchOrderNumber.trim());
      if (res.success && res.order) {
        setConfirmedOrder(res.order);
        setConfirmedTickets(res.order.tickets || []);
        setIsTicketViewOpen(true);
        setSearchOrderNumber('');
      } else {
        alert(res.message || 'Aucune commande trouvée avec ce numéro ou numéro de téléphone.');
      }
    } catch (err) {
      alert('Erreur lors de la recherche de la commande.');
    } finally {
      setIsSearchingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090D] text-slate-100 flex flex-col selection:bg-purple-600 selection:text-white">
      
      {/* Global Sticky Header */}
      <Header
        onOpenBooking={() => handleOpenBooking()}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenAdmin={unlockAndOpenAdmin}
        showAdminButton={isAdminUnlocked}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode(!darkMode)}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection
          event={eventData}
          onOpenBooking={() => handleOpenBooking()}
        />

        {/* Real-Time Countdown to event date */}
        <CountdownSection targetDateStr={eventData.date ? `${eventData.date}T${eventData.time || '20:00'}:00Z` : '2026-10-03T20:00:00Z'} />

        {/* Event Concept, Dress Code & Perks */}
        <EventDetailsSection
          event={eventData}
          onOpenBooking={() => handleOpenBooking()}
        />

        {/* Official Nightclub Program / DJ Sets */}
        <ProgramSection programs={programs} />

        {/* Ticketing Pricing & Reservation Cards */}
        <TicketingSection
          ticketTypes={ticketTypes}
          onSelectTicket={handleOpenBooking}
        />

        {/* Quick Ticket Retrieval Section for Existing Buyers */}
        <section className="py-12 bg-[#0a0d17] border-y border-white/5">
          <div className="max-w-3xl mx-auto px-4 text-center space-y-4">
            <h3 className="text-lg sm:text-xl font-bold text-white font-display uppercase tracking-wide">
              Déjà en possession d'un billet ?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Retrouvez et affichez instantanément votre QR Code à l'aide de votre numéro de commande (ex: JP-2026-00482) :
            </p>
            <form onSubmit={handleLookupOrder} className="flex max-w-md mx-auto gap-2">
              <input
                type="text"
                placeholder="Numéro de commande (ex: JP-2026-00482)"
                value={searchOrderNumber}
                onChange={e => setSearchOrderNumber(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 text-white text-xs font-mono outline-none"
              />
              <button
                type="submit"
                disabled={isSearchingOrder || !searchOrderNumber.trim()}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase disabled:opacity-40 flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Rechercher</span>
              </button>
            </form>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection />
      </main>

      {/* Footer */}
      <Footer
        onOpenBooking={() => handleOpenBooking()}
        reservationPhone={eventData.reservation_phone}
        onOpenAdmin={unlockAndOpenAdmin}
      />

      {/* Floating Mobile Sticky CTA */}
      <div className="sm:hidden fixed bottom-3 inset-x-3 z-30 flex gap-2">
        <button
          onClick={() => handleOpenBooking()}
          className="flex-1 py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider text-white bg-gradient-to-r from-purple-600 to-indigo-600 shadow-xl shadow-purple-600/40 flex items-center justify-center gap-2 border border-purple-400/30"
        >
          <TicketIcon className="w-4 h-4 text-amber-300" />
          <span>Acheter mon ticket (Dès 1 500 F)</span>
        </button>
        <button
          onClick={() => setIsScannerOpen(true)}
          className="p-3.5 rounded-2xl bg-[#111827] border border-white/20 text-purple-400 shadow-lg flex items-center justify-center"
          title="Scanner"
        >
          <QrCode className="w-5 h-5" />
        </button>
      </div>

      {/* LAZY LOADED MODALS (Loaded on-demand to keep site ultra fast) */}
      <Suspense fallback={null}>
        {isBookingOpen && (
          <BookingModal
            isOpen={isBookingOpen}
            onClose={() => setIsBookingOpen(false)}
            ticketTypes={ticketTypes}
            initialSelectedType={selectedTicketType}
            onOrderSuccess={handleOrderSuccess}
          />
        )}

        {isTicketViewOpen && confirmedOrder && confirmedTickets.length > 0 && (
          <DigitalTicketView
            order={confirmedOrder}
            tickets={confirmedTickets}
            onClose={() => setIsTicketViewOpen(false)}
          />
        )}

        {isScannerOpen && (
          <ScannerModal
            isOpen={isScannerOpen}
            onClose={() => setIsScannerOpen(false)}
          />
        )}

        {isAdminOpen && (
          <AdminModal
            isOpen={isAdminOpen}
            onClose={() => {
              setIsAdminOpen(false);
              fetchData();
            }}
            onOpenScanner={() => setIsScannerOpen(true)}
            onDataUpdated={fetchData}
            onLockAccess={lockAdminAccess}
          />
        )}
      </Suspense>

    </div>
  );
}
