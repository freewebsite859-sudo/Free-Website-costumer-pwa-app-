export type Screen = 
  | 'splash' 
  | 'welcome' 
  | 'home' 
  | 'search' 
  | 'salon-detail' 
  | 'checkout' 
  | 'bookings' 
  | 'location-modal' 
  | 'location-permission'
  | 'popular-cities'
  | 'rewards' 
  | 'profile';

export type BookingStatus = 'CONFIRMED' | 'PENDING' | 'PAST' | 'CANCELLED';

export interface Service {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  category: string;
  description?: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  rating: number;
  reviewsCount: number;
  avatar: string;
}

export interface Salon {
  id: string;
  name: string;
  area: string;
  city: string;
  distanceKm: number;
  rating: number;
  reviewCount: number;
  reviewsCount: number;
  verified: boolean;
  isNew?: boolean;
  image: string;
  gallery: string[];
  startingPrice: number;
  tags: string[];
  genderCategory?: 'Unisex' | 'Women Only' | 'Men Only';
  address: string;
  hours: string;
  description: string;
  services: Service[];
  staff: Staff[];
}

export interface Booking {
  id: string;
  salonId: string;
  salonName: string;
  services: Service[];
  totalAmount: number;
  dateStr: string; // e.g. "Sat, 28 Jul"
  timeSlot: string; // e.g. "11:00 AM"
  status: BookingStatus;
  staffName?: string;
  locationArea: string;
  createdTime: number;
}

export interface UserLocation {
  city: string;
  area: string;
  address?: string;
  isGPS: boolean;
}

export interface LoyaltyTier {
  id: 'bronze' | 'silver' | 'gold' | 'platinum';
  name: string;
  minBookings: number;
  maxBookings: number | null;
  multiplier: string;
  icon: string;
  gradient: string;
  badgeBg: string;
  badgeText: string;
  accentColor: string;
  perks: string[];
}

export interface AppNotification {
  id: string;
  bookingId: string;
  salonName: string;
  timeSlot: string;
  dateStr: string;
  servicesSummary: string;
  timestamp: number;
  read: boolean;
  type: 'reminder_1h' | 'booking_confirmed' | 'general';
  message: string;
}

export interface ServiceReview {
  id: string;
  salonId: string;
  serviceId?: string;
  serviceName: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verifiedBooking?: boolean;
}

export interface WaitlistEntry {
  id: string;
  salonId: string;
  salonName: string;
  serviceNames: string[];
  dateStr: string;
  timeSlot: string;
  clientName: string;
  clientPhone: string;
  notificationPreference: 'sms' | 'push' | 'both';
  createdAt: number;
  position: number;
  status: 'ACTIVE' | 'NOTIFIED' | 'EXPIRED' | 'CANCELLED';
}

