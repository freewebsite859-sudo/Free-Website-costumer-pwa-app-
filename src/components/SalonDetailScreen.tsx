import React, { useState, useEffect } from 'react';
import { Salon, Service, Staff, ServiceReview, WaitlistEntry } from '../types';
import { ServiceReviewModal } from './ServiceReviewModal';
import { WaitlistModal } from './WaitlistModal';

interface SalonDetailScreenProps {
  salon: Salon;
  selectedServices: Service[];
  selectedStaff: Staff | null;
  onToggleService: (service: Service) => void;
  onSelectStaff: (staff: Staff) => void;
  onProceedToCheckout: () => void;
  onBack: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export const SalonDetailScreen: React.FC<SalonDetailScreenProps> = ({
  salon,
  selectedServices,
  selectedStaff,
  onToggleService,
  onSelectStaff,
  onProceedToCheckout,
  onBack,
  isFavorite,
  onToggleFavorite,
}) => {
  const [activeTab, setActiveTab] = useState<'services' | 'slots' | 'staff' | 'about' | 'reviews'>('services');
  const [activeGalleryIdx, setActiveGalleryIdx] = useState<number>(0);

  // Service Review States
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [reviewModalServiceId, setReviewModalServiceId] = useState<string | undefined>(undefined);
  const [selectedServiceFilter, setSelectedServiceFilter] = useState<string>('all');

  // Waitlist States
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState<boolean>(false);
  const [waitlistTargetSlot, setWaitlistTargetSlot] = useState<{ slot: string; dateStr: string } | null>(null);
  const [selectedSlotDateIdx, setSelectedSlotDateIdx] = useState<number>(0);
  const [waitlistAlertToast, setWaitlistAlertToast] = useState<string | null>(null);

  // Service Category Filter & Accordion States
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategoryCollapse = (cat: string) => {
    setCollapsedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const slotDates = [
    { dayName: 'Wed', dateNum: '24', fullDate: 'Wed 24 Jul' },
    { dayName: 'Thu', dateNum: '25', fullDate: 'Thu 25 Jul' },
    { dayName: 'Fri', dateNum: '26', fullDate: 'Fri 26 Jul' },
    { dayName: 'Sat', dateNum: '27', fullDate: 'Sat 27 Jul' },
  ];

  const currentSlotDate = slotDates[selectedSlotDateIdx] || slotDates[0];

  const timeSlotsWithAvailability = [
    { time: '09:00 AM', isAvailable: false, period: 'Morning' },
    { time: '09:30 AM', isAvailable: false, period: 'Morning' },
    { time: '10:00 AM', isAvailable: true, period: 'Morning' },
    { time: '10:30 AM', isAvailable: true, period: 'Morning' },
    { time: '11:00 AM', isAvailable: true, period: 'Morning' },
    { time: '12:00 PM', isAvailable: true, period: 'Afternoon' },
    { time: '01:00 PM', isAvailable: true, period: 'Afternoon' },
    { time: '03:00 PM', isAvailable: false, period: 'Afternoon' },
    { time: '04:30 PM', isAvailable: true, period: 'Afternoon' },
    { time: '06:00 PM', isAvailable: true, period: 'Evening' },
    { time: '06:30 PM', isAvailable: false, period: 'Evening' },
  ];

  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>(() => {
    const saved = localStorage.getItem('nexora_waitlist_entries');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed parsing waitlist entries', e);
      }
    }
    return [
      {
        id: 'wl-demo-1',
        salonId: salon.id,
        salonName: salon.name,
        serviceNames: [salon.services[0]?.name || 'Balayage & Styling'],
        dateStr: 'Wed 24 Jul',
        timeSlot: '09:00 AM',
        clientName: localStorage.getItem('profile_name') || 'Priya Sharma',
        clientPhone: localStorage.getItem('profile_phone') || '+91 98765 43210',
        notificationPreference: 'both',
        createdAt: Date.now() - 3600000,
        position: 1,
        status: 'ACTIVE',
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('nexora_waitlist_entries', JSON.stringify(waitlistEntries));
  }, [waitlistEntries]);

  const handleOpenWaitlistModal = (slotTime: string) => {
    setWaitlistTargetSlot({ slot: slotTime, dateStr: currentSlotDate.fullDate });
    setIsWaitlistModalOpen(true);
  };

  const handleJoinWaitlistSuccess = (newEntry: WaitlistEntry) => {
    setWaitlistEntries((prev) => [newEntry, ...prev.filter((e) => e.id !== newEntry.id)]);
  };

  const handleSimulateOpening = (entry: WaitlistEntry) => {
    setWaitlistAlertToast(`🔔 WAITLIST ALERT: A spot opened up for ${entry.timeSlot} on ${entry.dateStr} at ${entry.salonName}! Click Book Now before it fills.`);

    setWaitlistEntries((prev) =>
      prev.map((e) => (e.id === entry.id ? { ...e, status: 'NOTIFIED' } : e))
    );
  };

  const handleRemoveWaitlist = (entryId: string) => {
    setWaitlistEntries((prev) => prev.filter((e) => e.id !== entryId));
  };

  const [serviceReviews, setServiceReviews] = useState<ServiceReview[]>(() => {
    const saved = localStorage.getItem(`nexora_service_reviews_${salon.id}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved reviews', e);
      }
    }

    // Default mock reviews for this salon
    const defaultSvc0 = salon.services[0]?.name || 'Balayage & Hair Styling';
    const defaultSvc1 = salon.services[1]?.name || 'Kerastase Hair Spa';
    const defaultSvc2 = salon.services[2]?.name || 'Organic Hydra Facial';

    return [
      {
        id: 'sr-1',
        salonId: salon.id,
        serviceName: defaultSvc0,
        author: 'Ananya Sharma',
        rating: 5,
        date: '2 days ago',
        comment: 'The balayage shade turned out exactly as I envisioned! Gentle bleaching technique with zero brassiness.',
        verifiedBooking: true,
      },
      {
        id: 'sr-2',
        salonId: salon.id,
        serviceName: defaultSvc1,
        author: 'Priya Mehta',
        rating: 5,
        date: '1 week ago',
        comment: 'Deep scalp massager and steaming treatment was immensely relaxing. My hair feels 10x softer.',
        verifiedBooking: true,
      },
      {
        id: 'sr-3',
        salonId: salon.id,
        serviceName: defaultSvc2,
        author: 'Rhea Sen',
        rating: 4.8,
        date: '2 weeks ago',
        comment: 'Thorough blackhead extraction and cold-hammer massage. Face is glowing without any redness.',
        verifiedBooking: true,
      },
      {
        id: 'sr-4',
        salonId: salon.id,
        serviceName: defaultSvc0,
        author: 'Divya Kapoor',
        rating: 4.9,
        date: '3 weeks ago',
        comment: 'Professional colorist who took time to understand my skin tone before recommending the caramel highlights.',
        verifiedBooking: true,
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem(`nexora_service_reviews_${salon.id}`, JSON.stringify(serviceReviews));
  }, [serviceReviews, salon.id]);

  const handleAddReview = (newRev: Omit<ServiceReview, 'id' | 'date'>) => {
    const created: ServiceReview = {
      ...newRev,
      id: `sr-${Date.now()}`,
      date: 'Just now',
    };
    setServiceReviews((prev) => [created, ...prev]);
  };

  const openReviewForService = (serviceId?: string) => {
    setReviewModalServiceId(serviceId);
    setIsReviewModalOpen(true);
  };

  // Helper to compute specific service stats
  const getServiceStats = (serviceName: string) => {
    const matching = serviceReviews.filter((r) => r.serviceName.toLowerCase() === serviceName.toLowerCase());
    if (matching.length === 0) {
      return { rating: 4.8, count: 5 }; // fallback baseline
    }
    const sum = matching.reduce((acc, r) => acc + r.rating, 0);
    const avg = (sum / matching.length).toFixed(1);
    return { rating: parseFloat(avg), count: matching.length };
  };

  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);

  // Group services by category
  const categories: string[] = Array.from(new Set(salon.services.map((s) => s.category)));

  // Filtered reviews list
  const filteredReviews = selectedServiceFilter === 'all'
    ? serviceReviews
    : serviceReviews.filter((r) => r.serviceName === selectedServiceFilter);

  return (
    <div className="flex flex-col w-full relative pb-32">
      {/* Service Review Modal */}
      <ServiceReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        salon={salon}
        preselectedServiceId={reviewModalServiceId}
        onSubmitReview={handleAddReview}
      />

      {/* Waitlist Modal */}
      <WaitlistModal
        isOpen={isWaitlistModalOpen}
        onClose={() => setIsWaitlistModalOpen(false)}
        salon={salon}
        timeSlot={waitlistTargetSlot?.slot || '09:00 AM'}
        dateStr={waitlistTargetSlot?.dateStr || currentSlotDate.fullDate}
        selectedServicesSummary={selectedServices.map((s) => s.name).join(', ')}
        onJoinSuccess={handleJoinWaitlistSuccess}
      />

      {/* Waitlist Cancellation Alert Toast */}
      {waitlistAlertToast && (
        <div className="fixed top-18 inset-x-4 z-50 bg-[#26181c] text-white p-3.5 rounded-2xl shadow-2xl border-2 border-[#e6007e] flex items-start justify-between gap-3 animate-in slide-in-from-top max-w-md mx-auto">
          <div className="flex gap-2.5">
            <span className="material-symbols-outlined text-amber-400 text-[24px] shrink-0 animate-bounce">
              notifications_active
            </span>
            <div className="text-xs">
              <p className="font-bold text-amber-300">Waitlist Alert!</p>
              <p className="text-slate-200 mt-0.5 leading-snug">{waitlistAlertToast}</p>
            </div>
          </div>
          <button
            onClick={() => setWaitlistAlertToast(null)}
            className="text-slate-400 hover:text-white p-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Top Header Back Bar */}

      <div className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-[#e8e8e8]/50 pt-safe max-w-md mx-auto">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-1 min-w-0">
            <button
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center text-[#26181c] hover:text-[#e6007e] transition-colors shrink-0"
              aria-label="Back"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back_ios_new</span>
            </button>
            <h1 className="text-[16px] sm:text-[18px] font-semibold text-[#26181c] truncate">{salon.name}</h1>
          </div>
        </div>
      </div>

      <div className="pt-20">
        {/* Hero Gallery */}
        <div className="relative w-full h-[280px] shrink-0 bg-[#e5e2e1] overflow-hidden">
          <img
            src={salon.gallery[activeGalleryIdx] || salon.image}
            alt={salon.name}
            className="w-full h-full object-cover transition-all duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Gallery Indicators & Sound + Favorite Action */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-between items-center px-5 z-20">
            <div className="flex gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full">
              {salon.gallery.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveGalleryIdx(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === activeGalleryIdx ? 'w-5 bg-white' : 'w-1.5 bg-white/40'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onToggleFavorite}
                className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#e6007e] shadow-md transition-transform active:scale-90"
                aria-label="Favorite"
              >
                <span
                  className={`material-symbols-outlined text-[22px] ${
                    isFavorite ? 'fill-current' : ''
                  }`}
                >
                  favorite
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Header Info */}
        <div className="flex flex-col px-5 pt-4 pb-2 gap-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h2 className="text-[24px] font-bold text-[#26181c] tracking-tight">{salon.name}</h2>
                {salon.verified && (
                  <span
                    className="material-symbols-outlined text-[18px] text-[#0353db]"
                    title="Verified Studio"
                  >
                    verified
                  </span>
                )}
              </div>
              <p className="text-[14px] text-[#5a3f47] flex items-center gap-1 font-medium">
                <span className="material-symbols-outlined text-[16px] text-[#e6007e]">location_on</span>
                {salon.distanceKm} km away • {salon.area}
              </p>
            </div>

            {/* Rating Badge */}
            <div className="flex flex-col items-center bg-[#fce2e7] rounded-2xl p-2.5 shrink-0 min-w-[60px] border border-[#fde7f3]">
              <div className="flex items-center gap-1 text-[#26181c]">
                <span className="text-[18px] font-bold">{salon.rating}</span>
                <span className="material-symbols-outlined text-[16px] text-amber-500">star</span>
              </div>
              <span className="text-[10px] font-medium text-[#5a3f47]">({salon.reviewCount ?? salon.reviewsCount} reviews)</span>
            </div>
          </div>
        </div>

        {/* Sticky Custom Segment Tabs */}
        <div className="sticky top-[64px] z-40 bg-[#fff8f8]/95 backdrop-blur-xl px-5 py-3 border-b border-[#fce2e7]">
          <div className="flex bg-[#ffe8ed] rounded-full p-1 relative w-full h-[44px]">
            <button
              onClick={() => setActiveTab('services')}
              className={`flex-1 text-[12px] sm:text-[13px] font-semibold rounded-full transition-all duration-300 py-2 ${
                activeTab === 'services'
                  ? 'bg-white text-[#26181c] shadow-sm font-bold'
                  : 'text-[#5a3f47] hover:text-[#26181c]'
              }`}
            >
              Services
            </button>
            <button
              onClick={() => setActiveTab('slots')}
              className={`flex-1 text-[12px] sm:text-[13px] font-semibold rounded-full transition-all duration-300 py-2 relative ${
                activeTab === 'slots'
                  ? 'bg-white text-[#e6007e] shadow-sm font-bold'
                  : 'text-[#5a3f47] hover:text-[#26181c]'
              }`}
            >
              Slots & Waitlist
              <span className="absolute -top-1 -right-0.5 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`flex-1 text-[12px] sm:text-[13px] font-semibold rounded-full transition-all duration-300 py-2 ${
                activeTab === 'staff'
                  ? 'bg-white text-[#26181c] shadow-sm font-bold'
                  : 'text-[#5a3f47] hover:text-[#26181c]'
              }`}
            >
              Staff
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`flex-1 text-[12px] sm:text-[13px] font-semibold rounded-full transition-all duration-300 py-2 ${
                activeTab === 'about'
                  ? 'bg-white text-[#26181c] shadow-sm font-bold'
                  : 'text-[#5a3f47] hover:text-[#26181c]'
              }`}
            >
              About
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 text-[12px] sm:text-[13px] font-semibold rounded-full transition-all duration-300 py-2 ${
                activeTab === 'reviews'
                  ? 'bg-white text-[#26181c] shadow-sm font-bold'
                  : 'text-[#5a3f47] hover:text-[#26181c]'
              }`}
            >
              Reviews
            </button>
          </div>
        </div>

        {/* Tab Content Area */}
        <div className="px-5 pt-4 flex-1">
          {/* Services Tab */}
          {activeTab === 'services' && (
            <div className="flex flex-col gap-6 animate-in fade-in">
              {/* Category Filter Pills Bar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none sticky top-[124px] bg-[#fff8f8]/95 backdrop-blur-xl z-30 py-2 -mx-5 px-5 border-b border-[#fce2e7]/50">
                <button
                  onClick={() => setSelectedCategoryFilter('all')}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    selectedCategoryFilter === 'all'
                      ? 'bg-[#e6007e] text-white shadow-sm ring-2 ring-[#e6007e]/30'
                      : 'bg-white text-[#5a3f47] border border-[#fcd5e8] hover:bg-[#fff0f3]'
                  }`}
                >
                  <span>All Services</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedCategoryFilter === 'all' ? 'bg-white/20 text-white' : 'bg-[#fde7f3] text-[#e6007e]'}`}>
                    {salon.services.length}
                  </span>
                </button>

                {categories.map((cat) => {
                  const count = salon.services.filter((s) => s.category === cat).length;
                  const isSel = selectedCategoryFilter === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategoryFilter(cat)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                        isSel
                          ? 'bg-[#e6007e] text-white shadow-sm ring-2 ring-[#e6007e]/30'
                          : 'bg-white text-[#5a3f47] border border-[#fcd5e8] hover:bg-[#fff0f3]'
                      }`}
                    >
                      <span>{cat}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSel ? 'bg-white/20 text-white' : 'bg-[#fde7f3] text-[#e6007e]'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Category Accordion Sections */}
              <div className="flex flex-col gap-4">
                {categories
                  .filter((cat) => selectedCategoryFilter === 'all' || selectedCategoryFilter === cat)
                  .map((cat) => {
                    const catServices = salon.services.filter((s) => s.category === cat);
                    const isCollapsed = collapsedCategories[cat] || false;

                    return (
                      <div
                        key={cat}
                        className="bg-white rounded-2xl border border-[#fcd5e8]/60 shadow-xs overflow-hidden transition-all"
                      >
                        {/* Accordion Header */}
                        <button
                          onClick={() => toggleCategoryCollapse(cat)}
                          className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-[#fff8f8] to-[#fff0f3] hover:from-[#fff0f3] hover:to-[#ffe8ed] transition-colors cursor-pointer text-left"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-8 h-8 rounded-full bg-[#fde7f3] text-[#e6007e] flex items-center justify-center font-bold text-sm shadow-2xs">
                              {cat.charAt(0)}
                            </span>
                            <div>
                              <h3 className="text-[16px] font-bold text-[#26181c]">{cat}</h3>
                              <p className="text-[11px] text-[#5a3f47] font-medium">
                                {catServices.length} {catServices.length === 1 ? 'service' : 'services'} available
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-[#e6007e] bg-white px-2.5 py-1 rounded-full border border-[#fcd5e8]">
                              {isCollapsed ? 'Show Services' : 'Collapse'}
                            </span>
                            <span className="material-symbols-outlined text-[#5a3f47] text-[20px] transition-transform duration-300">
                              {isCollapsed ? 'expand_more' : 'expand_less'}
                            </span>
                          </div>
                        </button>

                        {/* Accordion Body / Services List */}
                        {!isCollapsed && (
                          <div className="p-4 pt-2 flex flex-col gap-3 border-t border-[#fce2e7]/40 bg-white">
                            {catServices.map((service) => {
                              const isSelected = selectedServices.some((s) => s.id === service.id);
                              const stats = getServiceStats(service.name);
                              return (
                                <div
                                  key={service.id}
                                  className={`flex flex-col p-4 rounded-2xl border transition-all ${
                                    isSelected
                                      ? 'border-[#e6007e] bg-[#fff0f2] shadow-xs'
                                      : 'border-slate-100 hover:border-[#fcd5e8] bg-slate-50/50'
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex flex-col gap-1.5 max-w-[65%]">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-[15px] font-semibold text-[#26181c]">
                                          {service.name}
                                        </span>
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#fde7f3] border border-[#fcd5e8] text-[#e6007e] text-[10px] font-bold shrink-0">
                                          <span className="material-symbols-outlined text-[12px]">schedule</span>
                                          {service.durationMinutes} mins
                                        </span>
                                      </div>
                                      <span className="text-[12px] text-[#5a3f47] font-medium">
                                        {service.description || 'Custom treatment'}
                                      </span>
                                    </div>

                                    <div className="flex flex-col items-end gap-1.5">
                                      <span className="text-[18px] font-bold text-[#e6007e]">
                                        ₹{service.price}
                                      </span>
                                      <button
                                        onClick={() => onToggleService(service)}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 cursor-pointer ${
                                          isSelected
                                            ? 'bg-[#e6007e] text-white shadow-xs'
                                            : 'bg-[#fde7f3] text-[#e6007e] hover:bg-[#e6007e] hover:text-white'
                                        }`}
                                        aria-label={isSelected ? 'Remove service' : 'Add service'}
                                      >
                                        <span className="material-symbols-outlined text-[20px]">
                                          {isSelected ? 'check' : 'add'}
                                        </span>
                                      </button>
                                    </div>
                                  </div>

                                  {/* Service Rating & Review Action Bar */}
                                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                                    <div className="flex items-center gap-1.5 bg-[#fff0f3] px-2.5 py-1 rounded-lg border border-[#fcd5e8]">
                                      <span className="material-symbols-outlined text-[14px] text-amber-500">star</span>
                                      <span className="font-extrabold text-[#26181c]">{stats.rating}</span>
                                      <span className="text-[#8c7077] font-medium">({stats.count} reviews)</span>
                                    </div>

                                    <button
                                      onClick={() => openReviewForService(service.id)}
                                      className="text-[#e6007e] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                      <span className="material-symbols-outlined text-[13px]">rate_review</span>
                                      Review Service
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Slots & Waitlist Tab */}
          {activeTab === 'slots' && (
            <div className="flex flex-col gap-5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[18px] font-bold text-[#26181c]">Appointment Time Slots</h3>
                  <p className="text-[11px] text-[#5a3f47]">Select an available slot or join waitlist for filled slots</p>
                </div>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                  <span className="material-symbols-outlined text-[12px]">schedule</span>
                  Live Slots
                </span>
              </div>

              {/* Date Selector Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {slotDates.map((item, idx) => {
                  const isSel = selectedSlotDateIdx === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedSlotDateIdx(idx)}
                      className={`px-3.5 py-2 rounded-2xl flex flex-col items-center min-w-[72px] transition-all cursor-pointer ${
                        isSel
                          ? 'bg-[#e6007e] text-white shadow-sm font-bold scale-105'
                          : 'bg-white text-[#5a3f47] border border-[#f0d8e2] hover:bg-[#fff0f3]'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-medium">{item.dayName}</span>
                      <span className="text-[14px] font-extrabold">{item.dateNum} Jul</span>
                    </button>
                  );
                })}
              </div>

              {/* Active User Waitlists Banner for this salon */}
              {waitlistEntries.filter((e) => e.salonId === salon.id).length > 0 && (
                <div className="bg-gradient-to-r from-amber-50 to-[#fff0f3] p-4 rounded-2xl border border-amber-200 shadow-xs flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#26181c] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-amber-600 text-[18px]">list_alt</span>
                      Your Active Waitlists ({waitlistEntries.filter((e) => e.salonId === salon.id).length})
                    </span>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                      Auto-Notifying
                    </span>
                  </div>

                  <div className="space-y-2">
                    {waitlistEntries.filter((e) => e.salonId === salon.id).map((entry) => (
                      <div
                        key={entry.id}
                        className="bg-white p-3 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#26181c]">
                              {entry.timeSlot} • {entry.dateStr}
                            </span>
                            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                              Queue #{entry.position}
                            </span>
                            {entry.status === 'NOTIFIED' && (
                              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
                                Slot Opened!
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#5a3f47] mt-0.5">
                            Alert via <strong className="uppercase">{entry.notificationPreference}</strong> ({entry.clientPhone})
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 self-end sm:self-auto">
                          <button
                            onClick={() => handleSimulateOpening(entry)}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-white rounded-lg text-[10px] font-extrabold transition-all cursor-pointer shadow-2xs flex items-center gap-0.5 active:scale-95"
                            title="Simulate cancellation alert"
                          >
                            <span className="material-symbols-outlined text-[12px]">bolt</span>
                            Simulate Slot Alert
                          </button>
                          <button
                            onClick={() => handleRemoveWaitlist(entry.id)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Time Slots Grid */}
              <div className="space-y-4">
                {['Morning', 'Afternoon', 'Evening'].map((period) => {
                  const slotsInPeriod = timeSlotsWithAvailability.filter((s) => s.period === period);
                  return (
                    <div key={period} className="bg-white p-4 rounded-2xl border border-[#f0d8e2] shadow-xs">
                      <h4 className="text-xs font-extrabold text-[#5a3f47] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-amber-500">
                          {period === 'Morning' ? 'light_mode' : period === 'Afternoon' ? 'wb_sunny' : 'bedtime'}
                        </span>
                        {period} Slots
                      </h4>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {slotsInPeriod.map((slot) => {
                          if (slot.isAvailable) {
                            return (
                              <button
                                key={slot.time}
                                onClick={onProceedToCheckout}
                                className="p-2.5 rounded-xl bg-[#fff0f3] hover:bg-[#e6007e] hover:text-white border border-[#fcd5e8] text-[#26181c] transition-all cursor-pointer flex flex-col items-center justify-center group active:scale-95"
                              >
                                <span className="text-xs font-bold">{slot.time}</span>
                                <span className="text-[9px] text-[#e6007e] group-hover:text-white font-extrabold">Available</span>
                              </button>
                            );
                          }

                          // FULLY BOOKED SLOT - JOIN WAITLIST BUTTON
                          return (
                            <div
                              key={slot.time}
                              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center gap-1 relative overflow-hidden"
                            >
                              <div className="flex items-center gap-1">
                                <span className="text-xs font-bold text-slate-400 line-through">{slot.time}</span>
                                <span className="text-[9px] font-extrabold bg-slate-200 text-slate-700 px-1 rounded">No slots available</span>
                              </div>

                              <button
                                onClick={() => handleOpenWaitlistModal(slot.time)}
                                className="w-full py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-extrabold transition-all cursor-pointer shadow-2xs flex items-center justify-center gap-0.5 active:scale-95"
                              >
                                <span className="material-symbols-outlined text-[12px]">notifications_active</span>
                                Join Waitlist
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Staff Tab */}
          {activeTab === 'staff' && (
            <div className="flex flex-col gap-4 animate-in fade-in">
              <h3 className="text-[18px] font-bold text-[#26181c]">Select Preferred Stylist</h3>
              <div className="grid grid-cols-2 gap-4">
                {salon.staff.map((member) => {
                  const isChosen = selectedStaff?.id === member.id;
                  return (
                    <div
                      key={member.id}
                      onClick={() => onSelectStaff(member)}
                      className={`flex flex-col items-center p-4 bg-white rounded-2xl shadow-sm border cursor-pointer transition-all active:scale-95 ${
                        isChosen ? 'border-[#e6007e] ring-2 ring-[#e6007e]/30 bg-[#fff0f2]' : 'border-transparent'
                      }`}
                    >
                      <div className="relative w-20 h-20 rounded-full overflow-hidden shadow-sm mb-3">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                        {isChosen && (
                          <div className="absolute inset-0 bg-[#e6007e]/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-[24px]">check_circle</span>
                          </div>
                        )}
                      </div>
                      <span className="text-[16px] font-semibold text-[#26181c]">{member.name}</span>
                      <span className="text-[12px] font-medium text-[#e6007e]">{member.role}</span>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-[13px] text-amber-500">star</span>
                        <span className="text-[11px] text-[#5a3f47] font-medium">
                          {member.rating} ({member.reviewsCount})
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="flex flex-col gap-6 animate-in fade-in">
              <div className="flex flex-col gap-2">
                <h3 className="text-[18px] font-bold text-[#26181c]">About {salon.name}</h3>
                <p className="text-[15px] text-[#5a3f47] leading-relaxed font-normal">
                  {salon.description}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="text-[18px] font-bold text-[#26181c]">Location & Hours</h3>
                <div className="bg-white p-4 rounded-2xl shadow-sm flex flex-col gap-4 border border-[#e8e8e8]">
                  <div className="flex gap-3 items-start">
                    <div className="w-10 h-10 rounded-full bg-[#fde7f3] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[#e6007e] text-[20px]">location_on</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[15px] font-medium text-[#26181c]">{salon.address}</span>
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(salon.name + ' ' + salon.address)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[13px] text-[#e6007e] font-semibold mt-1 hover:underline flex items-center gap-1"
                      >
                        Get Directions
                        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                      </a>
                    </div>
                  </div>

                  <div className="w-full h-px bg-[#fce2e7]" />

                  <div className="flex gap-3 items-start">
                    <div className="w-10 h-10 rounded-full bg-[#fde7f3] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[#e6007e] text-[20px]">schedule</span>
                    </div>
                    <div className="flex flex-col w-full">
                      <div className="flex justify-between w-full">
                        <span className="text-[14px] text-[#26181c] font-medium">Mon - Sat</span>
                        <span className="text-[14px] text-[#5a3f47] font-semibold">{salon.hours}</span>
                      </div>
                      <div className="flex justify-between w-full mt-1">
                        <span className="text-[14px] text-rose-600 font-medium">Sunday</span>
                        <span className="text-[14px] text-[#5a3f47] font-semibold">11:00 AM - 6:00 PM</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="flex flex-col gap-5 animate-in fade-in">
              {/* Header Action Bar */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[18px] font-bold text-[#26181c]">Service Reviews & Feedback</h3>
                  <p className="text-[11px] text-[#5a3f47]">Rated by verified clients after appointment completion</p>
                </div>
                <button
                  onClick={() => openReviewForService()}
                  className="px-3.5 py-2 bg-[#e6007e] hover:bg-[#c9006e] text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <span className="material-symbols-outlined text-[16px]">rate_review</span>
                  Write Review
                </button>
              </div>

              {/* Service Ratings Breakdown Card */}
              <div className="bg-gradient-to-br from-[#fff0f3] to-white rounded-2xl p-4 border border-[#fcd5e8] shadow-xs flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-[#fce2e7] pb-2">
                  <span className="text-xs font-bold text-[#26181c] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[#e6007e] text-[16px]">stars</span>
                    Service Rating Breakdown
                  </span>
                  <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                    Verified Reviews ({serviceReviews.length})
                  </span>
                </div>

                {/* Progress bars for services */}
                <div className="space-y-2">
                  {salon.services.slice(0, 4).map((svc) => {
                    const stats = getServiceStats(svc.name);
                    const percentage = Math.round((stats.rating / 5) * 100);
                    return (
                      <div key={svc.id} className="flex items-center justify-between gap-3 text-xs">
                        <span className="text-[#26181c] font-semibold text-[11px] truncate max-w-[140px]">
                          {svc.name}
                        </span>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                          <div
                            className="h-full bg-gradient-to-r from-amber-400 to-[#e6007e] rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="flex items-center gap-1 shrink-0 text-[11px]">
                          <span className="font-extrabold text-[#26181c]">{stats.rating}</span>
                          <span className="material-symbols-outlined text-[12px] text-amber-500">star</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Service Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setSelectedServiceFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedServiceFilter === 'all'
                      ? 'bg-[#26181c] text-white shadow-xs'
                      : 'bg-white text-[#5a3f47] border border-[#f0d8e2] hover:bg-[#fff0f3]'
                  }`}
                >
                  All Services ({serviceReviews.length})
                </button>
                {salon.services.map((svc) => {
                  const count = serviceReviews.filter((r) => r.serviceName === svc.name).length;
                  return (
                    <button
                      key={svc.id}
                      onClick={() => setSelectedServiceFilter(svc.name)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                        selectedServiceFilter === svc.name
                          ? 'bg-[#e6007e] text-white shadow-xs'
                          : 'bg-white text-[#5a3f47] border border-[#f0d8e2] hover:bg-[#fff0f3]'
                      }`}
                    >
                      <span>{svc.name}</span>
                      {count > 0 && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 font-extrabold">
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Service Reviews List */}
              {filteredReviews.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {filteredReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 bg-white rounded-2xl shadow-sm border border-[#e8e8e8] flex flex-col gap-2 relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[15px] text-[#26181c]">{rev.author}</span>
                            {rev.verifiedBooking && (
                              <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-0.5">
                                <span className="material-symbols-outlined text-[12px]">verified</span>
                                Verified Client
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-[#fde7f3] text-[#e6007e] border border-[#fcd5e8]">
                              🏷️ {rev.serviceName}
                            </span>
                            <span className="text-[11px] text-[#8c7077]">• {rev.date}</span>
                          </div>
                        </div>

                        {/* Rating Badge */}
                        <div className="flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-xl shrink-0">
                          <span className="text-xs font-extrabold">{rev.rating}</span>
                          <span className="material-symbols-outlined text-[14px] text-amber-500">star</span>
                        </div>
                      </div>

                      <p className="text-[14px] text-[#5a3f47] mt-1 leading-relaxed">
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 px-4 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-[32px] text-slate-300">rate_review</span>
                  <p className="text-xs font-bold text-[#26181c]">No reviews yet for "{selectedServiceFilter}"</p>
                  <p className="text-[11px] text-[#5a3f47]">Be the first client to leave a rating and written feedback!</p>
                  <button
                    onClick={() => {
                      const matchedSvc = salon.services.find((s) => s.name === selectedServiceFilter);
                      openReviewForService(matchedSvc?.id);
                    }}
                    className="mt-1 px-3.5 py-1.5 bg-[#e6007e] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                  >
                    Write First Review
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-white/90 backdrop-blur-2xl border-t border-[#e8e8e8] pb-safe z-50 max-w-md mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-col">
            <span className="text-[11px] text-[#5a3f47] font-medium">Selected ({selectedServices.length} items)</span>
            <span className="text-[20px] font-bold text-[#8e004b]">
              ₹{totalPrice > 0 ? totalPrice : salon.startingPrice}
            </span>
          </div>
          {selectedStaff && (
            <div className="text-right">
              <span className="text-[11px] text-[#5a3f47]">Stylist</span>
              <p className="text-[13px] font-semibold text-[#26181c]">{selectedStaff.name}</p>
            </div>
          )}
        </div>

        <button
          onClick={onProceedToCheckout}
          disabled={selectedServices.length === 0}
          className={`w-full h-[52px] rounded-xl font-semibold text-[15px] flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
            selectedServices.length > 0
              ? 'bg-[#e6007e] text-white hover:bg-[#b80663] shadow-[#e6007e]/30'
              : 'bg-[#e0bec6] text-white cursor-not-allowed'
          }`}
        >
          {selectedServices.length > 0 ? 'Book Appointment' : 'Select a Service to Continue'}
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};
