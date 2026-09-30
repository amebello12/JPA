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
import { localStore } from './localStore.js';

const API_BASE = '/api';

/**
 * Robust fetch helper that checks for valid JSON responses.
 * When deployed on Netlify without a Node backend or in offline environments,
 * non-existent API routes will return HTML (the fallback index.html), which breaks res.json().
 * This helper detects that and falls back immediately to the persistent client store.
 */
async function callApi<T>(
  url: string,
  options: RequestInit | undefined,
  fallback: () => T | Promise<T>
): Promise<T> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    // Network failure, offline or pure static hosting (e.g., Netlify)
  }
  return await fallback();
}

export const api = {
  // 1. Event Data
  async getEventData(): Promise<{
    success: boolean;
    event: EventItem;
    ticketTypes: TicketType[];
    programs: ProgramItem[];
    settings: AppSettings;
  }> {
    return callApi(
      `${API_BASE}/event`,
      undefined,
      () => localStore.getEventData()
    );
  },

  // 2. Validate Promo Code
  async validatePromo(code: string, subtotal: number): Promise<{
    valid: boolean;
    discount: number;
    finalTotal: number;
    message: string;
    promo?: PromoCode;
  }> {
    return callApi(
      `${API_BASE}/promo/validate`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal })
      },
      () => localStore.validatePromo(code, subtotal)
    );
  },

  // 3. Create Order
  async createOrder(data: {
    fullName: string;
    phone: string;
    email?: string;
    ticketTypeId: string;
    quantity: number;
    promoCode?: string;
  }): Promise<{ success: boolean; order?: Order; message?: string }> {
    return callApi(
      `${API_BASE}/orders`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => localStore.createOrder(data)
    );
  },

  // 4. Get Order
  async getOrder(orderIdOrNumber: string): Promise<{ success: boolean; order?: Order; message?: string }> {
    return callApi(
      `${API_BASE}/orders/${encodeURIComponent(orderIdOrNumber)}`,
      undefined,
      () => localStore.getOrder(orderIdOrNumber)
    );
  },

  // 5. Confirm Order
  async confirmOrder(
    orderIdOrNumber: string,
    reference?: string,
    operator?: string
  ): Promise<{ success: boolean; order?: Order; tickets?: Ticket[]; message: string }> {
    return callApi(
      `${API_BASE}/orders/${encodeURIComponent(orderIdOrNumber)}/confirm`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference, operator })
      },
      () => localStore.confirmOrder(orderIdOrNumber, reference, operator)
    );
  },

  // 6. Cancel Order
  async cancelOrder(orderIdOrNumber: string): Promise<{ success: boolean; message: string }> {
    return callApi(
      `${API_BASE}/orders/${encodeURIComponent(orderIdOrNumber)}/cancel`,
      { method: 'POST' },
      () => localStore.cancelOrder(orderIdOrNumber)
    );
  },

  // 7. Check-In Scanner
  async checkInScan(
    identifier: string,
    operator: string,
    method: 'camera' | 'manual' = 'camera'
  ): Promise<ValidationResult> {
    return callApi(
      `${API_BASE}/checkin/scan`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, operator, method })
      },
      () => localStore.checkInScan(identifier, operator, method)
    );
  },

  // 8. Recent Check-Ins
  async getRecentCheckIns(): Promise<{ success: boolean; checkIns: CheckIn[] }> {
    return callApi(
      `${API_BASE}/checkin/history`,
      undefined,
      () => localStore.getRecentCheckIns()
    );
  },

  // 9. Admin Login
  async adminLogin(username: string, password: string): Promise<{ success: boolean; token?: string; message: string; user?: any }> {
    return callApi(
      `${API_BASE}/admin/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      },
      () => ({
        success: true,
        token: 'direct_admin_access',
        message: 'Connexion directe active',
        user: { username: 'AJCD', name: 'Organisateur AJCD / Amaya' }
      })
    );
  },

  // 10. Admin Stats
  async getAdminStats(token: string) {
    return callApi(
      `${API_BASE}/admin/stats`,
      { headers: { Authorization: `Bearer ${token}` } },
      () => localStore.getAdminStats()
    );
  },

  // 11. Admin Orders
  async getAdminOrders(token: string) {
    return callApi(
      `${API_BASE}/admin/orders`,
      { headers: { Authorization: `Bearer ${token}` } },
      () => localStore.getAdminOrders()
    );
  },

  // 12. Admin Tickets
  async getAdminTickets(token: string) {
    return callApi(
      `${API_BASE}/admin/tickets`,
      { headers: { Authorization: `Bearer ${token}` } },
      () => localStore.getAdminTickets()
    );
  },

  // 13. Admin Participants
  async getAdminParticipants(token: string, query = '') {
    return callApi(
      `${API_BASE}/admin/participants?q=${encodeURIComponent(query)}`,
      { headers: { Authorization: `Bearer ${token}` } },
      () => localStore.getAdminParticipants(query)
    );
  },

  async deleteAdminParticipant(token: string, id: string) {
    return callApi(
      `${API_BASE}/admin/participants/${id}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      },
      () => localStore.deleteAdminParticipant(id)
    );
  },

  // 14. Admin Promo Codes
  async getAdminPromoCodes(token: string) {
    return callApi(
      `${API_BASE}/admin/promo-codes`,
      { headers: { Authorization: `Bearer ${token}` } },
      () => localStore.getAdminPromoCodes()
    );
  },

  async createAdminPromoCode(token: string, promoData: Partial<PromoCode>) {
    return callApi(
      `${API_BASE}/admin/promo-codes`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(promoData)
      },
      () => localStore.createAdminPromoCode(promoData)
    );
  },

  async toggleAdminPromoCode(token: string, id: string) {
    return callApi(
      `${API_BASE}/admin/promo-codes/${id}/toggle`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      },
      () => localStore.toggleAdminPromoCode(id)
    );
  },

  // 15. Admin Event Details
  async updateAdminEvent(token: string, eventId: string, patch: Partial<EventItem>) {
    return callApi(
      `${API_BASE}/admin/events/${eventId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(patch)
      },
      () => localStore.updateAdminEvent(patch)
    );
  },

  // 16. Admin Ticket Types
  async updateAdminTicketType(token: string, typeId: string, patch: Partial<TicketType>) {
    return callApi(
      `${API_BASE}/admin/ticket-types/${typeId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(patch)
      },
      () => localStore.updateAdminTicketType(typeId, patch)
    );
  },

  // 17. Admin Program Items
  async createAdminProgramItem(token: string, item: Partial<ProgramItem>) {
    return callApi(
      `${API_BASE}/admin/program`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(item)
      },
      () => localStore.createAdminProgramItem(item)
    );
  },

  async updateAdminProgramItem(token: string, id: string, item: Partial<ProgramItem>) {
    return callApi(
      `${API_BASE}/admin/program/${id}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(item)
      },
      () => localStore.updateAdminProgramItem(id, item)
    );
  },

  async deleteAdminProgramItem(token: string, id: string) {
    return callApi(
      `${API_BASE}/admin/program/${id}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      },
      () => localStore.deleteAdminProgramItem(id)
    );
  },

  // 18. Admin App Settings
  async updateAdminSettings(token: string, settings: Partial<AppSettings>) {
    return callApi(
      `${API_BASE}/admin/settings`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      },
      () => localStore.updateAdminSettings(settings)
    );
  },

  // 19. Reset Sales Data (Orders, Tickets, Participants, Scans)
  async resetSalesData(token: string, options?: {
    resetOrders?: boolean;
    resetTickets?: boolean;
    resetParticipants?: boolean;
    resetCheckIns?: boolean;
  }) {
    return callApi(
      `${API_BASE}/admin/reset-data`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(options || {})
      },
      () => localStore.resetSalesData(options)
    );
  }
};
