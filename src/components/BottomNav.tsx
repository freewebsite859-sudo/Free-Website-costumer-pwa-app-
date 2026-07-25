import React from 'react';
import { Screen } from '../types';

interface BottomNavProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  unreadBookingsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentScreen,
  onNavigate,
  unreadBookingsCount = 0,
}) => {
  if (
    currentScreen === 'splash' ||
    currentScreen === 'welcome' ||
    currentScreen === 'checkout' ||
    currentScreen === 'location-modal' ||
    currentScreen === 'location-permission'
  ) {
    return null;
  }

  const items = [
    { id: 'home' as Screen, label: 'Home', icon: 'home' },
    { id: 'search' as Screen, label: 'Book', icon: 'calendar_month' },
    { id: 'bookings' as Screen, label: 'Bookings', icon: 'event_note', badge: unreadBookingsCount },
    { id: 'rewards' as Screen, label: 'Rewards', icon: 'card_giftcard' },
    { id: 'profile' as Screen, label: 'Profile', icon: 'person' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-2xl pb-safe shadow-[0_-2px_16px_rgba(0,0,0,0.04)] border-t border-[#e8e8e8]/60">
      <div className="flex justify-around items-center h-20 px-2 max-w-md mx-auto">
        {items.map((item) => {
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center gap-1 min-w-[60px] py-1 transition-all active:scale-95 relative ${
                isActive ? 'text-[#e6007e] font-semibold' : 'text-[#5a3f47] hover:text-[#e6007e]'
              }`}
            >
              <div className="relative">
                <span className={`material-symbols-outlined text-[26px] transition-transform ${isActive ? 'scale-110' : ''}`}>
                  {item.icon}
                </span>
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 bg-[#e6007e] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center shadow-sm">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[12px] tracking-tight">{item.label}</span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-[#e6007e] absolute bottom-0" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
