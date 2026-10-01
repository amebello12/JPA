import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
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
  admin_sessions: Record<string, { username: string; expires_at: number }>;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'jerseynight.json');

function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function getInitialData(): DatabaseSchema {
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

  // Seed sample initial customers & paid orders
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
      event_id: defaultEvent.id,
      event_name: defaultEvent.name,
      customer_id: sampleCustomer.id,
      customer_name: sampleCustomer.full_name,
      customer_phone: sampleCustomer.phone,
      qr_token: 'JN-TOKEN-8F72A1-9042',
      ticket_type: 'Ticket Standard Jour J',
      price: 2000,
      status: 'VALID',
      created_at: '2026-09-20T14:35:10Z'
    },
    {
      id: 'tkt-2',
      ticket_number: 'JP-4C91B7',
      order_id: sampleOrder.id,
      order_number: sampleOrder.order_number,
      event_id: defaultEvent.id,
      event_name: defaultEvent.name,
      customer_id: sampleCustomer.id,
      customer_name: sampleCustomer.full_name,
      customer_phone: sampleCustomer.phone,
      qr_token: 'JN-TOKEN-4C91B7-1123',
      ticket_type: 'Ticket Standard Jour J',
      price: 2000,
      status: 'USED',
      used_at: '2026-09-21T21:15:00Z',
      validated_by: 'Moussa Sène (Scanner 01)',
      created_at: '2026-09-20T14:35:10Z'
    },
    {
      id: 'tkt-3',
      ticket_number: 'JP-6D28E3',
      order_id: sampleOrder.id,
      order_number: sampleOrder.order_number,
      event_id: defaultEvent.id,
      event_name: defaultEvent.name,
      customer_id: sampleCustomer.id,
      customer_name: sampleCustomer.full_name,
      customer_phone: sampleCustomer.phone,
      qr_token: 'JN-TOKEN-6D28E3-7741',
      ticket_type: 'Ticket Standard Jour J',
      price: 2000,
      status: 'VALID',
      created_at: '2026-09-20T14:35:10Z'
    }
  ];

  const sampleCheckIn: CheckIn = {
    id: 'chk-1',
    ticket_id: 'tkt-2',
    ticket_number: 'JP-4C91B7',
    qr_token: 'JN-TOKEN-4C91B7-1123',
    customer_name: 'Mamadou Diop',
    ticket_type: 'Ticket Standard Jour J',
    scanned_at: '2026-09-21T21:15:00Z',
    operator: 'Moussa Sène (Scanner 01)',
    method: 'camera'
  };

  sampleOrder.tickets = sampleTickets;

  return {
    events: [defaultEvent],
    ticket_types: defaultTicketTypes,
    customers: [sampleCustomer],
    orders: [sampleOrder],
    tickets: sampleTickets,
    promo_codes: defaultPromoCodes,
    check_ins: [sampleCheckIn],
    programs: defaultPrograms,
    settings: defaultSettings,
    admin_sessions: {}
  };
}

class CentralDatabase {
  private data: DatabaseSchema;

  constructor() {
    ensureDirectoryExists(DATA_DIR);
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          ...getInitialData(),
          ...parsed
        };
      }
    } catch (err) {
      console.error('Error reading db.json, initializing fresh data', err);
    }
    const initial = getInitialData();
    this.saveDirect(initial);
    return initial;
  }

  private saveDirect(payload: DatabaseSchema) {
    try {
      ensureDirectoryExists(DATA_DIR);
      const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tmpFile, JSON.stringify(payload, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('Error writing to db.json', err);
    }
  }

  private persist() {
    this.saveDirect(this.data);
  }

  // --- EVENTS ---
  getEvents(): EventItem[] {
    return this.data.events;
  }

  getActiveEvent(): EventItem {
    const ev = this.data.events.find(e => e.status === 'ACTIVE');
    return ev || this.data.events[0];
  }

  updateEvent(eventId: string, patch: Partial<EventItem>): EventItem | null {
    let idx = this.data.events.findIndex(e => e.id === eventId);
    if (idx === -1 && this.data.events.length > 0) {
      idx = 0; // Fallback to primary active event
    }
    if (idx === -1) return null;

    // Helper to decode base64 images and save as local files
    const saveBase64Image = (dataUrl: string, prefix: string): string => {
      try {
        const match = dataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
        if (match) {
          const rawExt = match[1].toLowerCase();
          const ext = rawExt === 'jpeg' ? 'jpg' : rawExt;
          const base64Data = match[2];
          const fileName = `${prefix}_${Date.now()}.${ext}`;
          const targetDir = path.resolve(process.cwd(), 'src/assets/images');
          ensureDirectoryExists(targetDir);
          fs.writeFileSync(path.join(targetDir, fileName), Buffer.from(base64Data, 'base64'));
          return `/src/assets/images/${fileName}`;
        }
      } catch (err) {
        console.error(`Failed to save base64 image (${prefix}) to disk:`, err);
      }
      return dataUrl;
    };

    const cleanPatch = { ...patch };
    if (cleanPatch.poster_url && cleanPatch.poster_url.startsWith('data:image/')) {
      cleanPatch.poster_url = saveBase64Image(cleanPatch.poster_url, 'official_poster');
    }
    if (cleanPatch.hero_bg_url && cleanPatch.hero_bg_url.startsWith('data:image/')) {
      cleanPatch.hero_bg_url = saveBase64Image(cleanPatch.hero_bg_url, 'hero_bg');
    }
    if (cleanPatch.crowd_img_url && cleanPatch.crowd_img_url.startsWith('data:image/')) {
      cleanPatch.crowd_img_url = saveBase64Image(cleanPatch.crowd_img_url, 'crowd_ambiance');
    }

    this.data.events[idx] = { ...this.data.events[idx], ...cleanPatch };
    this.persist();
    return this.data.events[idx];
  }

  createEvent(event: Omit<EventItem, 'id'>): EventItem {
    const newEvent: EventItem = {
      ...event,
      id: `event-${Date.now()}`
    };
    this.data.events.push(newEvent);
    this.persist();
    return newEvent;
  }

  // --- TICKET TYPES ---
  getTicketTypes(eventId?: string): TicketType[] {
    if (eventId) {
      return this.data.ticket_types.filter(tt => tt.event_id === eventId);
    }
    return this.data.ticket_types;
  }

  updateTicketType(id: string, patch: Partial<TicketType>): TicketType | null {
    const idx = this.data.ticket_types.findIndex(t => t.id === id);
    if (idx === -1) return null;
    this.data.ticket_types[idx] = { ...this.data.ticket_types[idx], ...patch };
    this.persist();
    return this.data.ticket_types[idx];
  }

  createTicketType(ticketType: Omit<TicketType, 'id' | 'sold_quantity'>): TicketType {
    const newType: TicketType = {
      ...ticketType,
      id: `tt-${Date.now()}`,
      sold_quantity: 0
    };
    this.data.ticket_types.push(newType);
    this.persist();
    return newType;
  }

  // --- PROGRAM ---
  getPrograms(eventId?: string): ProgramItem[] {
    const targetEvent = eventId || this.getActiveEvent().id;
    return this.data.programs
      .filter(p => p.event_id === targetEvent)
      .sort((a, b) => a.order_index - b.order_index);
  }

  updateProgram(id: string, patch: Partial<ProgramItem>): ProgramItem | null {
    const idx = this.data.programs.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.data.programs[idx] = { ...this.data.programs[idx], ...patch };
    this.persist();
    return this.data.programs[idx];
  }

  createProgramItem(item: Omit<ProgramItem, 'id'>): ProgramItem {
    const newItem: ProgramItem = {
      ...item,
      id: `prog-${Date.now()}`
    };
    this.data.programs.push(newItem);
    this.persist();
    return newItem;
  }

  deleteProgramItem(id: string): boolean {
    const idx = this.data.programs.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.data.programs.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- PROMO CODES ---
  getPromoCodes(): PromoCode[] {
    return this.data.promo_codes;
  }

  validatePromoCode(rawCode: string, subtotal: number): { valid: boolean; discount: number; finalTotal: number; message: string; promo?: PromoCode } {
    const code = rawCode.trim().toUpperCase();
    const promo = this.data.promo_codes.find(p => p.code.toUpperCase() === code);

    if (!promo) {
      return { valid: false, discount: 0, finalTotal: subtotal, message: 'Code promo invalide' };
    }

    if (!promo.active) {
      return { valid: false, discount: 0, finalTotal: subtotal, message: 'Code promo désactivé' };
    }

    if (promo.expiration && new Date(promo.expiration).getTime() < Date.now()) {
      return { valid: false, discount: 0, finalTotal: subtotal, message: 'Code promo expiré' };
    }

    if (promo.usage_limit && promo.times_used >= promo.usage_limit) {
      return { valid: false, discount: 0, finalTotal: subtotal, message: 'Code promo épuisé' };
    }

    if (promo.min_order_amount && subtotal < promo.min_order_amount) {
      return {
        valid: false,
        discount: 0,
        finalTotal: subtotal,
        message: `Montant minimum requis : ${promo.min_order_amount.toLocaleString('fr-FR')} FCFA`
      };
    }

    let discount = 0;
    if (promo.discount_type === 'percent') {
      discount = Math.round((subtotal * promo.discount_value) / 100);
    } else {
      discount = Math.min(promo.discount_value, subtotal);
    }

    const finalTotal = Math.max(0, subtotal - discount);

    return {
      valid: true,
      discount,
      finalTotal,
      message: 'Code promo appliqué avec succès',
      promo
    };
  }

  createPromoCode(codeData: Omit<PromoCode, 'id' | 'times_used'>): PromoCode {
    const newPromo: PromoCode = {
      ...codeData,
      id: `promo-${Date.now()}`,
      code: codeData.code.trim().toUpperCase(),
      times_used: 0
    };
    this.data.promo_codes.push(newPromo);
    this.persist();
    return newPromo;
  }

  togglePromoCode(id: string): PromoCode | null {
    const promo = this.data.promo_codes.find(p => p.id === id);
    if (!promo) return null;
    promo.active = !promo.active;
    this.persist();
    return promo;
  }

  // --- ORDERS ---
  getOrders(limit = 100): Order[] {
    return [...this.data.orders]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  }

  getOrderById(id: string): Order | null {
    const order = this.data.orders.find(o => o.id === id || o.order_number === id);
    if (!order) return null;
    // Enrich with tickets and customer
    const tickets = this.data.tickets.filter(t => t.order_id === order.id);
    const customer = this.data.customers.find(c => c.id === order.customer_id);
    return { ...order, customer, tickets };
  }

  createOrder(payload: {
    fullName: string;
    phone: string;
    email?: string;
    ticketTypeId: string;
    quantity: number;
    promoCode?: string;
  }): { success: boolean; order?: Order; message?: string } {
    const { fullName, phone, email, ticketTypeId, quantity, promoCode } = payload;

    if (!fullName || !phone) {
      return { success: false, message: 'Le nom et le téléphone sont obligatoires.' };
    }

    if (quantity < 1) {
      return { success: false, message: 'La quantité doit être supérieure à 0.' };
    }

    const ticketType = this.data.ticket_types.find(tt => tt.id === ticketTypeId);
    if (!ticketType) {
      return { success: false, message: 'Type de billet introuvable.' };
    }

    if (!ticketType.active) {
      return { success: false, message: 'Ce type de billet n’est plus disponible.' };
    }

    if (ticketType.available_quantity - ticketType.sold_quantity < quantity) {
      return { success: false, message: 'Quantité disponible insuffisante.' };
    }

    // Check or create customer
    let customer = this.data.customers.find(c => c.phone.replace(/\s+/g, '') === phone.replace(/\s+/g, ''));
    if (!customer) {
      customer = {
        id: `cust-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        full_name: fullName.trim(),
        phone: phone.trim(),
        email: email?.trim(),
        created_at: new Date().toISOString()
      };
      this.data.customers.push(customer);
    } else {
      customer.full_name = fullName.trim();
      if (email) customer.email = email.trim();
    }

    const subtotal = ticketType.price * quantity;
    let discount = 0;
    let appliedPromo: string | undefined = undefined;

    if (promoCode) {
      const promoCheck = this.validatePromoCode(promoCode, subtotal);
      if (promoCheck.valid) {
        discount = promoCheck.discount;
        appliedPromo = promoCheck.promo?.code;
      }
    }

    const totalAmount = Math.max(0, subtotal - discount);

    // Generate unique order number: JP-2026-XXXXX
    const randomHex = Math.floor(10000 + Math.random() * 90000).toString();
    const orderNumber = `JP-2026-${randomHex}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      order_number: orderNumber,
      customer_id: customer.id,
      customer,
      event_id: ticketType.event_id,
      ticket_type_id: ticketType.id,
      ticket_type_name: ticketType.name,
      quantity,
      unit_price: ticketType.price,
      subtotal,
      discount,
      total_amount: totalAmount,
      promo_code: appliedPromo,
      payment_method: 'wave',
      payment_status: 'PENDING',
      wave_payment_url: this.data.settings.wave_link,
      created_at: new Date().toISOString()
    };

    this.data.orders.push(newOrder);
    this.persist();

    return { success: true, order: newOrder };
  }

  confirmPayment(orderIdOrNumber: string, reference?: string, operator?: string): { success: boolean; order?: Order; tickets?: Ticket[]; message: string } {
    const order = this.data.orders.find(o => o.id === orderIdOrNumber || o.order_number === orderIdOrNumber);
    if (!order) {
      return { success: false, message: 'Commande introuvable.' };
    }

    if (order.payment_status === 'PAID') {
      const existingTickets = this.data.tickets.filter(t => t.order_id === order.id);
      return { success: true, order, tickets: existingTickets, message: 'Commande déjà confirmée et payée.' };
    }

    // Atomic update to PAID
    order.payment_status = 'PAID';
    order.paid_at = new Date().toISOString();
    order.payment_reference = reference || `WAVE-REF-${Date.now().toString(36).toUpperCase()}`;

    // Update ticket type sold count
    const tt = this.data.ticket_types.find(t => t.id === order.ticket_type_id);
    if (tt) {
      tt.sold_quantity += order.quantity;
    }

    // Update promo usage
    if (order.promo_code) {
      const p = this.data.promo_codes.find(promo => promo.code.toUpperCase() === order.promo_code?.toUpperCase());
      if (p) {
        p.times_used += 1;
      }
    }

    // Generate individual tickets with unique tokens and numbers
    const customer = this.data.customers.find(c => c.id === order.customer_id);
    const event = this.data.events.find(e => e.id === order.event_id) || this.getActiveEvent();
    const generatedTickets: Ticket[] = [];

    for (let i = 0; i < order.quantity; i++) {
      const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
      const ticketNumber = `JP-${randomSuffix}`;
      const secureToken = `JN-TKN-${ticketNumber}-${crypto.randomBytes(4).toString('hex')}`;

      const ticket: Ticket = {
        id: `tkt-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
        ticket_number: ticketNumber,
        order_id: order.id,
        order_number: order.order_number,
        event_id: event.id,
        event_name: event.name,
        customer_id: customer?.id || '',
        customer_name: customer?.full_name || 'Participant',
        customer_phone: customer?.phone || '',
        qr_token: secureToken,
        ticket_type: order.ticket_type_name,
        price: order.unit_price,
        status: 'VALID',
        created_at: new Date().toISOString()
      };

      generatedTickets.push(ticket);
      this.data.tickets.push(ticket);
    }

    order.tickets = generatedTickets;
    this.persist();

    return {
      success: true,
      order,
      tickets: generatedTickets,
      message: 'Paiement confirmé avec succès. Billets générés.'
    };
  }

  cancelOrder(orderId: string): boolean {
    const order = this.data.orders.find(o => o.id === orderId || o.order_number === orderId);
    if (!order) return false;
    order.payment_status = 'CANCELLED';
    this.persist();
    return true;
  }

  // --- TICKETS & CHECK-IN (ATOMIC VALIDATION) ---
  getTickets(): Ticket[] {
    return this.data.tickets;
  }

  getTicketByTokenOrNumber(identifier: string): Ticket | null {
    const raw = identifier.trim();
    if (!raw) return null;

    // Check if JSON QR code was scanned
    try {
      const parsed = JSON.parse(raw);
      if (parsed.t) {
        const found = this.data.tickets.find(t => t.ticket_number.toUpperCase() === String(parsed.t).trim().toUpperCase());
        if (found) return found;
      }
      if (parsed.qr_token) {
        const found = this.data.tickets.find(t => t.qr_token.toUpperCase() === String(parsed.qr_token).trim().toUpperCase());
        if (found) return found;
      }
    } catch {
      // Not JSON, continue with string search
    }

    const trimmed = raw.toUpperCase();
    return this.data.tickets.find(
      t => t.qr_token.toUpperCase() === trimmed ||
           t.ticket_number.toUpperCase() === trimmed ||
           t.qr_token.includes(trimmed) ||
           t.id === raw ||
           t.customer_phone.replace(/\s+/g, '') === raw.replace(/\s+/g, '')
    ) || null;
  }

  validateTicketAtEntrance(identifier: string, operatorName = 'Agent Contrôle Entrée', method: 'camera' | 'manual' = 'camera'): ValidationResult {
    const ticket = this.getTicketByTokenOrNumber(identifier);

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
        message: 'BILLET ANNULÉ : Cette commande a été annulée ou remboursée.',
        ticket
      };
    }

    // Anti-reuse check: Must be atomic!
    if (ticket.status === 'USED') {
      return {
        valid: false,
        status: 'ALREADY_USED',
        message: 'BILLET DÉJÀ UTILISÉ !',
        ticket,
        used_at: ticket.used_at,
        validated_by: ticket.validated_by
      };
    }

    // Atomic update
    const timestamp = new Date().toISOString();
    ticket.status = 'USED';
    ticket.used_at = timestamp;
    ticket.validated_by = operatorName;

    const checkInRecord: CheckIn = {
      id: `chk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ticket_id: ticket.id,
      ticket_number: ticket.ticket_number,
      qr_token: ticket.qr_token,
      customer_name: ticket.customer_name,
      ticket_type: ticket.ticket_type,
      scanned_at: timestamp,
      operator: operatorName,
      method
    };

    this.data.check_ins.unshift(checkInRecord);
    this.persist();

    return {
      valid: true,
      status: 'VALID',
      message: 'BILLET VALIDE : Entrée autorisée ! Bienvenue au Jersey Night Club Party Remix 2026 !',
      ticket,
      used_at: timestamp,
      validated_by: operatorName
    };
  }

  getCheckIns(limit = 100): CheckIn[] {
    return this.data.check_ins.slice(0, limit);
  }

  // --- PARTICIPANTS / CUSTOMERS ---
  getCustomers(): Customer[] {
    return this.data.customers;
  }

  deleteCustomer(customerId: string): boolean {
    const idx = this.data.customers.findIndex(c => c.id === customerId);
    if (idx === -1) return false;
    
    const customer = this.data.customers[idx];
    this.data.customers.splice(idx, 1);

    // Cancel their orders
    this.data.orders.forEach(ord => {
      if (ord.customer_id === customerId) {
        ord.payment_status = 'CANCELLED';
      }
    });

    // Remove tickets and check-in history
    this.data.tickets = this.data.tickets.filter(t => t.customer_id !== customerId);
    this.data.check_ins = this.data.check_ins.filter(chk => chk.customer_name !== customer.full_name);

    this.persist();
    return true;
  }

  searchCustomers(query: string) {
    const q = query.trim().toLowerCase();
    if (!q) return this.data.customers;
    return this.data.customers.filter(
      c => c.full_name.toLowerCase().includes(q) ||
           c.phone.includes(q) ||
           (c.email && c.email.toLowerCase().includes(q))
    );
  }

  // --- STATS ---
  getStats() {
    const totalTicketsSold = this.data.tickets.length;
    const totalTicketsUsed = this.data.tickets.filter(t => t.status === 'USED').length;
    const totalRevenue = this.data.orders
      .filter(o => o.payment_status === 'PAID')
      .reduce((sum, o) => sum + o.total_amount, 0);
    const totalOrders = this.data.orders.length;
    const pendingOrders = this.data.orders.filter(o => o.payment_status === 'PENDING').length;
    const paidOrders = this.data.orders.filter(o => o.payment_status === 'PAID').length;
    const activeEvent = this.getActiveEvent();
    const capacity = activeEvent.capacity || 1000;
    const fillRate = Math.min(100, Math.round((totalTicketsSold / capacity) * 100));

    // Daily breakdown for the last 7 days
    const dailyMap: Record<string, { date: string; sales: number; revenue: number; checkins: number }> = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      dailyMap[dateKey] = { date: dateKey, sales: 0, revenue: 0, checkins: 0 };
    }

    this.data.orders
      .filter(o => o.payment_status === 'PAID')
      .forEach(o => {
        const d = o.created_at.split('T')[0];
        if (dailyMap[d]) {
          dailyMap[d].sales += o.quantity;
          dailyMap[d].revenue += o.total_amount;
        }
      });

    this.data.check_ins.forEach(c => {
      const d = c.scanned_at.split('T')[0];
      if (dailyMap[d]) {
        dailyMap[d].checkins += 1;
      }
    });

    return {
      totalTicketsSold,
      totalTicketsUsed,
      totalRevenue,
      totalOrders,
      pendingOrders,
      paidOrders,
      capacity,
      fillRate,
      ticketsAvailable: Math.max(0, capacity - totalTicketsSold),
      dailyChart: Object.values(dailyMap),
      ticketTypeBreakdown: this.data.ticket_types.map(tt => ({
        name: tt.name,
        sold: this.data.tickets.filter(t => t.ticket_type === tt.name).length,
        available: tt.available_quantity,
        revenue: this.data.tickets
          .filter(t => t.ticket_type === tt.name)
          .reduce((sum, t) => sum + t.price, 0)
      }))
    };
  }

  // --- SETTINGS ---
  getSettings(): AppSettings {
    return this.data.settings;
  }

  updateSettings(patch: Partial<AppSettings>): AppSettings {
    this.data.settings = { ...this.data.settings, ...patch };
    this.persist();
    return this.data.settings;
  }

  // --- DATA RESET (ORDERS, TICKETS, PARTICIPANTS) ---
  resetSalesData(options?: {
    resetOrders?: boolean;
    resetTickets?: boolean;
    resetParticipants?: boolean;
    resetCheckIns?: boolean;
  }): {
    success: boolean;
    message: string;
    deletedOrders: number;
    deletedTickets: number;
    deletedCustomers: number;
    deletedCheckIns: number;
  } {
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
      // Reset ticket type sold counters
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

    // Reset promo usage if orders are reset
    if (doOrders) {
      this.data.promo_codes.forEach(p => {
        p.times_used = 0;
      });
    }

    this.persist();

    return {
      success: true,
      message: 'Réinitialisation effectuée avec succès.',
      deletedOrders,
      deletedTickets,
      deletedCustomers,
      deletedCheckIns
    };
  }

  // --- ADMIN AUTH ---
  adminLogin(_username = 'AJCD', _password = ''): { success: boolean; token: string; message: string; user: { username: string; name: string } } {
    return { 
      success: true, 
      token: 'adm_token_direct_access', 
      user: { username: 'AJCD', name: 'Organisateur AJCD / Amaya' },
      message: 'Accès direct autorisé.' 
    };
  }

  verifyAdminToken(_token?: string): boolean {
    return true;
  }
}

export const db = new CentralDatabase();
