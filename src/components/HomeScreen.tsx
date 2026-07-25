import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Salon, Screen, UserLocation, Booking } from '../types';
import { BANNER_URL, INITIAL_BOOKINGS } from '../data/mockData';

interface HomeScreenProps {
  location: UserLocation;
  salons: Salon[];
  favorites: string[];
  bookings?: Booking[];
  onToggleFavorite: (salonId: string) => void;
  onSelectSalon: (salon: Salon) => void;
  onNavigate: (screen: Screen) => void;
  onOpenLocationSelector: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  location,
  salons,
  favorites,
  bookings,
  onToggleFavorite,
  onSelectSalon,
  onNavigate,
  onOpenLocationSelector,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hasNotifications, setHasNotifications] = useState<boolean>(true);
  const [notificationOpen, setNotificationOpen] = useState<boolean>(false);
  const [recommendationFilter, setRecommendationFilter] = useState<'all' | 'near' | 'category' | 'top'>('all');
  const [topTab, setTopTab] = useState<'frequent' | 'trending'>('frequent');
  // Scroll container ref for smooth horizontal carousel scrolling
  const carouselRef = React.useRef<HTMLDivElement>(null);
  const recCarouselRef = React.useRef<HTMLDivElement>(null);

  const handleScrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleScrollRecCarousel = (direction: 'left' | 'right') => {
    if (recCarouselRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      recCarouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Load user bookings from prop, local storage or mock to determine past service preferences
  const userBookings: Booking[] = useMemo(() => {
    if (bookings && bookings.length > 0) return bookings;
    try {
      const saved = localStorage.getItem('nexora_bookings');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed reading bookings', e);
    }
    return INITIAL_BOOKINGS;
  }, [bookings]);

  // Analysis Logic Block 1: Frequent Services from User Booking History
  const frequentServices = useMemo(() => {
    const serviceMap = new Map<
      string,
      {
        serviceName: string;
        category: string;
        count: number;
        avgPrice: number;
        durationMinutes: number;
        lastSalonName: string;
        lastSalonId: string;
        lastBookedDate?: string;
      }
    >();

    userBookings.forEach((booking) => {
      booking.services.forEach((service) => {
        const key = service.name.trim().toLowerCase();
        const existing = serviceMap.get(key);
        if (existing) {
          existing.count += 1;
        } else {
          serviceMap.set(key, {
            serviceName: service.name,
            category: service.category || 'Beauty',
            count: 1,
            avgPrice: service.price,
            durationMinutes: service.durationMinutes || 45,
            lastSalonName: booking.salonName,
            lastSalonId: booking.salonId,
            lastBookedDate: booking.dateStr,
          });
        }
      });
    });

    const sorted = Array.from(serviceMap.values()).sort((a, b) => b.count - a.count);

    // If user has few distinct services in history, supplement with curated top frequent services
    if (sorted.length < 3) {
      const fallbackFrequent = [
        {
          serviceName: 'HydraGlow Facial',
          category: 'Skin',
          count: 2,
          avgPrice: 1499,
          durationMinutes: 60,
          lastSalonName: salons[0]?.name || 'Aura Premium Salon',
          lastSalonId: salons[0]?.id || '1',
          lastBookedDate: 'Jul 20',
        },
        {
          serviceName: 'Keratin Hair Spa',
          category: 'Hair',
          count: 2,
          avgPrice: 1299,
          durationMinutes: 45,
          lastSalonName: salons[1]?.name || 'Elegance Hair Studio',
          lastSalonId: salons[1]?.id || '2',
          lastBookedDate: 'Jul 15',
        },
        {
          serviceName: 'Gel Polish Nail Art',
          category: 'Nails',
          count: 1,
          avgPrice: 899,
          durationMinutes: 30,
          lastSalonName: salons[2]?.name || 'The Gentlemen\'s Cut',
          lastSalonId: salons[2]?.id || '3',
          lastBookedDate: 'Jul 10',
        },
      ];

      fallbackFrequent.forEach((item) => {
        if (!sorted.some((s) => s.serviceName.toLowerCase() === item.serviceName.toLowerCase())) {
          sorted.push(item);
        }
      });
    }

    return sorted;
  }, [userBookings, salons]);

  // Analysis Logic Block 2: Trending Treatments across local salons
  const trendingTreatments = useMemo(() => {
    const list: Array<{
      serviceName: string;
      category: string;
      price: number;
      durationMinutes: number;
      salon: Salon;
      bookingsThisWeek: number;
      rating: number;
      badgeText: string;
    }> = [];

    salons.forEach((salon) => {
      salon.services.forEach((service) => {
        const isPopular = salon.rating >= 4.6;
        if (isPopular && list.length < 6) {
          const fakeWeeklyBookings = Math.floor(140 + service.price * 0.08 + salon.reviewCount * 0.3);
          list.push({
            serviceName: service.name,
            category: service.category || salon.tags[0] || 'Beauty',
            price: service.price,
            durationMinutes: service.durationMinutes || 45,
            salon,
            bookingsThisWeek: fakeWeeklyBookings,
            rating: salon.rating,
            badgeText: fakeWeeklyBookings > 220 ? '🔥 Hot Demand' : '⭐ Top Choice',
          });
        }
      });
    });

    return list.sort((a, b) => b.bookingsThisWeek - a.bookingsThisWeek);
  }, [salons]);

  // Compute user preferred service categories from past bookings
  const preferredCategories = useMemo(() => {
    const catCounts: Record<string, number> = {};
    userBookings.forEach((b) => {
      b.services.forEach((s) => {
        catCounts[s.category] = (catCounts[s.category] || 0) + 1;
      });
    });
    // Return sorted categories by frequency
    return Object.keys(catCounts).sort((a, b) => catCounts[b] - catCounts[a]);
  }, [userBookings]);

  // Recommendation Heuristic Engine
  const recommendedSalons = useMemo(() => {
    const userAreaLower = location.area.toLowerCase();
    const userCityLower = location.city.toLowerCase();

    const scored = salons.map((salon) => {
      let score = 50; // base score
      const reasons: string[] = [];

      // 1. Location match heuristic
      const areaMatch = salon.area.toLowerCase().includes(userAreaLower) || userAreaLower.includes(salon.area.toLowerCase());
      const cityMatch = salon.city.toLowerCase().includes(userCityLower) || userCityLower.includes(salon.city.toLowerCase());

      if (areaMatch) {
        score += 35;
        reasons.push(`📍 Near ${salon.area}`);
      } else if (cityMatch) {
        score += 20;
        reasons.push(`📍 In ${salon.city}`);
      }

      if (salon.distanceKm <= 1.5) {
        score += 25;
        if (!reasons.some((r) => r.startsWith('📍'))) {
          reasons.push(`📍 Only ${salon.distanceKm} km away`);
        }
      } else if (salon.distanceKm <= 3.0) {
        score += 15;
      }

      // 2. Past Service Category Heuristic
      let hasCategoryMatch = false;
      if (preferredCategories.length > 0) {
        const matchesCategory = salon.services.some((s) =>
          preferredCategories.some((pc) => s.category.toLowerCase().includes(pc.toLowerCase()))
        );
        if (matchesCategory) {
          score += 25;
          hasCategoryMatch = true;
          reasons.push(`💇 Matches your ${preferredCategories[0]} preference`);
        }
      }

      // Fallback service tags match
      if (!hasCategoryMatch && salon.tags.length > 0) {
        reasons.push(`✨ Popular for ${salon.tags[0]}`);
      }

      // 3. Rating & Quality Heuristic
      if (salon.rating >= 4.8) {
        score += 20;
        reasons.push(`⭐ Top Rated (${salon.rating}★)`);
      }
      if (salon.verified) {
        score += 10;
      }

      // Clamp percentage match between 86% and 99%
      const matchPercentage = Math.min(99, Math.max(86, Math.round((score / 150) * 100)));

      return {
        salon,
        score,
        matchPercentage,
        primaryReason: reasons[0] || `📍 ${salon.distanceKm} km in ${salon.area}`,
        secondaryReason: reasons[1] || `⭐ ${salon.rating}★ (${salon.reviewCount || 100}+ reviews)`,
        isLocationMatch: areaMatch || salon.distanceKm <= 2.0,
        isCategoryMatch: hasCategoryMatch,
        isTopRated: salon.rating >= 4.8,
      };
    });

    // Sort by match score descending
    scored.sort((a, b) => b.score - a.score);

    // Apply secondary user filter if selected
    if (recommendationFilter === 'near') {
      return scored.filter((item) => item.isLocationMatch);
    }
    if (recommendationFilter === 'category') {
      return scored.filter((item) => item.isCategoryMatch || item.salon.tags.length > 0);
    }
    if (recommendationFilter === 'top') {
      return scored.filter((item) => item.isTopRated);
    }

    return scored;
  }, [salons, location, preferredCategories, recommendationFilter]);

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

      {/* Frequent Services & Trending Treatments Section (Booking History Analysis) */}
      <section className="flex flex-col gap-3.5 bg-white p-4 sm:p-5 rounded-[28px] border border-[#f0d8e2] shadow-xs">
        {/* Section Header & Tab Switcher */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#fde7f3] text-[#e6007e] flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[20px]">
                  {topTab === 'frequent' ? 'history' : 'trending_up'}
                </span>
              </div>
              <div>
                <h2 className="text-[17px] font-extrabold text-[#26181c] tracking-tight">
                  {topTab === 'frequent' ? 'Frequent Services' : 'Trending Treatments'}
                </h2>
                <p className="text-[11px] text-[#5a3f47]">
                  {topTab === 'frequent'
                    ? 'Analyzed from your booking history for 1-click rebooking'
                    : `Most popular treatments in ${location.area} this week`}
                </p>
              </div>
            </div>

            <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-[#fff0f3] text-[#e6007e] border border-[#fcd5e8] shrink-0">
              {topTab === 'frequent' ? 'History Insights' : 'Popular Now'}
            </span>
          </div>

          {/* Switcher Pills & Scroll Controls */}
          <div className="flex items-center justify-between gap-2 mt-1">
            <div className="flex flex-1 bg-[#f8eff3] p-1 rounded-2xl gap-1">
              <button
                onClick={() => setTopTab('frequent')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  topTab === 'frequent'
                    ? 'bg-white text-[#e6007e] shadow-xs'
                    : 'text-[#5a3f47] hover:text-[#26181c]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">repeat</span>
                Frequent ({frequentServices.length})
              </button>
              <button
                onClick={() => setTopTab('trending')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  topTab === 'trending'
                    ? 'bg-white text-[#e6007e] shadow-xs'
                    : 'text-[#5a3f47] hover:text-[#26181c]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">local_fire_department</span>
                Trending ({trendingTreatments.length})
              </button>
            </div>

            {/* Quick Scroll Navigation Arrows */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => handleScrollCarousel('left')}
                title="Scroll left"
                className="w-8 h-8 rounded-full bg-[#f8eff3] hover:bg-[#f3dbe6] text-[#26181c] flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <button
                onClick={() => handleScrollCarousel('right')}
                title="Scroll right"
                className="w-8 h-8 rounded-full bg-[#f8eff3] hover:bg-[#f3dbe6] text-[#26181c] flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Cards Carousel with Motion Animation & Staggered Entrance */}
        <AnimatePresence mode="wait">
          {topTab === 'frequent' ? (
            <motion.div
              ref={carouselRef}
              key="frequent-tab"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.08,
                    delayChildren: 0.04,
                  },
                },
                exit: { opacity: 0, x: -15, transition: { duration: 0.15 } },
              }}
              initial="hidden"
              animate="show"
              exit="exit"
              className="flex gap-3 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:-mx-5 sm:px-5 scroll-smooth snap-x snap-mandatory"
            >
              {frequentServices.map((item, idx) => {
                const matchedSalon = salons.find((s) => s.id === item.lastSalonId) || salons[0];
                return (
                  <motion.div
                    key={`${item.serviceName}-${idx}`}
                    layout
                    variants={{
                      hidden: { opacity: 0, y: 16, scale: 0.95 },
                      show: {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        transition: { type: 'spring', stiffness: 380, damping: 26 },
                      },
                    }}
                    whileHover={{ y: -4, scale: 1.025, boxShadow: '0 10px 20px -5px rgba(230, 0, 126, 0.12)' }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => matchedSalon && onSelectSalon(matchedSalon)}
                    className="min-w-[230px] max-w-[240px] bg-[#fff8f9] rounded-2xl p-3.5 border border-[#f5d0e0] flex flex-col justify-between hover:border-[#f0a8c8] transition-colors cursor-pointer group shrink-0 select-none snap-start"
                  >
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase bg-[#fde7f3] text-[#e6007e] px-2 py-0.5 rounded-full border border-[#f3c2dc]">
                          Booked {item.count}x
                        </span>
                        <span className="text-[10px] text-[#8c7077] font-medium flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[12px]">schedule</span>
                          {item.durationMinutes} mins
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-[#26181c] group-hover:text-[#e6007e] transition-colors leading-tight mt-1">
                        {item.serviceName}
                      </h3>

                      <p className="text-[11px] text-[#5a3f47] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px] text-[#e6007e]">store</span>
                        {item.lastSalonName}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#f0d8e2]">
                      <div>
                        <span className="text-[9px] text-[#8c7077] block">Avg Price</span>
                        <span className="text-xs font-extrabold text-[#26181c]">₹{item.avgPrice}</span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (matchedSalon) onSelectSalon(matchedSalon);
                        }}
                        className="px-3 py-1.5 bg-[#e6007e] hover:bg-[#c9006e] text-white text-[11px] font-bold rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[13px]">refresh</span>
                        Rebook
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              ref={carouselRef}
              key="trending-tab"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.08,
                    delayChildren: 0.04,
                  },
                },
                exit: { opacity: 0, x: -15, transition: { duration: 0.15 } },
              }}
              initial="hidden"
              animate="show"
              exit="exit"
              className="flex gap-3 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:-mx-5 sm:px-5 scroll-smooth snap-x snap-mandatory"
            >
              {trendingTreatments.map((item, idx) => (
                <motion.div
                  key={`${item.serviceName}-${idx}`}
                  layout
                  variants={{
                    hidden: { opacity: 0, y: 16, scale: 0.95 },
                    show: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: { type: 'spring', stiffness: 380, damping: 26 },
                    },
                  }}
                  whileHover={{ y: -4, scale: 1.025, boxShadow: '0 10px 20px -5px rgba(230, 0, 126, 0.12)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onSelectSalon(item.salon)}
                  className="min-w-[230px] max-w-[240px] bg-[#fff8f9] rounded-2xl p-3.5 border border-[#f5d0e0] flex flex-col justify-between hover:border-[#f0a8c8] transition-colors cursor-pointer group shrink-0 select-none snap-start"
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                        {item.badgeText}
                      </span>
                      <span className="text-[10px] text-[#e6007e] font-extrabold flex items-center gap-0.5">
                        🔥 {item.bookingsThisWeek}+
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[#26181c] group-hover:text-[#e6007e] transition-colors leading-tight mt-1">
                      {item.serviceName}
                    </h3>

                    <p className="text-[11px] text-[#5a3f47] flex items-center gap-1 truncate">
                      <span className="material-symbols-outlined text-[13px] text-[#e6007e] shrink-0">location_on</span>
                      <span className="truncate">{item.salon.name}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#f0d8e2]">
                    <div>
                      <span className="text-[9px] text-[#8c7077] block">Starts at</span>
                      <span className="text-xs font-extrabold text-[#26181c]">₹{item.price}</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSalon(item.salon);
                      }}
                      className="px-3.5 py-1.5 bg-[#26181c] hover:bg-[#e6007e] text-white text-[11px] font-bold rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer flex items-center gap-1"
                    >
                      Explore
                      <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
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

      {/* Recommended For You Section (Heuristic AI Personalization) */}
      <section className="flex flex-col gap-3.5 bg-gradient-to-b from-[#fff2f6] to-white p-4 sm:p-5 rounded-[28px] border border-[#f8d3e2] shadow-xs">
        {/* Section Header */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#e6007e] text-white flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
              </div>
              <div>
                <h2 className="text-[18px] font-extrabold text-[#26181c] tracking-tight">Recommended For You</h2>
                <p className="text-[11px] text-[#5a3f47]">
                  Tailored based on <strong className="text-[#e6007e]">{location.area}</strong> proximity & service history
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-[#fde7f3] text-[#e6007e] border border-[#f3c2dc] hidden sm:inline-block">
                Smart Pick
              </span>

              {/* Scroll Controls */}
              <button
                onClick={() => handleScrollRecCarousel('left')}
                title="Scroll left"
                className="w-7 h-7 rounded-full bg-white hover:bg-[#fde7f3] border border-[#f3c2dc] text-[#26181c] flex items-center justify-center transition-colors active:scale-95 cursor-pointer shadow-2xs"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
              <button
                onClick={() => handleScrollRecCarousel('right')}
                title="Scroll right"
                className="w-7 h-7 rounded-full bg-white hover:bg-[#fde7f3] border border-[#f3c2dc] text-[#26181c] flex items-center justify-center transition-colors active:scale-95 cursor-pointer shadow-2xs"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Heuristic Filter Switcher */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-1 scrollbar-none">
            <button
              onClick={() => setRecommendationFilter('all')}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                recommendationFilter === 'all'
                  ? 'bg-[#26181c] text-white shadow-xs'
                  : 'bg-white text-[#5a3f47] border border-[#f0d8e2] hover:bg-[#fff0f3]'
              }`}
            >
              ✨ Best Match
            </button>
            <button
              onClick={() => setRecommendationFilter('near')}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                recommendationFilter === 'near'
                  ? 'bg-[#e6007e] text-white shadow-xs'
                  : 'bg-white text-[#5a3f47] border border-[#f0d8e2] hover:bg-[#fff0f3]'
              }`}
            >
              📍 Nearby ({location.area.split(',')[0]})
            </button>
            <button
              onClick={() => setRecommendationFilter('category')}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                recommendationFilter === 'category'
                  ? 'bg-[#e6007e] text-white shadow-xs'
                  : 'bg-white text-[#5a3f47] border border-[#f0d8e2] hover:bg-[#fff0f3]'
              }`}
            >
              💇 Hair & Care
            </button>
            <button
              onClick={() => setRecommendationFilter('top')}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                recommendationFilter === 'top'
                  ? 'bg-[#e6007e] text-white shadow-xs'
                  : 'bg-white text-[#5a3f47] border border-[#f0d8e2] hover:bg-[#fff0f3]'
              }`}
            >
              ⭐ Top Rated (4.8+)
            </button>
          </div>
        </div>

        {/* Recommended Salons Horizontal Scrollable Deck with Motion */}
        <AnimatePresence mode="wait">
          <motion.div
            ref={recCarouselRef}
            key={recommendationFilter}
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.08,
                  delayChildren: 0.04,
                },
              },
              exit: { opacity: 0, x: -15, transition: { duration: 0.15 } },
            }}
            initial="hidden"
            animate="show"
            exit="exit"
            className="flex gap-4 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:-mx-5 sm:px-5 scroll-smooth snap-x snap-mandatory"
          >
            {recommendedSalons.slice(0, 5).map(({ salon, matchPercentage, primaryReason, secondaryReason }) => {
              const isFav = favorites.includes(salon.id);
              return (
                <motion.div
                  key={salon.id}
                  layout
                  variants={{
                    hidden: { opacity: 0, y: 16, scale: 0.95 },
                    show: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: { type: 'spring', stiffness: 380, damping: 26 },
                    },
                  }}
                  whileHover={{ y: -4, scale: 1.02, boxShadow: '0 12px 24px -6px rgba(230, 0, 126, 0.15)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelectSalon(salon)}
                  className="min-w-[280px] max-w-[290px] bg-white rounded-2xl border border-[#f0d8e2] overflow-hidden hover:border-[#f0a8c8] transition-colors cursor-pointer group flex flex-col justify-between shrink-0 select-none snap-start"
                >
                  <div>
                    {/* Image & Match Badge Header */}
                    <div className="relative h-36 w-full overflow-hidden bg-slate-100">
                      <img
                        src={salon.image}
                        alt={salon.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Match Score Badge */}
                      <div className="absolute top-3 left-3 bg-[#e6007e] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 border border-white/20">
                        <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
                        {matchPercentage}% Match
                      </div>

                      {/* Favorite Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(salon.id);
                        }}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-[#8c7077] hover:text-[#e6007e] transition-colors"
                        aria-label="Toggle favorite"
                      >
                        <span className={`material-symbols-outlined text-[18px] ${isFav ? 'text-[#e6007e] fill-current' : ''}`}>
                          favorite
                        </span>
                      </button>

                      {/* Reason Tag Pill overlay at bottom of image */}
                      <div className="absolute bottom-2 left-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-white font-medium truncate flex items-center gap-1">
                        <span>{primaryReason}</span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-3.5 flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <h3 className="text-sm font-bold text-[#26181c] truncate max-w-[190px] group-hover:text-[#e6007e] transition-colors">
                            {salon.name}
                          </h3>
                          <p className="text-[11px] text-[#5a3f47] flex items-center gap-1 mt-0.5">
                            <span className="material-symbols-outlined text-[13px] text-[#e6007e]">location_on</span>
                            {salon.area} • {salon.distanceKm} km
                          </p>
                        </div>

                        <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 shrink-0">
                          <span className="material-symbols-outlined text-[13px] text-amber-500">star</span>
                          <span className="text-[11px] font-extrabold text-[#26181c]">{salon.rating}</span>
                        </div>
                      </div>

                      <p className="text-[10px] text-[#8c7077] line-clamp-1 italic">
                        "{secondaryReason}"
                      </p>

                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {salon.tags.slice(0, 2).map((t) => (
                          <span key={t} className="text-[9px] font-bold bg-[#fff0f3] text-[#e6007e] px-2 py-0.5 rounded-full border border-[#fcd5e8]">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="px-3.5 pb-3.5 pt-1 flex items-center justify-between border-t border-[#f7e8ef] mt-1">
                    <div>
                      <span className="text-[9px] text-[#8c7077] block">Starts at</span>
                      <span className="text-xs font-extrabold text-[#26181c]">₹{salon.startingPrice}</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSalon(salon);
                      }}
                      className="px-4 py-1.5 bg-[#e6007e] hover:bg-[#c9006e] text-white text-[11px] font-bold rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer"
                    >
                      View Salon
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
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
