import {
  EventItem,
  TicketType,
  Customer,
  Order,
  Ticket,
  PromoCode,
  CheckIn,
  ProgramItem,
  AppSettings,
  ValidationResult
} from '../types/index.js';

interface DatabaseSchema {
  events: EventItem[];
  ticket_types: TicketType[];
  customers: Customer[];
  orders: Order[];
  tickets: Ticket[];
  promo_codes: PromoCode[];
  check_ins: CheckIn[];
  programs: ProgramItem[];
  settings: AppSettings;
}

const STORAGE_KEY = 'jerseynight_offline_db_v2';

function getInitialStore(): DatabaseSchema {
  const defaultEvent: EventItem = {
    id: 'event-jersey-2026',
    name: 'JERSEY NIGHT CLUB PARTY REMIX',
    edition: '2026',
    date: '2026-10-03',
    time: '20:00',
    location: 'Amaya Beach',
    venue_details: 'Mboro Plage',
    description: 'Une soirée unique et ultra-chic mêlant passion du football, streetwear, DJ sets explosifs et ambiance festive nightclub au bord de la plage.',
    dress_code: 'Venez avec votre maillot préféré : club, équipe nationale ou maillot de football iconique.',
    status: 'ACTIVE',
    capacity: 1000,
    organizers: ['Amaya', 'AJCD Cogne Diola'],
    partners: ['Amaya', 'Wa Cogne Diola', 'Ressortissants de Cogne Diola'],
    poster_url: '/src/assets/images/official_jersey_flyer_1790635512344.jpg',
    reservation_phone: '70717281',
    free_transport_info: [
      'Arrêt car Diamaguene',
      'Station Dabo',
      'Mosquée HLM',
      'Station marché (Lycée pour Cité Mariama)'
    ],
    ladies_free_until: '1h du matin'
  };

  const defaultTicketTypes: TicketType[] = [
    {
      id: 'tt-prevente',
      event_id: 'event-jersey-2026',
      name: 'Ticket Prévente',
      price: 1500,
      original_price: 2000,
      description: 'Accès prioritaire à la soirée Jersey Night Club Party Remix 2026 + navette gratuite.',
      badge: 'PROMO EXCLUSIVE',
      available_quantity: 400,
      sold_quantity: 142,
      max_per_order: 10,
      active: true
    },
    {
      id: 'tt-standard',
      event_id: 'event-jersey-2026',
      name: 'Ticket Standard Jour J',
      price: 2000,
      description: 'Entrée officielle le jour de l’événement à Amaya Beach + navette gratuite.',
      badge: 'POPULAIRE',
      available_quantity: 600,
      sold_quantity: 118,
      max_per_order: 10,
      active: true
    }
  ];

  const defaultPrograms: ProgramItem[] = [
    { id: 'prog-1', event_id: 'event-jersey-2026', time: '20:00', title: 'Ouverture des portes', description: 'Accueil des participants et mise en ambiance musicale chill lounge.', order_index: 1 },
    { id: 'prog-2', event_id: 'event-jersey-2026', time: '21:00', title: 'Warm-up DJ Set', description: 'Montée en température avec les meilleurs hits Afrobeats, Amapiano & Rap.', order_index: 2 },
    { id: 'prog-3', event_id: 'event-jersey-2026', time: '22:00', title: 'Jersey Party & Défilé', description: 'Célébration des plus beaux maillots de football et animations festives.', order_index: 3 },
    { id: 'prog-4', event_id: 'event-jersey-2026', time: '00:00', title: 'Night Club Remix', description: 'Le grand show remix : clubbing, light show, effets néon sur la plage.', order_index: 4 },
    { id: 'prog-5', event_id: 'event-jersey-2026', time: '02:00', title: 'Final / Closing & Beach After', description: 'Session closing mémorable jusqu’au petit matin.', order_index: 5 }
  ];

  const defaultPromoCodes: PromoCode[] = [
    {
      id: 'promo-1',
      code: 'JERSEY10',
      discount_type: 'percent',
      discount_value: 10,
      expiration: '2026-10-04T23:59:59Z',
      usage_limit: 200,
      times_used: 18,
      active: true
    },
    {
      id: 'promo-2',
      code: 'COGNE500',
      discount_type: 'fixed',
      discount_value: 500,
      min_order_amount: 3000,
      expiration: '2026-10-04T23:59:59Z',
      usage_limit: 150,
      times_used: 24,
      active: true
    },
    {
      id: 'promo-3',
      code: 'AMAYA2026',
      discount_type: 'fixed',
      discount_value: 1000,
      min_order_amount: 4000,
      expiration: '2026-10-04T23:59:59Z',
      usage_limit: 50,
      times_used: 12,
      active: true
    }
  ];

  const defaultSettings: AppSettings = {
    wave_link: 'https://pay.wave.com/m/M_sn_lHy4DaHe66Bv/c/sn/',
    wave_merchant_id: 'M_sn_lHy4DaHe66Bv',
    whatsapp_enabled: true,
    whatsapp_phone_number: '+22170717281',
    contact_phone: '70717281',
    contact_email: 'contact@jerseynight.sn',
    currency: 'FCFA'
  };

  const sampleCustomer: Customer = {
    id: 'cust-demo-1',
    full_name: 'Mamadou Diop',
    phone: '77 654 32 10',
    email: 'mamadou.diop@example.com',
    created_at: '2026-09-20T14:32:00Z'
  };

  const sampleOrder: Order = {
    id: 'ord-demo-1',
    order_number: 'JP-2026-00482',
    customer_id: sampleCustomer.id,
    customer: sampleCustomer,
    event_id: 'event-jersey-2026',
    ticket_type_id: 'tt-standard',
    ticket_type_name: 'Ticket Standard Jour J',
    quantity: 3,
    unit_price: 2000,
    subtotal: 6000,
    discount: 0,
    total_amount: 6000,
    payment_method: 'wave',
    payment_status: 'PAID',
    payment_reference: 'WAVE-TX-99214',
    wave_payment_url: defaultSettings.wave_link,
    created_at: '2026-09-20T14:32:00Z',
    paid_at: '2026-09-20T14:35:10Z'
  };

  const sampleTickets: Ticket[] = [
    {
      id: 'tkt-1',
      ticket_number: 'JP-8F72A1',
      order_id: sampleOrder.id,
      order_number: sampleOrder.order_number,
      event_id: 'event-jersey-2026',
      event_name: 'JERSEY NIGHT CLUB PARTY REMIX',
      customer_id: sampleCustomer.id,
      customer_name: 'Mamadou Diop',
      customer_phone: '77 654 32 10',
      qr_token: 'JN-TKN-JP-8F72A1-sample1',
      ticket_type: 'Ticket Standard Jour J',
      price: 2000,
      status: 'VALID',
      created_at: '2026-09-20T14:35:10Z'
    },
    {
      id: 'tkt-2',
      ticket_number: 'JP-8F72A2',
      order_id: sampleOrder.id,
      order_number: sampleOrder.order_number,
      event_id: 'event-jersey-2026',
      event_name: 'JERSEY NIGHT CLUB PARTY REMIX',
      customer_id: sampleCustomer.id,
      customer_name: 'Mamadou Diop',
      customer_phone: '77 654 32 10',
      qr_token: 'JN-TKN-JP-8F72A2-sample2',
      ticket_type: 'Ticket Standard Jour J',
      price: 2000,
      status: 'VALID',
      created_at: '2026-09-20T14:35:10Z'
    },
    {
      id: 'tkt-3',
      ticket_number: 'JP-8F72A3',
      order_id: sampleOrder.id,
      order_number: sampleOrder.order_number,
      event_id: 'event-jersey-2026',
      event_name: 'JERSEY NIGHT CLUB PARTY REMIX',
      customer_id: sampleCustomer.id,
      customer_name: 'Mamadou Diop',
      customer_phone: '77 654 32 10',
      qr_token: 'JN-TKN-JP-8F72A3-sample3',
      ticket_type: 'Ticket Standard Jour J',
      price: 2000,
      status: 'USED',
      used_at: '2026-10-03T20:45:00Z',
      validated_by: 'Contrôleur Entrée Principale',
      created_at: '2026-09-20T14:35:10Z'
    }
  ];

  return {
    events: [defaultEvent],
    ticket_types: defaultTicketTypes,
    customers: [sampleCustomer],
    orders: [sampleOrder],
    tickets: sampleTickets,
    promo_codes: defaultPromoCodes,
    check_ins: [],
    programs: defaultPrograms,
    settings: defaultSettings
  };
}

class ClientStore {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && Array.isArray(parsed.events) && Array.isArray(parsed.ticket_types)) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn('Could not read from localStorage', e);
    }
    const initial = getInitialStore();
    this.save(initial);
    return initial;
  }

  private save(dataToSave?: DatabaseSchema) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave || this.data));
      }
    } catch (e) {
      console.warn('Could not write to localStorage', e);
    }
  }

  getEventData() {
    const event = this.data.events[0] || getInitialStore().events[0];
    return {
      success: true,
      event,
      ticketTypes: this.data.ticket_types.filter(t => t.active),
      programs: [...this.data.programs].sort((a, b) => a.order_index - b.order_index),
      settings: this.data.settings
    };
  }

  validatePromo(code: string, subtotal: number) {
    const clean = (code || '').trim().toUpperCase();
    const promo = this.data.promo_codes.find(p => p.code.toUpperCase() === clean && p.active);

    if (!promo) {
      return { valid: false, discount: 0, finalTotal: subtotal, message: 'Code promo invalide ou inactif.' };
    }

    if (promo.expiration && new Date(promo.expiration) < new Date()) {
      return { valid: false, discount: 0, finalTotal: subtotal, message: 'Ce code promo a expiré.' };
    }

    if (promo.usage_limit && promo.times_used >= promo.usage_limit) {
      return { valid: false, discount: 0, finalTotal: subtotal, message: 'Limite d’utilisation du code promo atteinte.' };
    }

    if (promo.min_order_amount && subtotal < promo.min_order_amount) {
      return { valid: false, discount: 0, finalTotal: subtotal, message: `Montant minimum requis : ${promo.min_order_amount} FCFA.` };
    }

    let discount = 0;
    if (promo.discount_type === 'percent') {
      discount = Math.round((subtotal * promo.discount_value) / 100);
    } else {
      discount = promo.discount_value;
    }
    discount = Math.min(discount, subtotal);
    const finalTotal = Math.max(0, subtotal - discount);

    return { valid: true, discount, finalTotal, message: `Code ${promo.code} appliqué avec succès !`, promo };
  }

  createOrder(input: {
    fullName: string;
    phone: string;
    email?: string;
    ticketTypeId: string;
    quantity: number;
    promoCode?: string;
  }) {
    const ticketType = this.data.ticket_types.find(t => t.id === input.ticketTypeId);
    if (!ticketType) {
      return { success: false, message: 'Catégorie de ticket invalide.' };
    }

    const qty = Math.max(1, Math.min(10, Number(input.quantity) || 1));
    const subtotal = ticketType.price * qty;

    let discount = 0;
    if (input.promoCode) {
      const pRes = this.validatePromo(input.promoCode, subtotal);
      if (pRes.valid) {
        discount = pRes.discount;
      }
    }

    const totalAmount = Math.max(0, subtotal - discount);

    const customerId = `cust-${Date.now()}`;
    const customer: Customer = {
      id: customerId,
      full_name: input.fullName.trim(),
      phone: input.phone.trim(),
      email: input.email ? input.email.trim() : undefined,
      created_at: new Date().toISOString()
    };
    this.data.customers.push(customer);

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `JP-2026-${randomSuffix}`;
    const orderId = `ord-${Date.now()}-${randomSuffix}`;

    const order: Order = {
      id: orderId,
      order_number: orderNumber,
      customer_id: customerId,
      customer,
      event_id: this.data.events[0].id,
      ticket_type_id: ticketType.id,
      ticket_type_name: ticketType.name,
      quantity: qty,
      unit_price: ticketType.price,
      subtotal,
      discount,
      promo_code: input.promoCode,
      total_amount: totalAmount,
      payment_method: 'wave',
      payment_status: 'PENDING',
      wave_payment_url: this.data.settings.wave_link,
      created_at: new Date().toISOString()
    };

    this.data.orders.push(order);
    this.save();

    return { success: true, order, message: 'Commande créée avec succès.' };
  }

  getOrder(orderIdOrNumber: string) {
    const order = this.data.orders.find(o => o.id === orderIdOrNumber || o.order_number === orderIdOrNumber);
    if (!order) return { success: false, message: 'Commande introuvable.' };

    const tickets = this.data.tickets.filter(t => t.order_id === order.id);
    const customer = this.data.customers.find(c => c.id === order.customer_id) || order.customer;

    return { success: true, order: { ...order, customer, tickets }, tickets };
  }

  confirmOrder(orderIdOrNumber: string, reference?: string, _operator = 'Client Confirmation') {
    const order = this.data.orders.find(o => o.id === orderIdOrNumber || o.order_number === orderIdOrNumber);
    if (!order) return { success: false, message: 'Commande introuvable.' };

    order.payment_status = 'PAID';
    order.paid_at = new Date().toISOString();
    if (reference) order.payment_reference = reference;

    const existingTickets = this.data.tickets.filter(t => t.order_id === order.id);
    let createdTickets: Ticket[] = [];

    if (existingTickets.length === 0) {
      const event = this.data.events[0];
      const customer = this.data.customers.find(c => c.id === order.customer_id) || order.customer;

      for (let i = 1; i <= order.quantity; i++) {
        const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
        const ticketNum = `JP-${randomHex}${i}`;
        const token = `JN-TKN-${ticketNum}-${Math.random().toString(36).substring(2, 8)}`;

        const newTicket: Ticket = {
          id: `tkt-${Date.now()}-${i}`,
          ticket_number: ticketNum,
          order_id: order.id,
          order_number: order.order_number,
          event_id: event.id,
          event_name: event.name,
          customer_id: customer?.id || '',
          customer_name: customer?.full_name || 'Participant',
          customer_phone: customer?.phone || '',
          qr_token: token,
          ticket_type: order.ticket_type_name,
          price: order.unit_price,
          status: 'VALID',
          created_at: new Date().toISOString()
        };

        this.data.tickets.push(newTicket);
        createdTickets.push(newTicket);
      }

      // Update sold quantity
      const tt = this.data.ticket_types.find(t => t.id === order.ticket_type_id);
      if (tt) {
        tt.sold_quantity = (tt.sold_quantity || 0) + order.quantity;
      }
    } else {
      createdTickets = existingTickets;
    }

    order.tickets = createdTickets;
    this.save();
    return { success: true, order, tickets: createdTickets, message: 'Paiement confirmé et billets générés !' };
  }

  cancelOrder(orderIdOrNumber: string) {
    const order = this.data.orders.find(o => o.id === orderIdOrNumber || o.order_number === orderIdOrNumber);
    if (!order) return { success: false, message: 'Commande introuvable.' };

    order.payment_status = 'CANCELLED';
    this.save();
    return { success: true, message: 'Commande annulée.' };
  }

  checkInScan(identifier: string, operator: string, method: 'camera' | 'manual' = 'camera'): ValidationResult {
    const clean = (identifier || '').trim();
    let ticket: Ticket | undefined;

    // Try parsing JSON QR or raw token
    try {
      const parsed = JSON.parse(clean);
      if (parsed.t) ticket = this.data.tickets.find(t => t.ticket_number === parsed.t);
      if (!ticket && parsed.qr_token) ticket = this.data.tickets.find(t => t.qr_token === parsed.qr_token);
    } catch {}

    if (!ticket) {
      ticket = this.data.tickets.find(t => 
        t.ticket_number.toUpperCase() === clean.toUpperCase() ||
        t.qr_token.toUpperCase() === clean.toUpperCase() ||
        t.qr_token.includes(clean) ||
        t.id === clean
      );
    }

    const now = new Date().toISOString();

    if (!ticket) {
      return {
        valid: false,
        status: 'INVALID',
        message: 'BILLET INVALIDE : Ce code ou numéro ne correspond à aucun billet officiel enregistré.'
      };
    }

    if (ticket.status === 'CANCELLED') {
      return {
        valid: false,
        status: 'CANCELLED',
        ticket,
        message: 'BILLET ANNULÉ : Cette commande a été annulée.'
      };
    }

    if (ticket.status === 'USED') {
      return {
        valid: false,
        status: 'ALREADY_USED',
        ticket,
        message: 'ATTENTION : Billet DÉJÀ UTILISÉ !',
        used_at: ticket.used_at || now,
        validated_by: ticket.validated_by || operator
      };
    }

    // Mark as USED
    ticket.status = 'USED';
    ticket.used_at = now;
    ticket.validated_by = operator;

    const checkInRecord: CheckIn = {
      id: `ci-${Date.now()}`,
      ticket_id: ticket.id,
      ticket_number: ticket.ticket_number,
      qr_token: ticket.qr_token,
      customer_name: ticket.customer_name,
      ticket_type: ticket.ticket_type,
      scanned_at: now,
      operator,
      method
    };
    this.data.check_ins.unshift(checkInRecord);
    this.save();

    return {
      valid: true,
      status: 'VALID',
      ticket,
      message: 'BILLET VALIDE : Entrée autorisée ! Bienvenue au Jersey Night Club Party Remix 2026 !',
      used_at: now,
      validated_by: operator
    };
  }

  getRecentCheckIns() {
    return { success: true, checkIns: this.data.check_ins.slice(0, 50) };
  }

  getAdminStats() {
    const totalOrders = this.data.orders.length;
    const paidOrders = this.data.orders.filter(o => o.payment_status === 'PAID');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const totalTicketsSold = paidOrders.reduce((sum, o) => sum + (o.quantity || 0), 0);
    const checkedInCount = this.data.tickets.filter(t => t.status === 'USED').length;

    return {
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        paidOrdersCount: paidOrders.length,
        pendingOrdersCount: this.data.orders.filter(o => o.payment_status === 'PENDING').length,
        totalTicketsSold,
        checkedInCount,
        capacity: this.data.events[0]?.capacity || 1000,
        fillingRate: Math.round((totalTicketsSold / (this.data.events[0]?.capacity || 1000)) * 100),
        ticketTypesBreakdown: this.data.ticket_types.map(tt => ({
          name: tt.name,
          sold: tt.sold_quantity || 0,
          revenue: (tt.sold_quantity || 0) * tt.price
        }))
      }
    };
  }

  getAdminOrders(limit = 200) {
    const ordersWithCust = this.data.orders.map(o => {
      const customer = this.data.customers.find(c => c.id === o.customer_id) || o.customer;
      return { ...o, customer };
    }).reverse();
    return { success: true, orders: ordersWithCust.slice(0, limit) };
  }

  getAdminTickets() {
    return { success: true, tickets: this.data.tickets.slice().reverse() };
  }

  getAdminParticipants(query = '') {
    const q = query.toLowerCase();
    const customers = this.data.customers.filter(c => 
      !q ||
      c.full_name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      (c.email && c.email.toLowerCase().includes(q))
    ).reverse();
    return { success: true, customers };
  }

  deleteAdminParticipant(id: string) {
    this.data.customers = this.data.customers.filter(c => c.id !== id);
    this.save();
    return { success: true, message: 'Participant supprimé.' };
  }

  getAdminPromoCodes() {
    return { success: true, promoCodes: this.data.promo_codes };
  }

  createAdminPromoCode(promoData: Partial<PromoCode>) {
    const newPromo: PromoCode = {
      id: `promo-${Date.now()}`,
      code: (promoData.code || 'PROMO').toUpperCase().trim(),
      discount_type: promoData.discount_type || 'percent',
      discount_value: Number(promoData.discount_value) || 10,
      min_order_amount: promoData.min_order_amount,
      expiration: promoData.expiration || '2026-10-04T23:59:59Z',
      usage_limit: promoData.usage_limit || 100,
      times_used: 0,
      active: true
    };
    this.data.promo_codes.push(newPromo);
    this.save();
    return { success: true, promoCode: newPromo, message: 'Code promo créé avec succès.' };
  }

  toggleAdminPromoCode(id: string) {
    const p = this.data.promo_codes.find(item => item.id === id);
    if (!p) return { success: false, message: 'Code introuvable.' };
    p.active = !p.active;
    this.save();
    return { success: true, promoCode: p, message: `Code promo ${p.active ? 'activé' : 'désactivé'}.` };
  }

  updateAdminEvent(patch: Partial<EventItem>) {
    if (this.data.events.length > 0) {
      this.data.events[0] = { ...this.data.events[0], ...patch };
      this.save();
    }
    return { success: true, event: this.data.events[0], message: 'Événement mis à jour avec succès.' };
  }

  updateAdminTicketType(typeId: string, patch: Partial<TicketType>) {
    const tt = this.data.ticket_types.find(t => t.id === typeId);
    if (tt) {
      Object.assign(tt, patch);
      this.save();
      return { success: true, ticketType: tt, message: 'Catégorie mise à jour.' };
    }
    return { success: false, message: 'Catégorie introuvable.' };
  }

  createAdminProgramItem(item: Partial<ProgramItem>) {
    const newItem: ProgramItem = {
      id: `prog-${Date.now()}`,
      event_id: this.data.events[0].id,
      time: item.time || '20:00',
      title: item.title || 'Nouveau point',
      description: item.description || '',
      order_index: item.order_index || (this.data.programs.length + 1)
    };
    this.data.programs.push(newItem);
    this.save();
    return { success: true, item: newItem, message: 'Élément ajouté au programme.' };
  }

  updateAdminProgramItem(id: string, item: Partial<ProgramItem>) {
    const prog = this.data.programs.find(p => p.id === id);
    if (prog) {
      Object.assign(prog, item);
      this.save();
      return { success: true, item: prog, message: 'Programme mis à jour.' };
    }
    return { success: false, message: 'Élément introuvable.' };
  }

  deleteAdminProgramItem(id: string) {
    this.data.programs = this.data.programs.filter(p => p.id !== id);
    this.save();
    return { success: true, message: 'Élément retiré du programme.' };
  }

  updateAdminSettings(patch: Partial<AppSettings>) {
    this.data.settings = { ...this.data.settings, ...patch };
    this.save();
    return { success: true, settings: this.data.settings, message: 'Paramètres mis à jour.' };
  }

  resetSalesData(options?: {
    resetOrders?: boolean;
    resetTickets?: boolean;
    resetParticipants?: boolean;
    resetCheckIns?: boolean;
  }) {
    const deletedOrders = this.data.orders.length;
    const deletedTickets = this.data.tickets.length;
    const deletedCustomers = this.data.customers.length;
    const deletedCheckIns = this.data.check_ins.length;

    const doOrders = options?.resetOrders ?? true;
    const doTickets = options?.resetTickets ?? true;
    const doParticipants = options?.resetParticipants ?? true;
    const doCheckIns = options?.resetCheckIns ?? true;

    if (doOrders) {
      this.data.orders = [];
    }
    if (doTickets) {
      this.data.tickets = [];
      this.data.ticket_types.forEach(tt => {
        tt.sold_quantity = 0;
      });
    }
    if (doParticipants) {
      this.data.customers = [];
    }
    if (doCheckIns) {
      this.data.check_ins = [];
    }
    if (doOrders) {
      this.data.promo_codes.forEach(p => {
        p.times_used = 0;
      });
    }

    this.save();

    return {
      success: true,
      message: 'Commandes, billets et participants réinitialisés avec succès.',
      deletedOrders,
      deletedTickets,
      deletedCustomers,
      deletedCheckIns
    };
  }
}

export const localStore = new ClientStore();
