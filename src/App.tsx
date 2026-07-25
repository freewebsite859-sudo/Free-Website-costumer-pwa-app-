import React, { useState, useEffect } from 'react';
import { Screen, Salon, Service, Staff, Booking, UserLocation } from './types';
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
  };

  const handleCancelBooking = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'CANCELLED' } : b))
    );
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

  return (
    <div className="min-h-screen bg-[#fff8f8] text-[#26181c] font-['Inter',sans-serif] relative flex flex-col justify-between">
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
