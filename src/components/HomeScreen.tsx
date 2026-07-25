import React, { useState } from 'react';
import { Salon, Screen, UserLocation } from '../types';
import { BANNER_URL } from '../data/mockData';

interface HomeScreenProps {
  location: UserLocation;
  salons: Salon[];
  favorites: string[];
  onToggleFavorite: (salonId: string) => void;
  onSelectSalon: (salon: Salon) => void;
  onNavigate: (screen: Screen) => void;
  onOpenLocationSelector: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  location,
  salons,
  favorites,
  onToggleFavorite,
  onSelectSalon,
  onNavigate,
  onOpenLocationSelector,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hasNotifications, setHasNotifications] = useState<boolean>(true);
  const [notificationOpen, setNotificationOpen] = useState<boolean>(false);

  const categories = [
    { id: 'All', label: 'All', icon: 'auto_awesome' },
    { id: 'Hair', label: 'Hair', icon: 'content_cut' },
    { id: 'Skin', label: 'Skin', icon: 'spa' },
    { id: 'Nails', label: 'Nails', icon: 'pan_tool_alt' },
    { id: 'Spa', label: 'Spa', icon: 'self_care' },
    { id: 'Makeup', label: 'Makeup', icon: 'face_retouching_natural' },
  ];

  const filteredSalons = salons.filter((salon) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      salon.tags.some((t) => t.toLowerCase().includes(selectedCategory.toLowerCase())) ||
      salon.services.some((s) => s.category.toLowerCase().includes(selectedCategory.toLowerCase()));

    const matchesSearch =
      searchQuery.trim() === '' ||
      salon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      salon.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
      salon.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col w-full gap-6 pb-28 pt-2">
      {/* Header Location & Notification */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[13px] font-medium text-[#5a3f47]">Current Location</span>
            <button
              onClick={onOpenLocationSelector}
              className="flex items-center gap-1.5 group text-left transition-colors"
            >
              <span className="text-[18px] font-semibold text-[#26181c] group-hover:text-[#e6007e]">
                {location.area}
              </span>
              <span className="material-symbols-outlined text-[20px] text-[#e6007e] transition-transform group-hover:translate-y-0.5">
                expand_more
              </span>
            </button>
          </div>

          <div className="relative">
            <button
              aria-label="Notifications"
              onClick={() => {
                setNotificationOpen(!notificationOpen);
                setHasNotifications(false);
              }}
              className="relative p-2.5 rounded-full bg-[#fce2e7] text-[#26181c] hover:bg-[#f6dce2] active:scale-95 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              {hasNotifications && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#e6007e] ring-2 ring-[#fce2e7] animate-pulse" />
              )}
            </button>

            {notificationOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#e8e8e8] p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm text-[#26181c]">Notifications</span>
                  <span className="text-[11px] text-[#e6007e] font-medium">Clear all</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#fff0f2] border border-[#fde7f3]">
                    <p className="font-semibold text-[#8e004b]">Appointment Confirmed 🎉</p>
                    <p className="text-[#5a3f47] mt-0.5">Aura Premium Salon on Sat, 28 Jul at 11:00 AM</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#fcf9f8] border border-[#e8e8e8]">
                    <p className="font-semibold text-[#26181c]">Flat 30% Off Facials Today</p>
                    <p className="text-[#5a3f47] mt-0.5">Valid on all HydraGlow and Radiance peels.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full shadow-sm rounded-2xl overflow-hidden">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-[#8c7077]">search</span>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search salon, service, or area"
            className="w-full h-14 pl-12 pr-12 bg-white text-[16px] text-[#26181c] placeholder:text-[#e0bec6] outline-none focus:bg-[#fff0f2] transition-colors rounded-2xl"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-3 flex items-center text-[#8c7077] hover:text-[#e6007e]"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate('search')}
              className="absolute inset-y-0 right-2 flex items-center p-2 text-[#e6007e] rounded-full hover:bg-[#fde7f3] transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">tune</span>
            </button>
          )}
        </div>
      </section>

      {/* Category Horizontal Scroll */}
      <section className="-mx-5 px-5 overflow-x-auto hide-scrollbar">
        <div className="flex gap-4 pb-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className="flex flex-col items-center gap-2 min-w-[68px] group transition-transform active:scale-95"
              >
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-sm ${
                    isSelected
                      ? 'bg-[#e6007e] text-white shadow-md shadow-[#e6007e]/20'
                      : 'bg-[#fce2e7] text-[#5a3f47] group-hover:bg-[#fde7f3] group-hover:text-[#e6007e]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[28px]">{cat.icon}</span>
                </div>
                <span
                  className={`text-[13px] font-medium transition-colors ${
                    isSelected ? 'text-[#e6007e] font-semibold' : 'text-[#26181c]'
                  }`}
                >
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Special Offers Glassmorphic Banner */}
      <section className="relative w-full rounded-[24px] overflow-hidden shadow-md group cursor-pointer" onClick={() => onNavigate('search')}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#8e004b]/90 to-[#b80663]/90 z-10 mix-blend-multiply transition-opacity group-hover:opacity-90" />
        <div
          className="absolute inset-0 bg-cover bg-center z-0 scale-105 transition-transform duration-700 group-hover:scale-110"
          style={{ backgroundImage: `url('${BANNER_URL}')` }}
        />
        <div className="relative z-20 p-6 flex flex-col items-start gap-3 h-[180px] justify-between bg-black/10">
          <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30 inline-flex items-center gap-1.5 shadow-sm">
            <span className="material-symbols-outlined text-[14px] text-white">local_fire_department</span>
            <span className="text-[12px] text-white font-semibold tracking-wider uppercase">Flash Sale</span>
          </div>
          <div className="flex flex-col">
            <h3 className="text-[24px] text-white font-bold leading-tight drop-shadow-sm">
              Flat 30% Off
            </h3>
            <p className="text-[15px] text-white/90 font-medium">On premium facials today</p>
          </div>
        </div>
      </section>

      {/* Curated For You */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-bold text-[#26181c] tracking-tight">Curated For You</h2>
          <button
            onClick={() => onNavigate('search')}
            className="text-[13px] text-[#e6007e] font-semibold hover:text-[#b80663] transition-colors"
          >
            See All
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {filteredSalons.map((salon) => {
            const isFav = favorites.includes(salon.id);
            return (
              <div
                key={salon.id}
                className="flex flex-col bg-white rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-all duration-300 group"
              >
                {/* Salon Image Header */}
                <div
                  className="relative w-full h-[200px] cursor-pointer overflow-hidden"
                  onClick={() => onSelectSalon(salon)}
                >
                  <img
                    src={salon.image}
                    alt={salon.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    {salon.verified && (
                      <div className="bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                        <span className="material-symbols-outlined text-[14px] text-[#0353db]">verified</span>
                        <span className="text-[12px] text-[#26181c] font-semibold">Verified</span>
                      </div>
                    )}
                    {salon.isNew && (
                      <div className="bg-[#e6007e]/90 backdrop-blur-sm px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                        <span className="text-[12px] text-white font-semibold">New</span>
                      </div>
                    )}
                  </div>

                  {/* Favorite Toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(salon.id);
                    }}
                    className="absolute top-4 right-4 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-[#8c7077] shadow-sm hover:text-[#e6007e] active:scale-90 transition-all"
                    aria-label="Toggle favorite"
                  >
                    <span
                      className={`material-symbols-outlined text-[20px] ${
                        isFav ? 'text-[#e6007e] fill-current' : ''
                      }`}
                    >
                      favorite
                    </span>
                  </button>
                </div>

                {/* Card Content */}
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3
                        onClick={() => onSelectSalon(salon)}
                        className="text-[18px] text-[#26181c] font-semibold line-clamp-1 cursor-pointer hover:text-[#e6007e] transition-colors"
                      >
                        {salon.name}
                      </h3>
                      <p className="text-[14px] text-[#5a3f47] flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-[16px] text-[#e6007e]">location_on</span>
                        <span className="truncate">
                          {salon.distanceKm} km • {salon.area}
                        </span>
                      </p>
                    </div>

                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1 bg-[#ffe8ed] py-1 px-2 rounded-lg">
                        <span className="material-symbols-outlined text-[16px] text-amber-500">star</span>
                        <span className="text-[13px] text-[#26181c] font-bold">{salon.rating}</span>
                      </div>
                      <span className="text-[11px] text-[#8c7077] mt-0.5">({salon.reviewCount ?? salon.reviewsCount}+ reviews)</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {salon.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 bg-[#f6dce2] text-[#26181c] text-[12px] font-medium rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Pricing & Action */}
                  <div className="flex items-center justify-between mt-1 pt-3 border-t border-[#fce2e7]">
                    <div className="flex flex-col">
                      <span className="text-[12px] text-[#8c7077]">Services from</span>
                      <span className="text-[18px] font-bold text-[#26181c]">₹{salon.startingPrice}</span>
                    </div>
                    <button
                      onClick={() => onSelectSalon(salon)}
                      className="h-10 px-6 bg-[#8e004b] text-white text-[13px] font-semibold rounded-xl hover:bg-[#e6007e] active:scale-95 transition-all shadow-sm"
                    >
                      Book
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredSalons.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl p-6">
              <span className="material-symbols-outlined text-[48px] text-[#e0bec6] mb-2">search_off</span>
              <h3 className="font-semibold text-[#26181c]">No salons found</h3>
              <p className="text-sm text-[#5a3f47] mt-1">Try clearing filters or changing search keywords.</p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
                className="mt-4 px-4 py-2 bg-[#fde7f3] text-[#e6007e] rounded-xl text-xs font-semibold"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
