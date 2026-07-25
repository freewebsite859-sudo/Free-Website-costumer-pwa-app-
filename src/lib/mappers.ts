/**
 * Translation layer between Postgres rows (snake_case) and the app's existing
 * domain types (camelCase). Keeping this isolated means the UI components did
 * not have to change shape when the backend was introduced.
 */
import type {
  Address,
  AppNotification,
  Booking,
  Salon,
  SavedProfessional,
  SavedService,
  Service,
  ServiceReview,
  Staff,
  WaitlistEntry,
} from '../types';
import type { Database, Json } from './database.types';

type Tables = Database['public']['Tables'];
type SalonRow = Tables['salons']['Row'];
type ServiceRow = Tables['services']['Row'];
type StaffRow = Tables['staff']['Row'];
type BookingRow = Tables['bookings']['Row'];
type AddressRow = Tables['addresses']['Row'];
type ReviewRow = Tables['service_reviews']['Row'];
type WaitlistRow = Tables['waitlist_entries']['Row'];
type NotificationRow = Tables['notifications']['Row'];
type FavProRow = Tables['favorite_professionals']['Row'];
type FavServiceRow = Tables['favorite_services']['Row'];

const asStringArray = (value: Json | null | undefined): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];

/**
 * Catalog ids are namespaced as `${salonId}:${localId}` in the database because
 * the source data reuses ids like `s1` across salons. The UI only cares about
 * the local part.
 */
export const stripSalonPrefix = (id: string, salonId: string): string =>
  id.startsWith(`${salonId}:`) ? id.slice(salonId.length + 1) : id;

export function mapService(row: ServiceRow): Service {
  return {
    id: stripSalonPrefix(row.id, row.salon_id),
    name: row.name,
    durationMinutes: row.duration_minutes,
    price: row.price,
    category: row.category,
    description: row.description ?? undefined,
  };
}

export function mapStaff(row: StaffRow): Staff {
  return {
    id: stripSalonPrefix(row.id, row.salon_id),
    name: row.name,
    role: row.role,
    rating: Number(row.rating),
    reviewsCount: row.reviews_count,
    avatar: row.avatar,
  };
}

export function mapSalon(
  row: SalonRow,
  services: ServiceRow[] = [],
  staff: StaffRow[] = [],
): Salon {
  const reviewCount = row.review_count;
  return {
    id: row.id,
    name: row.name,
    area: row.area,
    city: row.city,
    distanceKm: Number(row.distance_km),
    rating: Number(row.rating),
    reviewCount,
    // The domain type carries both spellings; keep them in sync.
    reviewsCount: reviewCount,
    verified: row.verified,
    isNew: row.is_new,
    image: row.image,
    gallery: asStringArray(row.gallery),
    startingPrice: row.starting_price,
    tags: asStringArray(row.tags),
    genderCategory: row.gender_category ?? undefined,
    address: row.address,
    hours: row.hours,
    description: row.description,
    services: services
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(mapService),
    staff: staff
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(mapStaff),
  };
}

export function mapBooking(row: BookingRow): Booking {
  const services = Array.isArray(row.services) ? (row.services as unknown as Service[]) : [];
  return {
    // The UI uses `id` as the human-visible booking reference (NX-1234).
    id: row.reference,
    salonId: row.salon_id ?? '',
    salonName: row.salon_name,
    services,
    totalAmount: row.total_amount,
    dateStr: row.date_str,
    timeSlot: row.time_slot,
    status: row.status,
    staffName: row.staff_name ?? undefined,
    locationArea: row.location_area,
    createdTime: new Date(row.created_at).getTime(),
    isReviewed: row.is_reviewed,
  };
}

export function mapAddress(row: AddressRow): Address {
  return {
    id: row.id,
    label: row.label,
    flatNumber: row.flat_number,
    street: row.street,
    landmark: row.landmark ?? undefined,
    city: row.city,
    pincode: row.pincode,
    isDefault: row.is_default,
  };
}

export function mapReview(row: ReviewRow): ServiceReview {
  return {
    id: row.id,
    salonId: row.salon_id,
    serviceId: row.service_id ?? undefined,
    serviceName: row.service_name,
    author: row.author,
    rating: Number(row.rating),
    date: formatRelativeDate(row.created_at),
    comment: row.comment,
    verifiedBooking: row.verified_booking,
  };
}

export function mapWaitlistEntry(row: WaitlistRow): WaitlistEntry {
  return {
    id: row.id,
    salonId: row.salon_id,
    salonName: row.salon_name,
    serviceNames: asStringArray(row.service_names),
    dateStr: row.date_str,
    timeSlot: row.time_slot,
    clientName: row.client_name,
    clientPhone: row.client_phone,
    notificationPreference: row.notification_preference,
    createdAt: new Date(row.created_at).getTime(),
    position: row.position,
    status: row.status,
  };
}

export function mapNotification(row: NotificationRow): AppNotification {
  return {
    id: row.id,
    bookingId: row.booking_id ?? '',
    salonName: row.salon_name,
    timeSlot: row.time_slot,
    dateStr: row.date_str,
    servicesSummary: row.services_summary,
    timestamp: new Date(row.created_at).getTime(),
    read: row.read,
    type: row.type,
    message: row.message,
  };
}

export function mapFavoriteProfessional(row: FavProRow): SavedProfessional {
  return {
    id: row.pro_id,
    salonId: row.salon_id ?? '',
    name: row.name,
    role: row.role,
    rating: Number(row.rating),
    avatar: row.avatar,
    salonName: row.salon_name,
    skills: asStringArray(row.skills),
  };
}

export function mapFavoriteService(row: FavServiceRow): SavedService {
  return {
    id: row.service_id,
    salonId: row.salon_id ?? '',
    name: row.name,
    durationMinutes: row.duration_minutes,
    price: row.price,
    salonName: row.salon_name,
    category: row.category,
  };
}

/** "Just now" / "2 days ago" style label used throughout the review UI. */
export function formatRelativeDate(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 'Recently';

  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (seconds < 60) return 'Just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks === 1 ? '' : 's'} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;

  const years = Math.floor(days / 365);
  return `${years} year${years === 1 ? '' : 's'} ago`;
}
