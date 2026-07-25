import { useCallback, useEffect, useRef, useState } from 'react';
import { Screen, Salon, Service, Staff, Booking, UserLocation, AppNotification, ServiceReview, SavedProfessional, SavedService } from './types';
import {
  MOCK_SALONS,
  INITIAL_BOOKINGS,
  INITIAL_LOCATION,
} from './data/mockData';
import { readJSON, writeJSON } from './utils/storage';
import { createId, createBookingReference } from './utils/id';
import { REVIEWS_UPDATED_EVENT, serviceReviewsKey } from './utils/reviews';

import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { SalonDetailScreen } from './components/SalonDetailScreen';
import { CheckoutScreen } from './components/CheckoutScreen';
import { BookingsScreen } from './components/BookingsScreen';
import { SearchScreen } from './components/SearchScreen';
import { FavoritesScreen } from './components/FavoritesScreen';
import { LocationSelectionModal } from './components/LocationSelectionModal';
import { WelcomeScreen } from './components/WelcomeScreen';
import { RewardsScreen } from './components/RewardsScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { SavedAddressesScreen } from './components/SavedAddressesScreen';
import { SupportScreen } from './components/SupportScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { BookingConfirmationModal } from './components/BookingConfirmationModal';
import { NotificationOverlay } from './components/NotificationOverlay';
import { NotificationDrawer } from './components/NotificationDrawer';

const STORAGE_KEYS = {
  location: 'nexora_user_location',
  favorites: 'nexora_favorites',
  favoritePros: 'nexora_favorite_pros',
  favoriteServices: 'nexora_favorite_services',
  bookings: 'nexora_bookings',
  notifications: 'nexora_notifications',
} as const;

const isArray = <T,>(value: unknown): value is T[] => Array.isArray(value);
const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');
const isUserLocation = (value: unknown): value is UserLocation =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as UserLocation).city === 'string' &&
  typeof (value as UserLocation).area === 'string';

const DEFAULT_FAVORITES: string[] = ['aura-premium', 'glam-room'];

/**
 * Screens that render their own fixed top bar (or are full-screen overlays).
 * Rendering the global <Header> for these produced two stacked headers.
 */
const SCREENS_WITHOUT_GLOBAL_HEADER = new Set<Screen>([
  'welcome',
  'splash',
  'location-modal',
  'checkout',
  'salon-detail',
]);

/** Screens that manage their own horizontal padding edge-to-edge. */
const SCREENS_WITHOUT_PADDING = new Set<Screen>([
  'welcome',
  'splash',
  'location-modal',
  'checkout',
  'salon-detail',
]);

const DEFAULT_FAVORITE_PROFESSIONALS: SavedProfessional[] = [
  {
    id: 'pro-1',
    salonId: 'aura-premium',
    name: 'Maya S.',
    role: 'Senior Hair Stylist',
    rating: 4.9,
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    salonName: 'Aura Premium Studio',
    skills: ['Haircut', 'Balayage', 'Coloring'],
  },
  {
    id: 'pro-2',
    salonId: 'glam-room',
    name: 'Arjun K.',
    role: 'Master Grooming Expert',
    rating: 4.8,
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    salonName: 'The Glam Room',
    skills: ['Beard Styling', 'Fade Haircut'],
  },
];

const DEFAULT_FAVORITE_SERVICES: SavedService[] = [
  {
    id: 'srv-1',
    salonId: 'aura-premium',
    name: "Woman's Haircut & Blowdry",
    durationMinutes: 45,
    price: 899,
    salonName: 'Aura Premium Studio',
    category: 'Hair Styling',
  },
  {
    id: 'srv-2',
    salonId: 'luxe-spa',
    name: 'Deep Cleansing Facial Glow',
    durationMinutes: 60,
    price: 1499,
    salonName: 'Luxe Botanicals & Spa',
    category: 'Skincare',
  },
];

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-init-1',
    bookingId: 'bk-101',
    salonName: 'Aura Premium Studio',
    timeSlot: '11:00 AM',
    dateStr: 'Sat, 28 Jul',
    servicesSummary: 'Balayage & Hair Styling',
    timestamp: Date.now() - 300000,
    read: false,
    type: 'reminder_1h',
    message: 'Your appointment at Aura Premium Studio starts in 1 hour at 11:00 AM!',
  },
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [salons] = useState<Salon[]>(MOCK_SALONS);
  const [selectedSalon, setSelectedSalon] = useState<Salon>(MOCK_SALONS[0]);
  const [selectedServices, setSelectedServices] = useState<Service[]>([
    MOCK_SALONS[0].services[0],
  ]);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(
    MOCK_SALONS[0].staff[0] || null
  );

  const [userLocation, setUserLocation] = useState<UserLocation>(() =>
    readJSON<UserLocation>(STORAGE_KEYS.location, INITIAL_LOCATION, isUserLocation),
  );

  const [favorites, setFavorites] = useState<string[]>(() =>
    readJSON<string[]>(STORAGE_KEYS.favorites, DEFAULT_FAVORITES, isStringArray),
  );

  const [favoriteProfessionals, setFavoriteProfessionals] = useState<SavedProfessional[]>(() =>
    readJSON<SavedProfessional[]>(
      STORAGE_KEYS.favoritePros,
      DEFAULT_FAVORITE_PROFESSIONALS,
      isArray,
    ),
  );

  const [favoriteServices, setFavoriteServices] = useState<SavedService[]>(() =>
    readJSON<SavedService[]>(STORAGE_KEYS.favoriteServices, DEFAULT_FAVORITE_SERVICES, isArray),
  );

  const [bookings, setBookings] = useState<Booking[]>(() =>
    readJSON<Booking[]>(STORAGE_KEYS.bookings, INITIAL_BOOKINGS, isArray),
  );

  const [confirmedModalBooking, setConfirmedModalBooking] = useState<Booking | null>(null);

  // Notification States
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    readJSON<AppNotification[]>(STORAGE_KEYS.notifications, DEFAULT_NOTIFICATIONS, isArray),
  );

  const [activePushOverlay, setActivePushOverlay] = useState<AppNotification | null>(null);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);

  // Sync state to storage
  useEffect(() => {
    writeJSON(STORAGE_KEYS.favorites, favorites);
  }, [favorites]);

  useEffect(() => {
    writeJSON(STORAGE_KEYS.favoritePros, favoriteProfessionals);
  }, [favoriteProfessionals]);

  useEffect(() => {
    writeJSON(STORAGE_KEYS.favoriteServices, favoriteServices);
  }, [favoriteServices]);

  useEffect(() => {
    writeJSON(STORAGE_KEYS.bookings, bookings);
  }, [bookings]);

  useEffect(() => {
    writeJSON(STORAGE_KEYS.location, userLocation);
  }, [userLocation]);

  useEffect(() => {
    writeJSON(STORAGE_KEYS.notifications, notifications);
  }, [notifications]);

  // Timers that must be cancelled on unmount so they never call setState on a
  // dead component (and so a pending "snooze" doesn't fire after logout).
  const timeoutsRef = useRef<number[]>([]);

  const schedule = useCallback((fn: () => void, delay: number) => {
    const id = window.setTimeout(() => {
      timeoutsRef.current = timeoutsRef.current.filter((t) => t !== id);
      fn();
    }, delay);
    timeoutsRef.current.push(id);
    return id;
  }, []);

  useEffect(() => {
    const timeouts = timeoutsRef;
    return () => {
      timeouts.current.forEach((id) => window.clearTimeout(id));
      timeouts.current = [];
    };
  }, []);

  // Trigger push notification helper.
  // Uses the functional updater so it always reads the *current* bookings list
  // instead of the snapshot captured when the callback was created.
  const triggerPushNotificationForBooking = useCallback((targetBookingId?: string) => {
    setBookings((currentBookings) => {
      const targetBooking =
        currentBookings.find((b) => b.id === targetBookingId) ||
        currentBookings.find((b) => b.status === 'CONFIRMED' || b.status === 'PENDING') ||
        currentBookings[0];

      if (!targetBooking) return currentBookings;

      const newNotif: AppNotification = {
        id: createId('notif'),
        bookingId: targetBooking.id,
        salonName: targetBooking.salonName,
        timeSlot: targetBooking.timeSlot,
        dateStr: targetBooking.dateStr,
        servicesSummary: targetBooking.services.map((s) => s.name).join(', '),
        timestamp: Date.now(),
        read: false,
        type: 'reminder_1h',
        message: `Your appointment at ${targetBooking.salonName} starts in 1 hour (${targetBooking.timeSlot})!`,
      };

      // Defer the sibling state updates out of this updater so React never warns
      // about updating another component while rendering this one.
      queueMicrotask(() => {
        setNotifications((prev) => [newNotif, ...prev]);
        setActivePushOverlay(newNotif);
      });

      // Trigger Browser Push Notification if browser supports and permitted
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        try {
          new Notification(`⏰ 1-Hour Reminder: ${targetBooking.salonName}`, {
            body: `Your appointment for ${newNotif.servicesSummary} starts in 1 hour at ${targetBooking.timeSlot}.`,
            icon: '/icon.png',
          });
        } catch (e) {
          console.warn('Native push notification error', e);
        }
      }

      return currentBookings;
    });
  }, []);

  const handleToggleFavorite = (salonId: string) => {
    setFavorites((prev) =>
      prev.includes(salonId) ? prev.filter((id) => id !== salonId) : [...prev, salonId]
    );
  };

  const handleSelectSalon = (salon: Salon) => {
    setSelectedSalon(salon);
    setSelectedServices(salon.services.length > 0 ? [salon.services[0]] : []);
    setSelectedStaff(salon.staff.length > 0 ? salon.staff[0] : null);
    setCurrentScreen('salon-detail');
  };

  const handleToggleService = (service: Service) => {
    setSelectedServices((prev) => {
      const exists = prev.some((s) => s.id === service.id);
      if (exists) {
        return prev.filter((s) => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  const handleConfirmBooking = (bookingData: {
    salon: Salon;
    services: Service[];
    totalAmount: number;
    dateStr: string;
    timeSlot: string;
    staffName?: string;
  }) => {
    const newBooking: Booking = {
      id: createBookingReference(),
      salonId: bookingData.salon.id,
      salonName: bookingData.salon.name,
      services: bookingData.services,
      totalAmount: bookingData.totalAmount,
      dateStr: bookingData.dateStr,
      timeSlot: bookingData.timeSlot,
      status: 'CONFIRMED',
      staffName: bookingData.staffName,
      locationArea: bookingData.salon.area,
      createdTime: Date.now(),
    };

    setBookings((prev) => [newBooking, ...prev]);
    setConfirmedModalBooking(newBooking);

    // Auto-schedule preview push notification for new booking after 1.5 seconds
    schedule(() => {
      triggerPushNotificationForBooking(newBooking.id);
    }, 1500);
  };

  const handleCancelBooking = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'CANCELLED' } : b))
    );
  };

  const handleMarkBookingReviewed = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, isReviewed: true } : b))
    );
  };

  const handleAddReviewFromBooking = (salonId: string, newRev: Omit<ServiceReview, 'id' | 'date'>) => {
    const storageKey = serviceReviewsKey(salonId);
    const currentReviews = readJSON<ServiceReview[]>(storageKey, [], isArray);
    const created: ServiceReview = {
      ...newRev,
      id: createId('sr'),
      date: 'Just now',
    };
    writeJSON(storageKey, [created, ...currentReviews]);
    // Let an open SalonDetailScreen know a review was added elsewhere.
    window.dispatchEvent(new CustomEvent(REVIEWS_UPDATED_EVENT, { detail: { salonId } }));
  };

  const handleSnoozeNotification = (id: string) => {
    setActivePushOverlay(null);
    // Re-trigger overlay after 10 seconds for testing/preview.
    // Reads the notification from the latest state rather than a stale closure.
    schedule(() => {
      setNotifications((current) => {
        const snoozedNotif = current.find((n) => n.id === id);
        if (snoozedNotif) {
          queueMicrotask(() =>
            setActivePushOverlay({
              ...snoozedNotif,
              message: `[Snoozed Alert] ${snoozedNotif.salonName} appointment starts soon at ${snoozedNotif.timeSlot}!`,
            }),
          );
        }
        return current;
      });
    }, 10000);
  };

  // Screen Title helper
  const getHeaderTitle = (): string => {
    switch (currentScreen) {
      case 'home':
        return 'Home';
      case 'search':
        return 'Find Salons';
      case 'salon-detail':
        return 'Booking Detail';
      case 'checkout':
        return 'Checkout';
      case 'bookings':
        return 'My Bookings';
      case 'favourites':
        return 'Favourites';
      case 'rewards':
        return 'Rewards & Loyalty';
      case 'profile':
        return 'My Profile';
      case 'saved-addresses':
        return 'Saved Addresses';
      case 'support':
        return 'Help & Support';
      case 'settings':
        return 'App Settings';
      default:
        return 'Nexora';
    }
  };

  // 'salon-detail' and 'checkout' render their own headers, so they are not listed here.
  const showHeaderBack =
    currentScreen === 'search' ||
    currentScreen === 'favourites' ||
    currentScreen === 'saved-addresses' ||
    currentScreen === 'support' ||
    currentScreen === 'settings';
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-[#fff8f8] text-[#26181c] font-['Inter',sans-serif] relative flex flex-col justify-between">
      {/* Floating Interactive Push Notification Overlay */}
      <NotificationOverlay
        notification={activePushOverlay}
        onDismiss={() => setActivePushOverlay(null)}
        onSnooze={handleSnoozeNotification}
        onNavigate={(screen) => setCurrentScreen(screen)}
      />

      {/* Drawer for Notification History and Push Settings */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        notifications={notifications}
        bookings={bookings}
        onMarkAllAsRead={() =>
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        }
        onClearAll={() => setNotifications([])}
        onTriggerTestNotification={triggerPushNotificationForBooking}
        onNavigate={(screen) => setCurrentScreen(screen)}
      />

      {/* Render Header for main views (outside max-w-md container for full viewport width) */}
      {!SCREENS_WITHOUT_GLOBAL_HEADER.has(currentScreen) && (
          <Header
            currentScreen={currentScreen}
            title={getHeaderTitle()}
            onNavigate={(screen) => setCurrentScreen(screen)}
            showBack={showHeaderBack}
            onBack={() => {
              if (
                currentScreen === 'saved-addresses' ||
                currentScreen === 'support' ||
                currentScreen === 'settings'
              ) {
                setCurrentScreen('profile');
              } else {
                setCurrentScreen('home');
              }
            }}
            unreadNotificationCount={unreadCount}
            onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
          />
      )}

      <div className="w-full max-w-md mx-auto flex-1 flex flex-col relative">
        {/* Content Body Container */}
        <main
          className={`flex-1 w-full ${
            SCREENS_WITHOUT_PADDING.has(currentScreen) ? '' : 'px-5'
          } ${SCREENS_WITHOUT_GLOBAL_HEADER.has(currentScreen) ? '' : 'pt-20'}`}
        >
          {currentScreen === 'welcome' && (
            <WelcomeScreen onContinue={() => setCurrentScreen('home')} />
          )}

          {currentScreen === 'home' && (
            <HomeScreen
              location={userLocation}
              salons={salons}
              favorites={favorites}
              bookings={bookings}
              onToggleFavorite={handleToggleFavorite}
              onSelectSalon={handleSelectSalon}
              onNavigate={(s) => setCurrentScreen(s)}
              onOpenLocationSelector={() => setCurrentScreen('location-modal')}
            />
          )}

          {currentScreen === 'search' && (
            <SearchScreen
              salons={salons}
              favorites={favorites}
              locationLabel={[userLocation.area, userLocation.city].filter(Boolean).join(', ')}
              onToggleFavorite={handleToggleFavorite}
              onSelectSalon={handleSelectSalon}
              onBack={() => setCurrentScreen('home')}
            />
          )}

          {currentScreen === 'salon-detail' && (
            <SalonDetailScreen
              salon={selectedSalon}
              selectedServices={selectedServices}
              selectedStaff={selectedStaff}
              onToggleService={handleToggleService}
              onSelectStaff={(staff) => setSelectedStaff(staff)}
              onProceedToCheckout={() => setCurrentScreen('checkout')}
              onBack={() => setCurrentScreen('home')}
              isFavorite={favorites.includes(selectedSalon.id)}
              onToggleFavorite={() => handleToggleFavorite(selectedSalon.id)}
            />
          )}

          {currentScreen === 'checkout' && (
            <CheckoutScreen
              salon={selectedSalon}
              selectedServices={selectedServices}
              selectedStaff={selectedStaff}
              onConfirmBooking={handleConfirmBooking}
              onBack={() => setCurrentScreen('salon-detail')}
            />
          )}

          {currentScreen === 'bookings' && (
            <BookingsScreen
              bookings={bookings}
              salons={salons}
              onNavigate={(s) => setCurrentScreen(s)}
              onCancelBooking={handleCancelBooking}
              onTriggerTestNotification={triggerPushNotificationForBooking}
              onAddReview={handleAddReviewFromBooking}
              onMarkBookingReviewed={handleMarkBookingReviewed}
            />
          )}

          {currentScreen === 'favourites' && (
            <FavoritesScreen
              salons={salons}
              favorites={favorites}
              favoriteProfessionals={favoriteProfessionals}
              favoriteServices={favoriteServices}
              onToggleFavoriteSalon={handleToggleFavorite}
              onToggleFavoriteProfessional={(proId) => {
                setFavoriteProfessionals((prev) => prev.filter((p) => p.id !== proId));
              }}
              onToggleFavoriteService={(servId) => {
                setFavoriteServices((prev) => prev.filter((s) => s.id !== servId));
              }}
              onRestoreProfessional={(pro) => {
                setFavoriteProfessionals((prev) =>
                  prev.some((p) => p.id === pro.id) ? prev : [...prev, pro],
                );
              }}
              onRestoreService={(service) => {
                setFavoriteServices((prev) =>
                  prev.some((s) => s.id === service.id) ? prev : [...prev, service],
                );
              }}
              onSelectSalon={handleSelectSalon}
              onNavigate={(s) => setCurrentScreen(s)}
            />
          )}

          {currentScreen === 'rewards' && <RewardsScreen bookings={bookings} />}

          {currentScreen === 'profile' && (
            <ProfileScreen
              location={userLocation}
              favoritesCount={favorites.length}
              bookings={bookings}
              onNavigate={(s) => setCurrentScreen(s)}
              onOpenLocation={() => setCurrentScreen('location-modal')}
            />
          )}

          {currentScreen === 'saved-addresses' && (
            <SavedAddressesScreen onBack={() => setCurrentScreen('profile')} />
          )}

          {currentScreen === 'support' && (
            <SupportScreen
              onBack={() => setCurrentScreen('profile')}
              onNavigate={(s) => setCurrentScreen(s)}
            />
          )}

          {currentScreen === 'settings' && (
            <SettingsScreen
              onBack={() => setCurrentScreen('profile')}
              onNavigate={(s) => setCurrentScreen(s)}
              onLogout={() => setCurrentScreen('welcome')}
            />
          )}

          {currentScreen === 'location-modal' && (
            <LocationSelectionModal
              currentLocation={userLocation}
              onSelectLocation={(loc) => {
                setUserLocation(loc);
                setCurrentScreen('home');
              }}
              onClose={() => setCurrentScreen('home')}
            />
          )}
        </main>

        {/* Floating Bottom Navigation */}
        <BottomNav
          currentScreen={currentScreen}
          onNavigate={(s) => setCurrentScreen(s)}
          unreadBookingsCount={
            bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'PENDING').length
          }
        />

        {/* Confirmation Modal overlay when booking succeeds */}
        {confirmedModalBooking && (
          <BookingConfirmationModal
            booking={confirmedModalBooking}
            onViewBookings={() => {
              setConfirmedModalBooking(null);
              setCurrentScreen('bookings');
            }}
            onClose={() => {
              setConfirmedModalBooking(null);
              setCurrentScreen('home');
            }}
          />
        )}
      </div>
    </div>
  );
}

