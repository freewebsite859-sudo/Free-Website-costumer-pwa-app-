import React from 'react';
import { Screen } from '../types';
import { LOGO_URL, AVATAR_URL } from '../data/mockData';

interface HeaderProps {
  currentScreen: Screen;
  title?: string;
  onNavigate: (screen: Screen) => void;
  onBack?: () => void;
  showBack?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  title = 'Home',
  onNavigate,
  onBack,
  showBack = false,
}) => {
  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-2xl border-b border-[#e8e8e8]/50 pt-safe">
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
          ) : (
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 group text-left"
            >
              <img
                src={LOGO_URL}
                alt="Nexora Brand Logo"
                className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </button>
          )}

          <h1 className="font-semibold text-[18px] text-[#26181c] tracking-tight">
            {title}
          </h1>
        </div>

        <button
          onClick={() => onNavigate('profile')}
          className="relative focus:outline-none ring-2 ring-transparent focus:ring-[#e6007e] rounded-full transition-transform active:scale-95"
          aria-label="Profile Settings"
        >
          <img
            src={AVATAR_URL}
            alt="User Profile Avatar"
            className="w-8 h-8 rounded-full object-cover border border-[#e0bec6]"
          />
        </button>
      </div>
    </header>
  );
};
