/**
 * Hand-maintained mirror of supabase/migrations/0001_initial_schema.sql.
 *
 * To regenerate from a live project instead:
 *   npx supabase gen types typescript --project-id <ref> > src/lib/database.types.ts
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type BookingStatusDb = 'CONFIRMED' | 'PENDING' | 'PAST' | 'COMPLETED' | 'CANCELLED';
export type WaitlistStatusDb = 'ACTIVE' | 'NOTIFIED' | 'EXPIRED' | 'CANCELLED';
export type NotificationTypeDb = 'reminder_1h' | 'booking_confirmed' | 'general';
export type NotificationChannelDb = 'sms' | 'push' | 'both';
export type TicketStatusDb = 'OPEN' | 'RESOLVED';
export type GenderCategoryDb = 'Unisex' | 'Women Only' | 'Men Only';

type SalonRow = {
  id: string;
  name: string;
  area: string;
  city: string;
  distance_km: number;
  rating: number;
  review_count: number;
  verified: boolean;
  is_new: boolean;
  image: string;
  gallery: Json;
  starting_price: number;
  tags: Json;
  gender_category: GenderCategoryDb | null;
  address: string;
  hours: string;
  description: string;
  created_at: string;
  updated_at: string;
};

type ServiceRow = {
  id: string;
  salon_id: string;
  name: string;
  duration_minutes: number;
  price: number;
  category: string;
  description: string | null;
  sort_order: number;
  created_at: string;
};

type StaffRow = {
  id: string;
  salon_id: string;
  name: string;
  role: string;
  rating: number;
  reviews_count: number;
  avatar: string;
  sort_order: number;
  created_at: string;
};

type ProfileRow = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
  gender: string | null;
  preferred_city: string | null;
  preferred_area: string | null;
  language: string;
  theme: string;
  preferences: Json;
  location: Json | null;
  created_at: string;
  updated_at: string;
};

type AddressRow = {
  id: string;
  user_id: string;
  label: string;
  flat_number: string;
  street: string;
  landmark: string | null;
  city: string;
  pincode: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

type BookingRow = {
  id: string;
  reference: string;
  user_id: string;
  salon_id: string | null;
  salon_name: string;
  services: Json;
  total_amount: number;
  date_str: string;
  time_slot: string;
  status: BookingStatusDb;
  staff_name: string | null;
  location_area: string;
  is_reviewed: boolean;
  created_at: string;
  updated_at: string;
};

type FavoriteSalonRow = {
  user_id: string;
  salon_id: string;
  created_at: string;
};

type FavoriteProfessionalRow = {
  id: string;
  user_id: string;
  pro_id: string;
  salon_id: string | null;
  name: string;
  role: string;
  rating: number;
  avatar: string;
  salon_name: string;
  skills: Json;
  created_at: string;
};

type FavoriteServiceRow = {
  id: string;
  user_id: string;
  service_id: string;
  salon_id: string | null;
  name: string;
  duration_minutes: number;
  price: number;
  salon_name: string;
  category: string;
  created_at: string;
};

type ServiceReviewRow = {
  id: string;
  user_id: string | null;
  salon_id: string;
  service_id: string | null;
  service_name: string;
  author: string;
  rating: number;
  comment: string;
  verified_booking: boolean;
  created_at: string;
};

type WaitlistEntryRow = {
  id: string;
  user_id: string;
  salon_id: string;
  salon_name: string;
  service_names: Json;
  date_str: string;
  time_slot: string;
  client_name: string;
  client_phone: string;
  notification_preference: NotificationChannelDb;
  position: number;
  status: WaitlistStatusDb;
  created_at: string;
  updated_at: string;
};

type NotificationRow = {
  id: string;
  user_id: string;
  booking_id: string | null;
  salon_name: string;
  time_slot: string;
  date_str: string;
  services_summary: string;
  message: string;
  type: NotificationTypeDb;
  read: boolean;
  created_at: string;
};

type SupportTicketRow = {
  id: string;
  reference: string;
  user_id: string;
  subject: string;
  category: string;
  status: TicketStatusDb;
  messages: Json;
  created_at: string;
  updated_at: string;
};

/**
 * `Insert`/`Update` stay permissive (all columns optional) because the database
 * supplies ids, timestamps and other defaults. `Row` carries the exact shape.
 *
 * Note: Row must be constrained to `Record<string, unknown>` so each table
 * satisfies postgrest-js's `GenericTable`; otherwise every query result is
 * inferred as `never`.
 */
type TableDef<Row extends Record<string, unknown>> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      salons: TableDef<SalonRow>;
      services: TableDef<ServiceRow>;
      staff: TableDef<StaffRow>;
      profiles: TableDef<ProfileRow>;
      addresses: TableDef<AddressRow>;
      bookings: TableDef<BookingRow>;
      favorite_salons: TableDef<FavoriteSalonRow>;
      favorite_professionals: TableDef<FavoriteProfessionalRow>;
      favorite_services: TableDef<FavoriteServiceRow>;
      service_reviews: TableDef<ServiceReviewRow>;
      waitlist_entries: TableDef<WaitlistEntryRow>;
      notifications: TableDef<NotificationRow>;
      support_tickets: TableDef<SupportTicketRow>;
    };
    Views: Record<string, {
      Row: Record<string, unknown>;
      Relationships: [];
    }>;
    Functions: Record<string, {
      Args: Record<string, unknown>;
      Returns: unknown;
    }>;
    Enums: {
      booking_status: BookingStatusDb;
      waitlist_status: WaitlistStatusDb;
      notification_type: NotificationTypeDb;
      notification_channel: NotificationChannelDb;
      ticket_status: TicketStatusDb;
      gender_category: GenderCategoryDb;
    };
    CompositeTypes: Record<string, Record<string, unknown>>;
  };
}
