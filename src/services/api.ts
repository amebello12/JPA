import {
  EventItem,
  TicketType,
  Order,
  Ticket,
  PromoCode,
  CheckIn,
  ProgramItem,
  AppSettings,
  ValidationResult,
  Customer
} from '../types/index.js';

const API_BASE = '/api';

export const api = {
  // Public
  async getEventData(): Promise<{
    success: boolean;
    event: EventItem;
    ticketTypes: TicketType[];
    programs: ProgramItem[];
    settings: AppSettings;
  }> {
    const res = await fetch(`${API_BASE}/event`);
    if (!res.ok) throw new Error('Erreur lors de la récupération des données de l’événement.');
    return res.json();
  },

  async validatePromo(code: string, subtotal: number): Promise<{
    valid: boolean;
    discount: number;
    finalTotal: number;
    message: string;
    promo?: PromoCode;
  }> {
    const res = await fetch(`${API_BASE}/promo/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal })
    });
    return res.json();
  },

  async createOrder(data: {
    fullName: string;
    phone: string;
    email?: string;
    ticketTypeId: string;
    quantity: number;
    promoCode?: string;
  }): Promise<{ success: boolean; order?: Order; message?: string }> {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async getOrder(orderIdOrNumber: string): Promise<{ success: boolean; order?: Order; message?: string }> {
    const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(orderIdOrNumber)}`);
    return res.json();
  },

  async confirmOrder(
    orderIdOrNumber: string,
    reference?: string,
    operator?: string
  ): Promise<{ success: boolean; order?: Order; tickets?: Ticket[]; message: string }> {
    const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(orderIdOrNumber)}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference, operator })
    });
    return res.json();
  },

  async cancelOrder(orderIdOrNumber: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(orderIdOrNumber)}/cancel`, {
      method: 'POST'
    });
    return res.json();
  },

  async checkInScan(
    identifier: string,
    operator: string,
    method: 'camera' | 'manual' = 'camera'
  ): Promise<ValidationResult> {
    const res = await fetch(`${API_BASE}/checkin/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, operator, method })
    });
    return res.json();
  },

  async getRecentCheckIns(): Promise<{ success: boolean; checkIns: CheckIn[] }> {
    const res = await fetch(`${API_BASE}/checkin/history`);
    return res.json();
  },

  // Admin Auth
  async adminLogin(username: string, password: string): Promise<{ success: boolean; token?: string; message: string; user?: any }> {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return res.json();
  },

  // Secured Admin Endpoints
  async getAdminStats(token: string) {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },

  async getAdminOrders(token: string) {
    const res = await fetch(`${API_BASE}/admin/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },

  async getAdminTickets(token: string) {
    const res = await fetch(`${API_BASE}/admin/tickets`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },

  async getAdminParticipants(token: string, query = '') {
    const res = await fetch(`${API_BASE}/admin/participants?q=${encodeURIComponent(query)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },

  async deleteAdminParticipant(token: string, id: string) {
    const res = await fetch(`${API_BASE}/admin/participants/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },

  async getAdminPromoCodes(token: string) {
    const res = await fetch(`${API_BASE}/admin/promo-codes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },

  async createAdminPromoCode(token: string, promoData: Partial<PromoCode>) {
    const res = await fetch(`${API_BASE}/admin/promo-codes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(promoData)
    });
    return res.json();
  },

  async toggleAdminPromoCode(token: string, id: string) {
    const res = await fetch(`${API_BASE}/admin/promo-codes/${id}/toggle`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },

  async updateAdminEvent(token: string, eventId: string, patch: Partial<EventItem>) {
    const res = await fetch(`${API_BASE}/admin/events/${eventId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(patch)
    });
    return res.json();
  },

  async updateAdminTicketType(token: string, typeId: string, patch: Partial<TicketType>) {
    const res = await fetch(`${API_BASE}/admin/ticket-types/${typeId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(patch)
    });
    return res.json();
  },

  async createAdminProgramItem(token: string, item: Partial<ProgramItem>) {
    const res = await fetch(`${API_BASE}/admin/program`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(item)
    });
    return res.json();
  },

  async updateAdminProgramItem(token: string, id: string, item: Partial<ProgramItem>) {
    const res = await fetch(`${API_BASE}/admin/program/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(item)
    });
    return res.json();
  },

  async deleteAdminProgramItem(token: string, id: string) {
    const res = await fetch(`${API_BASE}/admin/program/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },

  async updateAdminSettings(token: string, settings: Partial<AppSettings>) {
    const res = await fetch(`${API_BASE}/admin/settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(settings)
    });
    return res.json();
  }
};
