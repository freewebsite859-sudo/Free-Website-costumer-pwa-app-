import React, { useState } from 'react';
import { UserLocation } from '../types';
import {
  LOCATION_PIN_URL,
  POPULAR_CITIES,
  RECENT_LOCATIONS,
  LOGO_SQUARE,
} from '../data/mockData';

interface LocationSelectionModalProps {
  currentLocation: UserLocation;
  onSelectLocation: (loc: UserLocation) => void;
  onClose: () => void;
}

export const LocationSelectionModal: React.FC<LocationSelectionModalProps> = ({
  currentLocation,
  onSelectLocation,
  onClose,
}) => {
  const [viewMode, setViewMode] = useState<'permission' | 'picker'>('permission');
  const [selectedCity, setSelectedCity] = useState<string>(currentLocation.city || 'Mumbai');
  const [selectedArea, setSelectedArea] = useState<string>(currentLocation.area || 'Bandra West');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [showDeniedModal, setShowDeniedModal] = useState<boolean>(false);

  const handleUseGPS = () => {
    setIsLocating(true);
    setTimeout(() => {
      setIsLocating(false);
      const gpsLocation: UserLocation = {
        city: 'Mumbai',
        area: 'Bandra West',
        address: 'Current Location via GPS',
        isGPS: true,
      };
      onSelectLocation(gpsLocation);
    }, 1200);
  };

  const handleConfirmLocation = () => {
    onSelectLocation({
      city: selectedCity,
      area: selectedArea,
      isGPS: false,
    });
  };

  const suggestedAreas = [
    { name: 'Bandra West', city: selectedCity },
    { name: 'Andheri West', city: selectedCity },
    { name: 'Juhu', city: selectedCity },
    { name: 'Powai', city: selectedCity },
    { name: 'Indiranagar', city: 'Bangalore' },
    { name: 'Koramangala', city: 'Bangalore' },
  ];

  const filteredAreas = suggestedAreas.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col max-w-md mx-auto overflow-y-auto animate-in fade-in">
      {/* Fixed Navigation Header */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-xl border-b border-[#e8e8e8]/50 pt-safe max-w-md mx-auto">
        <div className="h-16 px-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="w-10 h-10 -ml-2 flex items-center justify-center text-[#e6007e] transition-transform active:scale-95"
              aria-label="Back"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back_ios_new</span>
            </button>
            <img src={LOGO_SQUARE} alt="Logo" className="h-7 w-7 rounded-lg object-cover shadow-sm" />
            <span className="text-[18px] font-bold text-[#26181c] truncate">
              Location Selection
            </span>
          </div>
        </div>
      </header>

      <main className="pt-20 pb-28 px-5 flex-1 flex flex-col">
        {viewMode === 'permission' ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center my-auto">
            {/* Pulsing Pin Graphic */}
            <div className="relative w-[200px] h-[200px] mb-6 flex items-center justify-center">
              <div className="absolute inset-0 bg-[#e6007e]/10 rounded-full animate-ping opacity-40" />
              <div className="absolute inset-4 bg-[#e6007e]/20 rounded-full animate-pulse opacity-50" />
              <img
                src={LOCATION_PIN_URL}
                alt="Location Pin"
                className="relative z-10 w-full h-full object-contain drop-shadow-xl"
              />
            </div>

            <h2 className="text-[24px] font-bold text-[#26181c] mb-2">Find salons near you</h2>
            <p className="text-[15px] text-[#5a3f47] max-w-[280px] leading-relaxed mb-8">
              Allow location access to see nearby premium salons and available slots tailored to you.
            </p>

            <div className="w-full flex flex-col gap-3">
              <button
                onClick={handleUseGPS}
                disabled={isLocating}
                className="w-full h-[52px] bg-[#e6007e] text-white font-semibold text-[15px] rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#e6007e]/20 active:scale-95 transition-all"
              >
                {isLocating ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[20px]">
                      progress_activity
                    </span>
                    Locating...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">my_location</span>
                    Use My Current Location
                  </>
                )}
              </button>

              <button
                onClick={() => setViewMode('picker')}
                className="w-full h-[52px] bg-[#fde7f3] text-[#e6007e] font-semibold text-[15px] rounded-2xl flex items-center justify-center active:scale-95 transition-all"
              >
                Select Location Manually
              </button>
            </div>

            <p className="text-[12px] text-[#8c7077] mt-6 flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              Your location is only used to show nearby salons.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5 animate-in fade-in">
            {/* Selected City Bar */}
            <div className="bg-[#fff0f2] rounded-2xl p-4 flex items-center justify-between border border-[#fde7f3] shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#ffd9e2] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#8e004b] text-[20px]">
                    location_city
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[12px] font-medium text-[#5a3f47]">Selected City</span>
                  <span className="text-[16px] font-bold text-[#26181c]">{selectedCity}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  const nextCity = selectedCity === 'Mumbai' ? 'Bangalore' : 'Mumbai';
                  setSelectedCity(nextCity);
                }}
                className="text-[12px] font-semibold text-[#e6007e] bg-[#fde7f3] px-3.5 py-1.5 rounded-full hover:bg-[#ffe8ed] active:scale-95 transition-all"
              >
                Change
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#8c7077]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search area in ${selectedCity}`}
                className="w-full h-14 pl-12 pr-4 bg-[#fcf9f8] text-[#26181c] text-[15px] rounded-2xl border border-[#e8e8e8] outline-none focus:ring-2 focus:ring-[#e6007e]/30 transition-all placeholder:text-[#8c7077]"
              />
            </div>

            {/* Popular Cities */}
            <section className="flex flex-col gap-2">
              <h3 className="text-[14px] font-bold text-[#26181c]">Popular Cities</h3>
              <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar -mx-5 px-5">
                {POPULAR_CITIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedCity(c)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedCity === c
                        ? 'bg-[#e6007e] text-white shadow-sm'
                        : 'bg-[#fde7f3] text-[#e6007e] hover:bg-[#ffe8ed]'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </section>

            {/* Suggested Areas */}
            <section className="flex flex-col gap-3">
              <h3 className="text-[15px] font-bold text-[#26181c]">Suggested Areas</h3>
              <div className="bg-white rounded-3xl shadow-sm border border-[#e8e8e8] p-2 flex flex-col gap-1">
                <button
                  onClick={handleUseGPS}
                  className="w-full flex items-center gap-3 p-3.5 rounded-2xl hover:bg-[#fff0f2] text-left transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-[#fde7f3] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[#e6007e] text-[20px]">
                      my_location
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[15px] font-bold text-[#e6007e]">
                      Use Current Location
                    </span>
                    <span className="text-[12px] text-[#5a3f47]">Using GPS</span>
                  </div>
                </button>

                <div className="h-px bg-[#e8e8e8] mx-3 my-0.5" />

                {filteredAreas.map((area) => {
                  const isSelected = selectedArea === area.name;
                  return (
                    <button
                      key={area.name}
                      onClick={() => setSelectedArea(area.name)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-2xl text-left transition-colors ${
                        isSelected ? 'bg-[#fff0f2] font-semibold' : 'hover:bg-[#fcf9f8]'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-[#fce2e7] flex items-center justify-center shrink-0 text-[#5a3f47]">
                        <span className="material-symbols-outlined text-[20px]">map</span>
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="text-[15px] text-[#26181c] font-semibold">{area.name}</span>
                        <span className="text-[12px] text-[#5a3f47]">{area.city}</span>
                      </div>
                      {isSelected && (
                        <span className="material-symbols-outlined text-[#e6007e]">check_circle</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Recent Locations */}
            <section className="flex flex-col gap-2 mt-2">
              <h3 className="text-[14px] font-bold text-[#26181c]">Recent Locations</h3>
              <div className="bg-white rounded-2xl border border-[#e8e8e8] overflow-hidden">
                {RECENT_LOCATIONS.map((loc, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedCity(loc.cityState.split(',')[0]);
                      setSelectedArea(loc.area);
                    }}
                    className="w-full flex items-center gap-3 p-3.5 hover:bg-[#fff0f2] text-left border-b last:border-b-0 border-[#e8e8e8]"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#f6dce2] flex items-center justify-center text-[#5a3f47]">
                      <span className="material-symbols-outlined text-[16px]">location_on</span>
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className="text-[14px] font-semibold text-[#26181c]">{loc.area}</span>
                      <span className="text-[11px] text-[#5a3f47]">{loc.cityState}</span>
                    </div>
                    <span className="material-symbols-outlined text-[#8c7077] text-[18px]">
                      chevron_right
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* Bottom Sticky Action */}
            <div className="fixed bottom-0 left-0 right-0 p-5 bg-white/90 backdrop-blur-xl border-t border-[#e8e8e8] pb-safe z-40 max-w-md mx-auto">
              <button
                onClick={handleConfirmLocation}
                className="w-full h-[52px] bg-[#e6007e] text-white text-[15px] font-semibold rounded-2xl shadow-lg shadow-[#e6007e]/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                Confirm Location
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Permission Denied Modal Simulation */}
      {showDeniedModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-5">
          <div className="bg-white rounded-[24px] p-6 max-w-[320px] shadow-2xl flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[28px]">location_disabled</span>
            </div>
            <h3 className="text-base font-bold text-[#26181c] mb-1">Location Access Denied</h3>
            <p className="text-xs text-[#5a3f47] mb-5">
              Please enable location permissions in browser settings to auto-detect nearby salons.
            </p>
            <button
              onClick={() => {
                setShowDeniedModal(false);
                setViewMode('picker');
              }}
              className="w-full h-11 bg-[#e6007e] text-white font-bold text-xs rounded-xl mb-2"
            >
              Select Manually
            </button>
            <button
              onClick={() => setShowDeniedModal(false)}
              className="py-1 text-xs text-[#8c7077]"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
