import React, { useState, useEffect } from 'react';
import { Screen, Salon, Service, Staff, Booking, UserLocation, AppNotification } from './types';
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
import { LocationSelectionModal } from './components/LocationSelectionModal';
import { WelcomeScreen } from './components/WelcomeScreen';
import { RewardsScreen } from './components/RewardsScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { BookingConfirmationModal } from './components/BookingConfirmationModal';
import { NotificationOverlay } from './components/NotificationOverlay';
import { NotificationDrawer } from './components/NotificationDrawer';

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

  const [userLocation, setUserLocation] = useState<UserLocation>(() => {
    const saved = localStorage.getItem('nexora_user_location');
    return saved ? JSON.parse(saved) : INITIAL_LOCATION;
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('nexora_favorites');
    return saved ? JSON.parse(saved) : ['aura-premium', 'glam-room'];
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

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('nexora_favorites', JSON.stringify(favorites));
  }, [favorites]);

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
  }) => {
    const newBooking: Booking = {
      id: `NX-${Math.floor(1000 + Math.random() * 9000)}`,
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
    setTimeout(() => {
      triggerPushNotificationForBooking(newBooking.id);
    }, 1500);
  };

  const handleCancelBooking = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'CANCELLED' } : b))
    );
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
      case 'rewards':
        return 'Rewards & Loyalty';
      case 'profile':
        return 'My Profile';
      default:
        return 'Nexora';
    }
  };

  const showHeaderBack = currentScreen === 'search' || currentScreen === 'salon-detail' || currentScreen === 'checkout';
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

      <div className="w-full max-w-md mx-auto flex-1 flex flex-col relative min-h-screen">
        {/* Render Header for main views */}
        {currentScreen !== 'welcome' &&
          currentScreen !== 'splash' &&
          currentScreen !== 'location-modal' && (
            <Header
              currentScreen={currentScreen}
              title={getHeaderTitle()}
              onNavigate={(screen) => setCurrentScreen(screen)}
              showBack={showHeaderBack}
              onBack={() => {
                if (currentScreen === 'checkout') setCurrentScreen('salon-detail');
                else if (currentScreen === 'salon-detail') setCurrentScreen('home');
                else if (currentScreen === 'search') setCurrentScreen('home');
                else setCurrentScreen('home');
              }}
              unreadNotificationCount={unreadCount}
              onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
            />
          )}

        {/* Content Body Container */}
        <main
          className={`flex-1 w-full px-5 ${
            currentScreen !== 'welcome' &&
            currentScreen !== 'splash' &&
            currentScreen !== 'location-modal'
              ? 'pt-16'
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
              onNavigate={(s) => setCurrentScreen(s)}
              onCancelBooking={handleCancelBooking}
              onTriggerTestNotification={triggerPushNotificationForBooking}
            />
          )}

          {currentScreen === 'rewards' && <RewardsScreen bookings={bookings} />}

          {currentScreen === 'profile' && (
            <ProfileScreen
              location={userLocation}
              favoritesCount={favorites.length}
              onNavigate={(s) => setCurrentScreen(s)}
              onOpenLocation={() => setCurrentScreen('location-modal')}
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

