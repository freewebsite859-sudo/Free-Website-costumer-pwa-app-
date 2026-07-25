/**
 * Data access layer.
 *
 * Every function is a thin, typed wrapper around a Supabase query plus the
 * row -> domain mapping. Components never talk to Supabase directly, so the
 * app can still run entirely offline when the project is unconfigured.
 */
import { requireSupabase } from './supabaseClient';
import {
  mapAddress,
  mapBooking,
  mapFavoriteProfessional,
  mapFavoriteService,
  mapNotification,
  mapReview,
  mapSalon,
  mapWaitlistEntry,
} from './mappers';
import type {
  Address,
  AppNotification,
  Booking,
  Salon,
  SavedProfessional,
  SavedService,
  Service,
  ServiceReview,
  UserLocation,
  WaitlistEntry,
} from '../types';
import type { Database } from './database.types';

type Tables = Database['public']['Tables'];

/** Unwraps a PostgrestResponse, throwing a readable error. */
function unwrap<T>(result: { data: T | null; error: { message: string } | null }, context: string): T {
  if (result.error) {
    throw new Error(`${context}: ${result.error.message}`);
  }
  if (result.data === null) {
    throw new Error(`${context}: no data returned`);
  }
  return result.data;
}

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------

export async function fetchSalons(): Promise<Salon[]> {
  const sb = requireSupabase();
  const [salonsRes, servicesRes, staffRes] = await Promise.all([
    sb.from('salons').select('*').order('rating', { ascending: false }),
    sb.from('services').select('*'),
    sb.from('staff').select('*'),
  ]);

  const salons = unwrap(salonsRes, 'Failed to load salons');
  const services = unwrap(servicesRes, 'Failed to load services');
  const staff = unwrap(staffRes, 'Failed to load staff');

  const servicesBySalon = new Map<string, Tables['services']['Row'][]>();
  for (const s of services) {
    const list = servicesBySalon.get(s.salon_id) ?? [];
    list.push(s);
    servicesBySalon.set(s.salon_id, list);
  }

  const staffBySalon = new Map<string, Tables['staff']['Row'][]>();
  for (const s of staff) {
    const list = staffBySalon.get(s.salon_id) ?? [];
    list.push(s);
    staffBySalon.set(s.salon_id, list);
  }

  return salons.map((row) =>
    mapSalon(row, servicesBySalon.get(row.id) ?? [], staffBySalon.get(row.id) ?? []),
  );
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export interface ProfileData {
  fullName: string;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  preferredCity: string | null;
  preferredArea: string | null;
  language: string;
  theme: string;
  preferences: Record<string, unknown>;
  location: UserLocation | null;
}

export async function fetchProfile(userId: string): Promise<ProfileData | null> {
  const sb = requireSupabase();
  const { data, error } = await sb.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) throw new Error(`Failed to load profile: ${error.message}`);
  if (!data) return null;

  return {
    fullName: data.full_name,
    email: data.email,
    phone: data.phone,
    avatarUrl: data.avatar_url,
    dateOfBirth: data.date_of_birth,
    gender: data.gender,
    preferredCity: data.preferred_city,
    preferredArea: data.preferred_area,
    language: data.language,
    theme: data.theme,
    preferences: (data.preferences as Record<string, unknown>) ?? {},
    location: (data.location as UserLocation | null) ?? null,
  };
}

export async function updateProfile(userId: string, patch: Partial<ProfileData>): Promise<void> {
  const sb = requireSupabase();
  const row: Record<string, unknown> = { id: userId };
  if (patch.fullName !== undefined) row.full_name = patch.fullName;
  if (patch.email !== undefined) row.email = patch.email;
  if (patch.phone !== undefined) row.phone = patch.phone;
  if (patch.avatarUrl !== undefined) row.avatar_url = patch.avatarUrl;
  if (patch.dateOfBirth !== undefined) row.date_of_birth = patch.dateOfBirth || null;
  if (patch.gender !== undefined) row.gender = patch.gender;
  if (patch.preferredCity !== undefined) row.preferred_city = patch.preferredCity;
  if (patch.preferredArea !== undefined) row.preferred_area = patch.preferredArea;
  if (patch.language !== undefined) row.language = patch.language;
  if (patch.theme !== undefined) row.theme = patch.theme;
  if (patch.preferences !== undefined) row.preferences = patch.preferences;
  if (patch.location !== undefined) row.location = patch.location;

  const { error } = await sb.from('profiles').upsert(row, { onConflict: 'id' });
  if (error) throw new Error(`Failed to save profile: ${error.message}`);
}

// ---------------------------------------------------------------------------
// Bookings
// ---------------------------------------------------------------------------

export async function fetchBookings(userId: string): Promise<Booking[]> {
  const sb = requireSupabase();
  const res = await sb
    .from('bookings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return unwrap(res, 'Failed to load bookings').map(mapBooking);
}

export interface NewBookingInput {
  reference: string;
  salonId: string;
  salonName: string;
  services: Service[];
  totalAmount: number;
  dateStr: string;
  timeSlot: string;
  staffName?: string;
  locationArea: string;
}

export async function createBooking(userId: string, input: NewBookingInput): Promise<Booking> {
  const sb = requireSupabase();
  const res = await sb
    .from('bookings')
    .insert({
      reference: input.reference,
      user_id: userId,
      salon_id: input.salonId,
      salon_name: input.salonName,
      services: input.services as unknown as Database['public']['Tables']['bookings']['Row']['services'],
      total_amount: input.totalAmount,
      date_str: input.dateStr,
      time_slot: input.timeSlot,
      status: 'CONFIRMED',
      staff_name: input.staffName ?? null,
      location_area: input.locationArea,
    })
    .select()
    .single();
  return mapBooking(unwrap(res, 'Failed to create booking'));
}

export async function cancelBooking(userId: string, reference: string): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb
    .from('bookings')
    .update({ status: 'CANCELLED' })
    .eq('user_id', userId)
    .eq('reference', reference);
  if (error) throw new Error(`Failed to cancel booking: ${error.message}`);
}

export async function markBookingReviewed(userId: string, reference: string): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb
    .from('bookings')
    .update({ is_reviewed: true })
    .eq('user_id', userId)
    .eq('reference', reference);
  if (error) throw new Error(`Failed to update booking: ${error.message}`);
}

// ---------------------------------------------------------------------------
// Favourites
// ---------------------------------------------------------------------------

export async function fetchFavoriteSalonIds(userId: string): Promise<string[]> {
  const sb = requireSupabase();
  const res = await sb.from('favorite_salons').select('salon_id').eq('user_id', userId);
  return unwrap(res, 'Failed to load favourites').map((r) => r.salon_id);
}

export async function addFavoriteSalon(userId: string, salonId: string): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb
    .from('favorite_salons')
    .upsert({ user_id: userId, salon_id: salonId }, { onConflict: 'user_id,salon_id' });
  if (error) throw new Error(`Failed to save favourite: ${error.message}`);
}

export async function removeFavoriteSalon(userId: string, salonId: string): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb
    .from('favorite_salons')
    .delete()
    .eq('user_id', userId)
    .eq('salon_id', salonId);
  if (error) throw new Error(`Failed to remove favourite: ${error.message}`);
}

export async function fetchFavoriteProfessionals(userId: string): Promise<SavedProfessional[]> {
  const sb = requireSupabase();
  const res = await sb
    .from('favorite_professionals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  return unwrap(res, 'Failed to load saved professionals').map(mapFavoriteProfessional);
}

export async function addFavoriteProfessional(
  userId: string,
  pro: SavedProfessional,
): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.from('favorite_professionals').upsert(
    {
      user_id: userId,
      pro_id: pro.id,
      salon_id: pro.salonId || null,
      name: pro.name,
      role: pro.role,
      rating: pro.rating,
      avatar: pro.avatar,
      salon_name: pro.salonName,
      skills: pro.skills as unknown as Database['public']['Tables']['favorite_professionals']['Row']['skills'],
    },
    { onConflict: 'user_id,pro_id' },
  );
  if (error) throw new Error(`Failed to save professional: ${error.message}`);
}

export async function removeFavoriteProfessional(userId: string, proId: string): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb
    .from('favorite_professionals')
    .delete()
    .eq('user_id', userId)
    .eq('pro_id', proId);
  if (error) throw new Error(`Failed to remove professional: ${error.message}`);
}

export async function fetchFavoriteServices(userId: string): Promise<SavedService[]> {
  const sb = requireSupabase();
  const res = await sb
    .from('favorite_services')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  return unwrap(res, 'Failed to load saved services').map(mapFavoriteService);
}

export async function addFavoriteService(userId: string, service: SavedService): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.from('favorite_services').upsert(
    {
      user_id: userId,
      service_id: service.id,
      salon_id: service.salonId || null,
      name: service.name,
      duration_minutes: service.durationMinutes,
      price: service.price,
      salon_name: service.salonName,
      category: service.category,
    },
    { onConflict: 'user_id,service_id' },
  );
  if (error) throw new Error(`Failed to save service: ${error.message}`);
}

export async function removeFavoriteService(userId: string, serviceId: string): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb
    .from('favorite_services')
    .delete()
    .eq('user_id', userId)
    .eq('service_id', serviceId);
  if (error) throw new Error(`Failed to remove service: ${error.message}`);
}

// ---------------------------------------------------------------------------
// Addresses
// ---------------------------------------------------------------------------

export async function fetchAddresses(userId: string): Promise<Address[]> {
  const sb = requireSupabase();
  const res = await sb
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  return unwrap(res, 'Failed to load addresses').map(mapAddress);
}

export async function upsertAddress(
  userId: string,
  address: Omit<Address, 'id'> & { id?: string },
): Promise<Address> {
  const sb = requireSupabase();
  // Only one default per user is allowed by a partial unique index, so clear
  // the previous default first.
  if (address.isDefault) {
    await sb
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', userId)
      .eq('is_default', true);
  }

  const payload = {
    ...(address.id ? { id: address.id } : {}),
    user_id: userId,
    label: address.label,
    flat_number: address.flatNumber,
    street: address.street,
    landmark: address.landmark ?? null,
    city: address.city,
    pincode: address.pincode,
    is_default: address.isDefault,
  };

  const res = await sb.from('addresses').upsert(payload, { onConflict: 'id' }).select().single();
  return mapAddress(unwrap(res, 'Failed to save address'));
}

export async function deleteAddress(userId: string, addressId: string): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.from('addresses').delete().eq('user_id', userId).eq('id', addressId);
  if (error) throw new Error(`Failed to delete address: ${error.message}`);
}

export async function setDefaultAddress(userId: string, addressId: string): Promise<void> {
  const sb = requireSupabase();
  await sb.from('addresses').update({ is_default: false }).eq('user_id', userId).eq('is_default', true);
  const { error } = await sb
    .from('addresses')
    .update({ is_default: true })
    .eq('user_id', userId)
    .eq('id', addressId);
  if (error) throw new Error(`Failed to set default address: ${error.message}`);
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

export async function fetchReviewsForSalon(salonId: string): Promise<ServiceReview[]> {
  const sb = requireSupabase();
  const res = await sb
    .from('service_reviews')
    .select('*')
    .eq('salon_id', salonId)
    .order('created_at', { ascending: false });
  return unwrap(res, 'Failed to load reviews').map(mapReview);
}

export async function createReview(
  userId: string,
  review: Omit<ServiceReview, 'id' | 'date'>,
): Promise<ServiceReview> {
  const sb = requireSupabase();
  const res = await sb
    .from('service_reviews')
    .insert({
      user_id: userId,
      salon_id: review.salonId,
      service_id: review.serviceId ?? null,
      service_name: review.serviceName,
      author: review.author,
      rating: review.rating,
      comment: review.comment,
      verified_booking: review.verifiedBooking ?? false,
    })
    .select()
    .single();
  return mapReview(unwrap(res, 'Failed to publish review'));
}

// ---------------------------------------------------------------------------
// Waitlist
// ---------------------------------------------------------------------------

export async function fetchWaitlistEntries(userId: string): Promise<WaitlistEntry[]> {
  const sb = requireSupabase();
  const res = await sb
    .from('waitlist_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return unwrap(res, 'Failed to load waitlist').map(mapWaitlistEntry);
}

export async function createWaitlistEntry(
  userId: string,
  entry: Omit<WaitlistEntry, 'id' | 'createdAt'>,
): Promise<WaitlistEntry> {
  const sb = requireSupabase();
  const res = await sb
    .from('waitlist_entries')
    .insert({
      user_id: userId,
      salon_id: entry.salonId,
      salon_name: entry.salonName,
      service_names: entry.serviceNames as unknown as Database['public']['Tables']['waitlist_entries']['Row']['service_names'],
      date_str: entry.dateStr,
      time_slot: entry.timeSlot,
      client_name: entry.clientName,
      client_phone: entry.clientPhone,
      notification_preference: entry.notificationPreference,
      position: entry.position,
      status: entry.status,
    })
    .select()
    .single();
  return mapWaitlistEntry(unwrap(res, 'Failed to join waitlist'));
}

export async function updateWaitlistStatus(
  userId: string,
  entryId: string,
  status: WaitlistEntry['status'],
): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb
    .from('waitlist_entries')
    .update({ status })
    .eq('user_id', userId)
    .eq('id', entryId);
  if (error) throw new Error(`Failed to update waitlist: ${error.message}`);
}

export async function deleteWaitlistEntry(userId: string, entryId: string): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb
    .from('waitlist_entries')
    .delete()
    .eq('user_id', userId)
    .eq('id', entryId);
  if (error) throw new Error(`Failed to leave waitlist: ${error.message}`);
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export async function fetchNotifications(userId: string): Promise<AppNotification[]> {
  const sb = requireSupabase();
  const res = await sb
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  return unwrap(res, 'Failed to load notifications').map(mapNotification);
}

export async function createNotification(
  userId: string,
  notification: Omit<AppNotification, 'id' | 'timestamp'>,
  bookingRowId?: string,
): Promise<AppNotification> {
  const sb = requireSupabase();
  const res = await sb
    .from('notifications')
    .insert({
      user_id: userId,
      booking_id: bookingRowId ?? null,
      salon_name: notification.salonName,
      time_slot: notification.timeSlot,
      date_str: notification.dateStr,
      services_summary: notification.servicesSummary,
      message: notification.message,
      type: notification.type,
      read: notification.read,
    })
    .select()
    .single();
  return mapNotification(unwrap(res, 'Failed to create notification'));
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);
  if (error) throw new Error(`Failed to update notifications: ${error.message}`);
}

export async function clearNotifications(userId: string): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.from('notifications').delete().eq('user_id', userId);
  if (error) throw new Error(`Failed to clear notifications: ${error.message}`);
}
