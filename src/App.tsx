import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import { Screen, Salon, Service, Staff, Booking, UserLocation, AppNotification, ServiceReview, SavedProfessional, SavedService } from './types';
import {
  MOCK_SALONS,
  INITIAL_BOOKINGS,
  INITIAL_LOCATION,
} from './data/mockData';

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
import { LoginScreen } from './components/auth/LoginScreen';
import { SignUpScreen } from './components/auth/SignUpScreen';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authScreen, setAuthScreen] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [salons] = useState<Salon[]>(MOCK_SALONS);
  const [selectedSalon, setSelectedSalon] = useState<Salon>(MOCK_SALONS[0]);
  const [selectedServices, setSelectedServices] = useState<Service[]>([
    MOCK_SALONS[0].services[0],
  ]);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(
    MOCK_SALONS[0].staff[0] || null
  );

  const [userLocation, setUserLocation] = useState<UserLocation>(() => {
    const saved = localStorage.getItem('nexora_user_location');
    return saved ? JSON.parse(saved) : INITIAL_LOCATION;
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('nexora_favorites');
    return saved ? JSON.parse(saved) : ['aura-premium', 'glam-room'];
  });

  const [favoriteProfessionals, setFavoriteProfessionals] = useState<SavedProfessional[]>(() => {
    const saved = localStorage.getItem('nexora_favorite_pros');
    return saved ? JSON.parse(saved) : [
      {
        id: 'pro-1',
        salonId: 'aura-premium',
        name: 'Maya S.',
        role: 'Senior Hair Stylist',
        rating: 4.9,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        salonName: 'Aura Premium Salon',
        skills: ['Haircut', 'Balayage', 'Coloring']
      },
      {
        id: 'pro-2',
        salonId: 'glam-room',
        name: 'Arjun K.',
        role: 'Master Grooming Expert',
        rating: 4.8,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        salonName: 'The Glam Room',
        skills: ['Beard Styling', 'Fade Haircut']
      }
    ];
  });

  const [favoriteServices, setFavoriteServices] = useState<SavedService[]>(() => {
    const saved = localStorage.getItem('nexora_favorite_services');
    return saved ? JSON.parse(saved) : [
      {
        id: 'srv-1',
        salonId: 'aura-premium',
        name: "Woman's Haircut & Blowdry",
        durationMinutes: 45,
        price: 899,
        salonName: 'Aura Premium Salon',
        category: 'Hair Styling'
      },
      {
        id: 'srv-2',
        salonId: 'luxe-spa',
        name: 'Deep Cleansing Facial Glow',
        durationMinutes: 60,
        price: 1499,
        salonName: 'Luxe Botanicals & Spa',
        category: 'Skincare'
      }
    ];
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('nexora_bookings');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  const [confirmedModalBooking, setConfirmedModalBooking] = useState<Booking | null>(null);

  // Notification States
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('nexora_notifications');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'notif-init-1',
        bookingId: 'bk-101',
        salonName: 'Aura Premium Salon',
        timeSlot: '11:00 AM',
        dateStr: 'Sat, 28 Jul',
        servicesSummary: 'Balayage & Hair Styling',
        timestamp: Date.now() - 300000,
        read: false,
        type: 'reminder_1h',
        message: 'Your appointment at Aura Premium Salon starts in 1 hour at 11:00 AM!',
      },
    ];
  });

  const [activePushOverlay, setActivePushOverlay] = useState<AppNotification | null>(null);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [profileAvatar, setProfileAvatar] = useState<string>(() => {
    return localStorage.getItem('profile_avatar') || '';
  });

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('nexora_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('nexora_favorite_pros', JSON.stringify(favoriteProfessionals));
  }, [favoriteProfessionals]);

  useEffect(() => {
    localStorage.setItem('nexora_favorite_services', JSON.stringify(favoriteServices));
  }, [favoriteServices]);

  useEffect(() => {
    localStorage.setItem('nexora_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('nexora_user_location', JSON.stringify(userLocation));
  }, [userLocation]);

  useEffect(() => {
    localStorage.setItem('nexora_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Trigger push notification helper
  const triggerPushNotificationForBooking = (targetBookingId?: string) => {
    const targetBooking =
      bookings.find((b) => b.id === targetBookingId) ||
      bookings.find((b) => b.status === 'CONFIRMED' || b.status === 'PENDING') ||
      bookings[0];

    if (!targetBooking) return;

    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
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

    setNotifications((prev) => [newNotif, ...prev]);
    setActivePushOverlay(newNotif);

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
  };

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
    status?: 'CONFIRMED' | 'payment_pending';
    bookingId?: string;
  }, onSuccess?: () => void) => {
    const status = bookingData.status || 'CONFIRMED';
    
    if (bookingData.bookingId) {
       // Update existing
       const existingBooking = bookings.find(b => b.id === bookingData.bookingId);
       if (!existingBooking) return;
       
       const updatedBooking = { ...existingBooking, status: status };
       setBookings((prev) => prev.map(b => b.id === bookingData.bookingId ? updatedBooking : b));
       
       if (status === 'CONFIRMED') {
          setConfirmedModalBooking(updatedBooking);
          setTimeout(() => {
            if (updatedBooking) triggerPushNotificationForBooking(updatedBooking.id);
          }, 1500);
          if (onSuccess) onSuccess();
       }
       return updatedBooking;
    }

    const newBooking: Booking = {
      id: `NX-${Math.floor(1000 + Math.random() * 9000)}`,
      salonId: bookingData.salon.id,
      salonName: bookingData.salon.name,
      services: bookingData.services,
      totalAmount: bookingData.totalAmount,
      dateStr: bookingData.dateStr,
      timeSlot: bookingData.timeSlot,
      status: status,
      staffName: bookingData.staffName,
      locationArea: bookingData.salon.area,
      createdTime: Date.now(),
    };

    setBookings((prev) => [newBooking, ...prev]);

    if (status === 'CONFIRMED') {
      setConfirmedModalBooking(newBooking);

      // Simulate sending WhatsApp confirmation
      setTimeout(() => {
        console.log(`Sending WhatsApp confirmation to user for booking: ${newBooking.id}`);
        alert(`WhatsApp Notification: Your booking at ${newBooking.salonName} is confirmed! (Booking ID: ${newBooking.id})`);
      }, 500);

      // Auto-schedule preview push notification for new booking after 1.5 seconds
      setTimeout(() => {
        triggerPushNotificationForBooking(newBooking.id);
      }, 1500);
      if (onSuccess) onSuccess();
      setCurrentScreen('home');
    }
    
    return newBooking;
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
    const storageKey = `nexora_service_reviews_${salonId}`;
    const saved = localStorage.getItem(storageKey);
    let currentReviews: ServiceReview[] = [];
    if (saved) {
      try {
        currentReviews = JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    const created: ServiceReview = {
      ...newRev,
      id: `sr-${Date.now()}`,
      date: 'Just now',
    };
    const updatedReviews = [created, ...currentReviews];
    localStorage.setItem(storageKey, JSON.stringify(updatedReviews));
  };

  const handleSnoozeNotification = (id: string) => {
    setActivePushOverlay(null);
    // Re-trigger overlay after 10 seconds for testing/preview
    setTimeout(() => {
      const snoozedNotif = notifications.find((n) => n.id === id);
      if (snoozedNotif) {
        setActivePushOverlay({
          ...snoozedNotif,
          message: `[Snoozed Alert] ${snoozedNotif.salonName} appointment starts soon at ${snoozedNotif.timeSlot}!`,
        });
      }
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
        return 'Help Home';
      case 'settings':
        return 'App Settings';
      default:
        return 'Nexora';
    }
  };

  const showHeaderBack =
    currentScreen === 'search' ||
    currentScreen === 'salon-detail' ||
    currentScreen === 'checkout' ||
    currentScreen === 'favourites' ||
    currentScreen === 'saved-addresses' ||
    currentScreen === 'support' ||
    currentScreen === 'settings';
  const unreadCount = notifications.filter((n) => !n.read).length;

  if (authLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!user) {
    return authScreen === 'login' ? (
      <LoginScreen onToggleAuth={() => setAuthScreen('signup')} />
    ) : (
      <SignUpScreen onToggleAuth={() => setAuthScreen('login')} />
    );
  }

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
      {currentScreen !== 'welcome' &&
        currentScreen !== 'splash' &&
        currentScreen !== 'location-modal' && currentScreen !== 'salon-detail' && currentScreen !== 'checkout' && (
          <Header
            currentScreen={currentScreen}
            title={getHeaderTitle()}
            onNavigate={(screen) => setCurrentScreen(screen)}
            showBack={showHeaderBack}
            onBack={() => {
              if (currentScreen === 'checkout') setCurrentScreen('salon-detail');
              else if (currentScreen === 'salon-detail') setCurrentScreen('home');
              else if (currentScreen === 'search') setCurrentScreen('home');
              else if (currentScreen === 'saved-addresses') setCurrentScreen('profile');
              else if (currentScreen === 'support') setCurrentScreen('profile');
              else if (currentScreen === 'settings') setCurrentScreen('profile');
              else setCurrentScreen('home');
            }}
            unreadNotificationCount={unreadCount}
            onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
            userAvatar={profileAvatar}
          />
        )}

      <div className="w-full max-w-md mx-auto flex-1 flex flex-col relative">
        {/* Content Body Container */}
        <main
          className={`flex-1 w-full ${
            currentScreen !== 'welcome' &&
            currentScreen !== 'splash' &&
            currentScreen !== 'location-modal' && currentScreen !== 'salon-detail' && currentScreen !== 'checkout'
              ? 'px-5 pt-20'
              : ''
          }`}
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
              bookings={bookings}
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
              onAvatarUpdate={(newAvatar) => setProfileAvatar(newAvatar)}
            />
          )}

          {currentScreen === 'saved-addresses' && (
            <SavedAddressesScreen
              onBack={() => setCurrentScreen('profile')}
              onNavigate={(s) => setCurrentScreen(s)}
            />
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
              onLogout={() => {
                supabase.auth.signOut();
                setCurrentScreen('welcome');
              }}
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

