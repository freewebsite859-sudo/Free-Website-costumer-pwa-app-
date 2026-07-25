import React, { useState } from 'react';
import { AVATAR_URL } from '../data/mockData';
import { Screen, UserLocation } from '../types';

interface ProfileScreenProps {
  location: UserLocation;
  favoritesCount: number;
  onNavigate: (screen: Screen) => void;
  onOpenLocation: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  location,
  favoritesCount,
  onNavigate,
  onOpenLocation,
}) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);

  return (
    <div className="flex flex-col w-full gap-5 pb-28 pt-2 animate-in fade-in">
      {/* Profile Info Header Card */}
      <div className="bg-white rounded-[24px] p-5 shadow-sm border border-[#e8e8e8] flex items-center gap-4">
        <img
          src={AVATAR_URL}
          alt="User Profile"
          className="w-16 h-16 rounded-full object-cover border-2 border-[#e6007e]"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <h2 className="text-[18px] font-bold text-[#26181c] truncate">Priya Sharma</h2>
            <span className="material-symbols-outlined text-[16px] text-[#0353db]" title="Verified Profile">
              verified
            </span>
          </div>
          <p className="text-[13px] text-[#5a3f47] font-medium">+91 98765 43210</p>
          <p className="text-[11px] text-[#e6007e] font-semibold mt-0.5">priya.sharma@example.com</p>
        </div>
      </div>

      {/* Menu Options Group */}
      <div className="bg-white rounded-2xl border border-[#e8e8e8] overflow-hidden shadow-sm">
        <button
          onClick={onOpenLocation}
          className="w-full flex items-center justify-between p-4 hover:bg-[#fff0f2] transition-colors text-left border-b border-[#e8e8e8]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#fde7f3] flex items-center justify-center text-[#e6007e]">
              <span className="material-symbols-outlined text-[20px]">location_on</span>
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#26181c]">Saved Location</p>
              <p className="text-[12px] text-[#5a3f47]">{location.area}, {location.city}</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-[#8c7077]">chevron_right</span>
        </button>

        <button
          onClick={() => onNavigate('search')}
          className="w-full flex items-center justify-between p-4 hover:bg-[#fff0f2] transition-colors text-left border-b border-[#e8e8e8]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#fde7f3] flex items-center justify-center text-[#e6007e]">
              <span className="material-symbols-outlined text-[20px]">favorite</span>
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#26181c]">Favorite Salons</p>
              <p className="text-[12px] text-[#5a3f47]">{favoritesCount} saved studios</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-[#8c7077]">chevron_right</span>
        </button>

        <button
          onClick={() => onNavigate('bookings')}
          className="w-full flex items-center justify-between p-4 hover:bg-[#fff0f2] transition-colors text-left border-b border-[#e8e8e8]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#fde7f3] flex items-center justify-center text-[#e6007e]">
              <span className="material-symbols-outlined text-[20px]">receipt_long</span>
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#26181c]">Payment History</p>
              <p className="text-[12px] text-[#5a3f47]">UPI, Cards, & Cash at Salon</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-[#8c7077]">chevron_right</span>
        </button>

        <div className="flex items-center justify-between p-4 border-b border-[#e8e8e8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#ffe8ed] flex items-center justify-center text-[#8e004b]">
              <span className="material-symbols-outlined text-[20px]">notifications</span>
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#26181c]">Appointment Reminders</p>
              <p className="text-[12px] text-[#5a3f47]">SMS & Push notifications</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={(e) => setNotificationsEnabled(e.target.checked)}
            className="w-5 h-5 accent-[#e6007e] rounded cursor-pointer"
          />
        </div>

        <button
          onClick={() => alert('Support team hotline: +91 1800 123 4567')}
          className="w-full flex items-center justify-between p-4 hover:bg-[#fff0f2] transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#ffe8ed] flex items-center justify-center text-[#8e004b]">
              <span className="material-symbols-outlined text-[20px]">support_agent</span>
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#26181c]">Help & Support</p>
              <p className="text-[12px] text-[#5a3f47]">24/7 Concierge Service</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-[#8c7077]">chevron_right</span>
        </button>
      </div>

      <button
        onClick={() => onNavigate('welcome')}
        className="w-full h-12 bg-rose-50 text-rose-600 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-rose-100 transition-colors"
      >
        <span className="material-symbols-outlined text-[18px]">logout</span>
        Log Out
      </button>
    </div>
  );
};
