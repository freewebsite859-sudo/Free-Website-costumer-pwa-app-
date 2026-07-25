import React from 'react';
import { Screen } from '../types';
import { LOGO_URL, AVATAR_URL } from '../data/mockData';

interface HeaderProps {
  currentScreen: Screen;
  title?: string;
  onNavigate: (screen: Screen) => void;
  onBack?: () => void;
  showBack?: boolean;
  unreadNotificationCount?: number;
  onOpenNotifications?: () => void;
  userAvatar?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  title = 'Home',
  onNavigate,
  onBack,
  showBack = false,
  unreadNotificationCount = 0,
  onOpenNotifications,
  userAvatar,
}) => {
  return (
    <header className="fixed top-0 w-full z-50 bg-white/85 backdrop-blur-2xl border-b border-[#e8e8e8]/50 pt-safe">
      <div className="flex items-center justify-between h-16 px-5 max-w-md mx-auto">
        <div className="flex items-center gap-3">
          {showBack ? (
            <button
              onClick={onBack}
              aria-label="Back"
              className="w-10 h-10 -ml-2 flex items-center justify-center text-[#26181c] hover:text-[#e6007e] transition-colors active:scale-95"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back_ios_new</span>
            </button>
          ) : currentScreen === 'home' ? (
            <div className="flex items-center gap-2.5">
              <img
                src={LOGO_URL}
                alt="Nexora Brand Logo"
                className="h-7 w-auto object-contain"
              />
              <span className="font-semibold text-[18px] text-[#26181c] tracking-tight">
                {title}
              </span>
            </div>
          ) : (
            <h1 className="font-semibold text-[18px] text-[#26181c] tracking-tight">
              {title}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Favourites Quick Icon */}
          <button
            onClick={() => onNavigate('favourites')}
            className="w-9 h-9 rounded-full bg-[#fde7f3]/60 hover:bg-[#fde7f3] flex items-center justify-center text-[#e6007e] relative transition-transform active:scale-95 cursor-pointer"
            aria-label="Favourites"
            title="View Favourites"
          >
            <span className="material-symbols-outlined text-[20px] fill-current">
              favorite
            </span>
          </button>

          {/* Notification Bell Icon */}
          <button
            onClick={onOpenNotifications}
            className="w-9 h-9 rounded-full bg-[#fde7f3]/60 hover:bg-[#fde7f3] flex items-center justify-center text-[#26181c] relative transition-transform active:scale-95 cursor-pointer"
            aria-label="Appointment Notifications"
          >
            <span className="material-symbols-outlined text-[20px] text-[#26181c]">
              notifications
            </span>
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#e6007e] text-white text-[10px] font-extrabold rounded-full flex items-center justify-center px-1 border-2 border-white animate-pulse">
                {unreadNotificationCount}
              </span>
            )}
          </button>

          {/* Profile Avatar */}
          <button
            onClick={() => onNavigate('profile')}
            className="relative focus:outline-none ring-2 ring-transparent focus:ring-[#e6007e] rounded-full transition-transform active:scale-95"
            aria-label="Profile Settings"
          >
            <img
              src={userAvatar || AVATAR_URL}
              alt="User Profile Avatar"
              className="w-8 h-8 rounded-full object-cover border border-[#e0bec6]"
            />
          </button>
        </div>
      </div>
    </header>
  );
};

