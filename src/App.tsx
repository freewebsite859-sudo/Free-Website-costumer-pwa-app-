import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Screen, Salon, Service, Staff, Booking, UserLocation, AppNotification, ServiceReview, SavedProfessional, SavedService } from './types';
import {
  MOCK_SALONS,
  INITIAL_BOOKINGS,
  INITIAL_LOCATION,
  LOGO_SQUARE,
} from './data/mockData';
import { readJSON, removeKey, writeJSON } from './utils/storage';
import { createId, createBookingReference } from './utils/id';
import { REVIEWS_UPDATED_EVENT, serviceReviewsKey } from './utils/reviews';
import { useAuth } from './context/AuthContext';
import { useCloudState } from './hooks/useCloudState';
import * as api from './lib/api';
import { SyncBanner } from './components/SyncBanner';

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
  salons: 'nexora_salons_cache',
  location: 'nexora_user_location',
  favorites: 'nexora_favorites',
  favoritePros: 'nexora_favorite_pros',
  favoriteServices: 'nexora_favorite_services',
  bookings: 'nexora_bookings',
  notifications: 'nexora_notifications',
} as const;

const isArray = <T,>(value: unknown): value is T[] => Array.isArray(value);
const isNonEmptyArray = <T,>(value: unknown): value is T[] =>
  Array.isArray(value) && value.length > 0;
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
  const { status: authStatus, user, isOffline, signIn, signUp, signOut, resetPassword } = useAuth();
  const userId = user?.id ?? null;
  // Remote data is only used once we have an authenticated user.
  const cloudEnabled = Boolean(userId);

  const [currentScreen, setCurrentScreen] = useState<Screen>('home');

  // ---- Salon catalog (public read, cached locally for offline) -------------
  const loadSalons = useCallback(() => api.fetchSalons(), []);
  const {
    value: salons,
    error: salonsError,
  } = useCloudState<Salon[]>({
    storageKey: STORAGE_KEYS.salons,
    fallback: MOCK_SALONS,
    validate: isNonEmptyArray,
    load: loadSalons,
    // The catalog is world-readable, so fetch it even when signed out.
    enabled: !isOffline,
  });

  const [selectedSalonId, setSelectedSalonId] = useState<string | null>(null);
  const selectedSalon = useMemo<Salon>(
    () => salons.find((s) => s.id === selectedSalonId) ?? salons[0] ?? MOCK_SALONS[0],
    [salons, selectedSalonId],
  );

  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  // Keep the current selection valid when the catalog finishes loading.
  useEffect(() => {
    setSelectedServices((prev) => {
      if (prev.length > 0) {
        const stillValid = prev.filter((p) => selectedSalon.services.some((s) => s.id === p.id));
        if (stillValid.length > 0) return stillValid;
      }
      return selectedSalon.services.length > 0 ? [selectedSalon.services[0]] : [];
    });
    setSelectedStaff((prev) => {
      if (prev && selectedSalon.staff.some((s) => s.id === prev.id)) return prev;
      return selectedSalon.staff[0] ?? null;
    });
  }, [selectedSalon]);

  // ---- Per-user data -------------------------------------------------------
  const loadLocation = useCallback(async () => {
    if (!userId) return INITIAL_LOCATION;
    const profile = await api.fetchProfile(userId);
    return profile?.location ?? INITIAL_LOCATION;
  }, [userId]);

  const { value: userLocation, setValue: setUserLocation } = useCloudState<UserLocation>({
    storageKey: STORAGE_KEYS.location,
    fallback: INITIAL_LOCATION,
    validate: isUserLocation,
    load: loadLocation,
    enabled: cloudEnabled,
  });

  const loadFavorites = useCallback(
    () => (userId ? api.fetchFavoriteSalonIds(userId) : Promise.resolve<string[]>([])),
    [userId],
  );
  const { value: favorites, setValue: setFavorites } = useCloudState<string[]>({
    storageKey: STORAGE_KEYS.favorites,
    fallback: DEFAULT_FAVORITES,
    validate: isStringArray,
    load: loadFavorites,
    enabled: cloudEnabled,
  });

  const loadFavoritePros = useCallback(
    () => (userId ? api.fetchFavoriteProfessionals(userId) : Promise.resolve<SavedProfessional[]>([])),
    [userId],
  );
  const { value: favoriteProfessionals, setValue: setFavoriteProfessionals } =
    useCloudState<SavedProfessional[]>({
      storageKey: STORAGE_KEYS.favoritePros,
      fallback: DEFAULT_FAVORITE_PROFESSIONALS,
      validate: isArray,
      load: loadFavoritePros,
      enabled: cloudEnabled,
    });

  const loadFavoriteServices = useCallback(
    () => (userId ? api.fetchFavoriteServices(userId) : Promise.resolve<SavedService[]>([])),
    [userId],
  );
  const { value: favoriteServices, setValue: setFavoriteServices } =
    useCloudState<SavedService[]>({
      storageKey: STORAGE_KEYS.favoriteServices,
      fallback: DEFAULT_FAVORITE_SERVICES,
      validate: isArray,
      load: loadFavoriteServices,
      enabled: cloudEnabled,
    });

  const loadBookings = useCallback(
    () => (userId ? api.fetchBookings(userId) : Promise.resolve<Booking[]>([])),
    [userId],
  );
  const {
    value: bookings,
    setValue: setBookings,
    error: bookingsError,
    refresh: refreshBookings,
  } = useCloudState<Booking[]>({
    storageKey: STORAGE_KEYS.bookings,
    fallback: INITIAL_BOOKINGS,
    validate: isArray,
    load: loadBookings,
    enabled: cloudEnabled,
  });

  const [confirmedModalBooking, setConfirmedModalBooking] = useState<Booking | null>(null);

  const loadNotifications = useCallback(
    () => (userId ? api.fetchNotifications(userId) : Promise.resolve<AppNotification[]>([])),
    [userId],
  );
  const { value: notifications, setValue: setNotifications } = useCloudState<AppNotification[]>({
    storageKey: STORAGE_KEYS.notifications,
    fallback: DEFAULT_NOTIFICATIONS,
    validate: isArray,
    load: loadNotifications,
    enabled: cloudEnabled,
  });

  // Surfaced to the user as a dismissible banner rather than a silent console log.
  const [syncError, setSyncError] = useState<string | null>(null);
  useEffect(() => {
    setSyncError(salonsError ?? bookingsError ?? null);
  }, [salonsError, bookingsError]);

  const [activePushOverlay, setActivePushOverlay] = useState<AppNotification | null>(null);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);

  // Local persistence is handled inside useCloudState (it mirrors every write
  // to localStorage so the app keeps working offline).

  // Keeps the latest user id available to callbacks without re-creating them.
  const userIdRef = useRef<string | null>(userId);
  userIdRef.current = userId;

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
        if (userIdRef.current) {
          void api
            .createNotification(userIdRef.current, {
              bookingId: newNotif.bookingId,
              salonName: newNotif.salonName,
              timeSlot: newNotif.timeSlot,
              dateStr: newNotif.dateStr,
              servicesSummary: newNotif.servicesSummary,
              read: false,
              type: newNotif.type,
              message: newNotif.message,
            })
            .catch((e) => console.error('[notifications] persist failed', e));
        }
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
  }, [setBookings, setNotifications]);

  const handleToggleFavorite = (salonId: string) => {
    const wasFavorite = favorites.includes(salonId);
    setFavorites((prev) =>
      prev.includes(salonId) ? prev.filter((id) => id !== salonId) : [...prev, salonId],
    );

    if (!userId) return;
    const request = wasFavorite
      ? api.removeFavoriteSalon(userId, salonId)
      : api.addFavoriteSalon(userId, salonId);
    request.catch((e) => {
      // Roll the optimistic toggle back so the UI matches the server.
      setFavorites((prev) =>
        wasFavorite ? [...prev, salonId] : prev.filter((id) => id !== salonId),
      );
      setSyncError(e instanceof Error ? e.message : String(e));
    });
  };

  const handleSelectSalon = (salon: Salon) => {
    setSelectedSalonId(salon.id);
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

    if (userId) {
      api
        .createBooking(userId, {
          reference: newBooking.id,
          salonId: bookingData.salon.id,
          salonName: bookingData.salon.name,
          services: bookingData.services,
          totalAmount: bookingData.totalAmount,
          dateStr: bookingData.dateStr,
          timeSlot: bookingData.timeSlot,
          staffName: bookingData.staffName,
          locationArea: bookingData.salon.area,
        })
        .then((saved) => {
          // Replace the optimistic row with the server's canonical version.
          setBookings((prev) => prev.map((b) => (b.id === saved.id ? saved : b)));
        })
        .catch((e) => {
          setBookings((prev) => prev.filter((b) => b.id !== newBooking.id));
          setConfirmedModalBooking(null);
          setSyncError(
            `Booking could not be saved: ${e instanceof Error ? e.message : String(e)}`,
          );
        });
    }

    // Auto-schedule preview push notification for new booking after 1.5 seconds
    schedule(() => {
      triggerPushNotificationForBooking(newBooking.id);
    }, 1500);
  };

  const handleCancelBooking = (bookingId: string) => {
    const previous = bookings;
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'CANCELLED' } : b)),
    );
    if (!userId) return;
    api.cancelBooking(userId, bookingId).catch((e) => {
      setBookings(previous);
      setSyncError(e instanceof Error ? e.message : String(e));
    });
  };

  const handleMarkBookingReviewed = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, isReviewed: true } : b)),
    );
    if (!userId) return;
    api
      .markBookingReviewed(userId, bookingId)
      .catch((e) => console.error('[bookings] review flag failed', e));
  };

  const handleAddReviewFromBooking = (
    salonId: string,
    newRev: Omit<ServiceReview, 'id' | 'date'>,
  ) => {
    const notifyListeners = () =>
      window.dispatchEvent(new CustomEvent(REVIEWS_UPDATED_EVENT, { detail: { salonId } }));

    if (userId) {
      api
        .createReview(userId, newRev)
        .then(notifyListeners)
        .catch((e) => setSyncError(e instanceof Error ? e.message : String(e)));
      return;
    }

    // Signed out: keep the previous local-only behaviour.
    const storageKey = serviceReviewsKey(salonId);
    const currentReviews = readJSON<ServiceReview[]>(storageKey, [], isArray);
    const created: ServiceReview = { ...newRev, id: createId('sr'), date: 'Just now' };
    writeJSON(storageKey, [created, ...currentReviews]);
    notifyListeners();
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

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
    } catch (e) {
      setSyncError(e instanceof Error ? e.message : String(e));
    } finally {
      // Clear the local cache so the next user does not inherit this session's data.
      Object.values(STORAGE_KEYS).forEach((key) => removeKey(key));
      setCurrentScreen('welcome');
    }
  }, [signOut]);

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

  // While Supabase restores a persisted session, avoid flashing the login screen.
  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen bg-[#fcf9f8] flex flex-col items-center justify-center gap-3">
        <img src={LOGO_SQUARE} alt="" className="w-16 h-16 rounded-2xl object-contain" />
        <span className="material-symbols-outlined text-[#e6007e] animate-spin text-[28px]">
          progress_activity
        </span>
        <p className="text-[12px] text-[#5a3f47] font-medium">Restoring your session...</p>
      </div>
    );
  }

  // Signed-out users get the welcome/auth screen unless they chose guest mode.
  if (authStatus === 'signed-out' && currentScreen === 'welcome') {
    return (
      <WelcomeScreen
        onContinue={() => setCurrentScreen('home')}
        onSignIn={signIn}
        onSignUp={signUp}
        onResetPassword={resetPassword}
        offline={isOffline}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#fff8f8] text-[#26181c] font-['Inter',sans-serif] relative flex flex-col justify-between">
      <SyncBanner
        message={syncError}
        onDismiss={() => setSyncError(null)}
        offline={isOffline}
      />

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
        onMarkAllAsRead={() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
          if (userId) {
            api
              .markAllNotificationsRead(userId)
              .catch((e) => console.error('[notifications] mark read failed', e));
          }
        }}
        onClearAll={() => {
          setNotifications([]);
          if (userId) {
            api
              .clearNotifications(userId)
              .catch((e) => console.error('[notifications] clear failed', e));
          }
        }}
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
            <WelcomeScreen
              onContinue={() => setCurrentScreen('home')}
              onSignIn={signIn}
              onSignUp={signUp}
              onResetPassword={resetPassword}
              offline={isOffline}
            />
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
                if (userId) {
                  api
                    .removeFavoriteProfessional(userId, proId)
                    .catch((e) => setSyncError(e instanceof Error ? e.message : String(e)));
                }
              }}
              onToggleFavoriteService={(servId) => {
                setFavoriteServices((prev) => prev.filter((s) => s.id !== servId));
                if (userId) {
                  api
                    .removeFavoriteService(userId, servId)
                    .catch((e) => setSyncError(e instanceof Error ? e.message : String(e)));
                }
              }}
              onRestoreProfessional={(pro) => {
                setFavoriteProfessionals((prev) =>
                  prev.some((p) => p.id === pro.id) ? prev : [...prev, pro],
                );
                if (userId) {
                  api
                    .addFavoriteProfessional(userId, pro)
                    .catch((e) => setSyncError(e instanceof Error ? e.message : String(e)));
                }
              }}
              onRestoreService={(service) => {
                setFavoriteServices((prev) =>
                  prev.some((s) => s.id === service.id) ? prev : [...prev, service],
                );
                if (userId) {
                  api
                    .addFavoriteService(userId, service)
                    .catch((e) => setSyncError(e instanceof Error ? e.message : String(e)));
                }
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
              onLogout={handleLogout}
            />
          )}

          {currentScreen === 'location-modal' && (
            <LocationSelectionModal
              currentLocation={userLocation}
              onSelectLocation={(loc) => {
                setUserLocation(loc);
                setCurrentScreen('home');
                if (userId) {
                  api
                    .updateProfile(userId, { location: loc })
                    .catch((e) => console.error('[profile] location save failed', e));
                }
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

