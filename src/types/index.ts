export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';
export type TicketStatus = 'VALID' | 'USED' | 'CANCELLED';

export interface EventItem {
  id: string;
  name: string;
  edition: string;
  date: string; // ISO date or "2026-10-03"
  time: string; // e.g. "20:00"
  location: string;
  venue_details: string;
  description: string;
  dress_code: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'COMPLETED';
  capacity: number;
  organizers: string[];
  partners: string[];
  poster_url: string;
  hero_bg_url?: string;
  crowd_img_url?: string;
  slogan?: string;
  reservation_phone: string;
  free_transport_info: string[];
  ladies_free_until: string;
}

export interface TicketType {
  id: string;
  event_id: string;
  name: string;
  price: number; // in FCFA
  original_price?: number;
  description: string;
  badge?: string;
  available_quantity: number;
  sold_quantity: number;
  max_per_order: number;
  active: boolean;
}

export interface Customer {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string; // e.g. JP-2026-00482
  customer_id: string;
  customer?: Customer;
  event_id: string;
  ticket_type_id: string;
  ticket_type_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  discount: number;
  total_amount: number;
  promo_code?: string;
  payment_method: 'wave';
  payment_status: PaymentStatus;
  payment_reference?: string;
  wave_payment_url?: string;
  created_at: string;
  paid_at?: string;
  tickets?: Ticket[];
}

export interface Ticket {
  id: string;
  ticket_number: string; // e.g. JP-8F72A1
  order_id: string;
  order_number: string;
  event_id: string;
  event_name: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  qr_token: string;
  ticket_type: string;
  price: number;
  status: TicketStatus;
  used_at?: string;
  validated_by?: string;
  created_at: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discount_type: 'fixed' | 'percent';
  discount_value: number; // e.g. 500 for 500 FCFA or 10 for 10%
  min_order_amount?: number;
  expiration: string;
  usage_limit: number;
  times_used: number;
  active: boolean;
}

export interface CheckIn {
  id: string;
  ticket_id: string;
  ticket_number: string;
  qr_token: string;
  customer_name: string;
  ticket_type: string;
  scanned_at: string;
  operator: string;
  method: 'camera' | 'manual';
}

export interface ProgramItem {
  id: string;
  event_id: string;
  time: string;
  title: string;
  description: string;
  order_index: number;
}

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  role: 'SUPERADMIN' | 'OPERATOR';
}

export interface AppSettings {
  wave_link: string;
  wave_merchant_id: string;
  whatsapp_enabled: boolean;
  whatsapp_phone_number: string;
  contact_phone: string;
  contact_email: string;
  currency: string;
}

export interface ValidationResult {
  valid: boolean;
  status: 'VALID' | 'ALREADY_USED' | 'INVALID' | 'CANCELLED';
  message: string;
  ticket?: Ticket;
  used_at?: string;
  validated_by?: string;
}
