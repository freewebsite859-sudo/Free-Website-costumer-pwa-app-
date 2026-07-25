import React, { useState } from 'react';
import { Salon, Service, Staff } from '../types';

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
  const [activeTab, setActiveTab] = useState<'services' | 'staff' | 'about' | 'reviews'>('services');
  const [activeGalleryIdx, setActiveGalleryIdx] = useState<number>(0);

  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);

  // Group services by category
  const categories = Array.from(new Set(salon.services.map((s) => s.category)));

  const mockReviews = [
    {
      id: 'r1',
      author: 'Ananya Sharma',
      rating: 5,
      date: '2 days ago',
      comment: 'Absolutely in love with my Balayage! Maya is a wizard with hair coloring. Highly recommended studio!',
      service: 'Balayage & Toning',
    },
    {
      id: 'r2',
      author: 'Priya Mehta',
      rating: 5,
      date: '1 week ago',
      comment: 'The Kerastase Hair Spa left my hair feeling so glossy and smooth. Wonderful luxury ambiance.',
      service: 'Kerastase Hair Spa',
    },
    {
      id: 'r3',
      author: 'Rohan Verma',
      rating: 4.8,
      date: '2 weeks ago',
      comment: 'Punctual staff, pristine hygiene, and gentle service. Will visit again.',
      service: 'Men Haircut & Beard Trim',
    },
  ];

  return (
    <div className="flex flex-col w-full relative pb-32">
      {/* Top Header Back Bar */}
      <div className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-[#e8e8e8]/50 pt-safe max-w-md mx-auto">
        <div className="flex items-center h-16 px-4 gap-1">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center text-[#26181c] hover:text-[#e6007e] transition-colors"
            aria-label="Back"
          >
            <span className="material-symbols-outlined text-[24px]">arrow_back_ios_new</span>
          </button>
          <h1 className="text-[18px] font-semibold text-[#26181c] truncate">Booking Detail</h1>
        </div>
      </div>

      <div className="pt-16">
        {/* Hero Gallery */}
        <div className="relative w-full h-[280px] shrink-0 bg-[#e5e2e1] overflow-hidden">
          <img
            src={salon.gallery[activeGalleryIdx] || salon.image}
            alt={salon.name}
            className="w-full h-full object-cover transition-all duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Gallery Indicators & Favorite Action */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-between items-center px-5">
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
              className={`flex-1 text-[13px] font-semibold rounded-full transition-all duration-300 ${
                activeTab === 'services'
                  ? 'bg-white text-[#26181c] shadow-sm'
                  : 'text-[#5a3f47] hover:text-[#26181c]'
              }`}
            >
              Services
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`flex-1 text-[13px] font-semibold rounded-full transition-all duration-300 ${
                activeTab === 'staff'
                  ? 'bg-white text-[#26181c] shadow-sm'
                  : 'text-[#5a3f47] hover:text-[#26181c]'
              }`}
            >
              Staff
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`flex-1 text-[13px] font-semibold rounded-full transition-all duration-300 ${
                activeTab === 'about'
                  ? 'bg-white text-[#26181c] shadow-sm'
                  : 'text-[#5a3f47] hover:text-[#26181c]'
              }`}
            >
              About
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 text-[13px] font-semibold rounded-full transition-all duration-300 ${
                activeTab === 'reviews'
                  ? 'bg-white text-[#26181c] shadow-sm'
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
              {categories.map((cat) => {
                const catServices = salon.services.filter((s) => s.category === cat);
                return (
                  <div key={cat} className="flex flex-col gap-3">
                    <h3 className="text-[18px] font-bold text-[#26181c]">{cat}</h3>
                    <div className="flex flex-col gap-3">
                      {catServices.map((service) => {
                        const isSelected = selectedServices.some((s) => s.id === service.id);
                        return (
                          <div
                            key={service.id}
                            className={`flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border transition-all ${
                              isSelected ? 'border-[#e6007e] bg-[#fff0f2]' : 'border-transparent'
                            }`}
                          >
                            <div className="flex flex-col gap-1 max-w-[65%]">
                              <span className="text-[15px] font-semibold text-[#26181c]">
                                {service.name}
                              </span>
                              <span className="text-[12px] text-[#5a3f47] font-medium">
                                {service.durationMinutes} mins • {service.description || 'Custom treatment'}
                              </span>
                            </div>

                            <div className="flex flex-col items-end gap-1.5">
                              <span className="text-[18px] font-bold text-[#e6007e]">
                                ₹{service.price}
                              </span>
                              <button
                                onClick={() => onToggleService(service)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                                  isSelected
                                    ? 'bg-[#e6007e] text-white'
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
                        );
                      })}
                    </div>
                  </div>
                );
              })}
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
            <div className="flex flex-col gap-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-[18px] font-bold text-[#26181c]">Client Feedback</h3>
                <span className="text-xs text-[#e6007e] font-semibold">100% Verified Bookings</span>
              </div>

              <div className="flex flex-col gap-3">
                {mockReviews.map((rev) => (
                  <div key={rev.id} className="p-4 bg-white rounded-2xl shadow-sm border border-[#e8e8e8]">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-[15px] text-[#26181c]">{rev.author}</span>
                      <div className="flex items-center gap-1 bg-[#ffe8ed] px-2 py-0.5 rounded-lg">
                        <span className="text-xs font-bold text-[#26181c]">{rev.rating}</span>
                        <span className="material-symbols-outlined text-[13px] text-amber-500">star</span>
                      </div>
                    </div>
                    <span className="text-[11px] text-[#8c7077]">{rev.date} • {rev.service}</span>
                    <p className="text-[14px] text-[#5a3f47] mt-2 leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
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
