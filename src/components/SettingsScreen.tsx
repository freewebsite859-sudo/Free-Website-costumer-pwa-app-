import React, { useState } from 'react';
import { Screen } from '../types';
import { readString, writeString } from '../utils/storage';

interface SettingsScreenProps {
  onBack: () => void;
  onNavigate: (screen: Screen) => void;
  onLogout?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onBack,
  onNavigate,
  onLogout,
}) => {
  // Notification states with localStorage syncing
  const [bookingUpdates, setBookingUpdates] = useState(() => {
    return readString('settings_booking_updates') !== 'false';
  });
  const [appointmentReminders, setAppointmentReminders] = useState(() => {
    return readString('settings_appt_reminders') !== 'false';
  });
  const [rewardsUpdates, setRewardsUpdates] = useState(() => {
    return readString('settings_rewards_updates') !== 'false';
  });
  const [offersPromo, setOffersPromo] = useState(() => {
    return readString('settings_offers_promo') !== 'false';
  });
  const [emailNotifs, setEmailNotifs] = useState(() => {
    return readString('settings_email_notifs') !== 'false';
  });
  const [pushNotifs, setPushNotifs] = useState(() => {
    return readString('settings_push_notifs') !== 'false';
  });

  // Location states.
  // `setPreferredLoc` was never called, so the row always showed a hardcoded
  // city. Derive it from the location the user actually selected instead.
  const preferredLoc = (() => {
    const stored = readString('nexora_user_location');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { area?: string; city?: string };
        const label = [parsed.area, parsed.city].filter(Boolean).join(', ');
        if (label) return label;
      } catch {
        /* fall through to default */
      }
    }
    return readString('user_location_name') || 'Mumbai, Maharashtra';
  })();
  const [useLocAuto, setUseLocAuto] = useState(() => {
    return readString('settings_use_loc_auto') !== 'false';
  });

  // Language state
  const [language, setLanguage] = useState(() => {
    return readString('settings_language') || 'english';
  });

  // Display state
  const [displayMode, setDisplayMode] = useState(() => {
    return readString('settings_display_mode') || 'device';
  });

  // Loading / Interaction states
  const [isUpdating, setIsUpdating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Sync state changes to localStorage and trigger feedback
  const handleToggle = (key: string, val: boolean, setter: (v: boolean) => void, label: string) => {
    setter(val);
    writeString(key, String(val));
    triggerToast(`${label} is now ${val ? 'enabled' : 'disabled'}`);
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    writeString('settings_language', lang);
    triggerToast(lang === 'english' ? 'Language set to English' : 'भाषा हिन्दी में बदली गई');
  };

  const handleDisplayChange = (mode: string) => {
    setDisplayMode(mode);
    writeString('settings_display_mode', mode);
    triggerToast(mode === 'device' ? 'Theme matched to Device setting' : 'Light Mode theme set as default');
  };

  const handleCheckUpdates = () => {
    if (isUpdating) return;
    setIsUpdating(true);
    triggerToast('Checking for updates...');
    setTimeout(() => {
      setIsUpdating(false);
      triggerToast('Nexora is up to date! Version v2.4.0');
    }, 1500);
  };

  const handleInstallApp = () => {
    triggerToast('Nexora app installed successfully on your home screen!');
  };

  const handleLogOutConfirm = () => {
    setShowLogoutModal(false);
    triggerToast('Logging out...');
    setTimeout(() => {
      if (onLogout) {
        onLogout();
      } else {
        onNavigate('welcome');
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col w-full pb-32 animate-in fade-in duration-200">
      {/* In-screen back control (the `onBack` prop was previously unused, so the
          only way out of Settings was the bottom nav, which is hidden here). */}
      <div className="flex items-center gap-3 pt-2 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-[#fde7f3]/60 hover:bg-[#fde7f3] flex items-center justify-center text-[#26181c] transition-colors active:scale-95 cursor-pointer"
          aria-label="Back to profile"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <h1 className="text-[22px] font-bold text-on-surface tracking-tight">Settings</h1>
      </div>

      {/* Toast popup */}
      {toast && (
        <div className="fixed top-20 inset-x-4 z-50 bg-[#26181c] text-white px-4 py-3 rounded-xl shadow-lg border border-[#e0bec6]/30 text-xs font-semibold flex items-center gap-2 max-w-sm mx-auto animate-in slide-in-from-top duration-200">
          <span className="material-symbols-outlined text-[#e6007e] text-lg">check_circle</span>
          <span>{toast}</span>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-[#e8e8e8] shadow-xl flex flex-col gap-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-50 text-[#ba1a1a] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[24px]">logout</span>
            </div>
            <div className="text-center">
              <h3 className="font-bold text-[16px] text-on-surface">Log Out?</h3>
              <p className="text-[12px] text-[#5a3f47] mt-1.5 leading-relaxed">
                Are you sure you want to log out of your Nexora profile? You will need to verify your number again to log back in.
              </p>
            </div>
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 h-11 bg-[#ffe8ed] text-primary font-bold text-xs rounded-xl hover:bg-[#ffd9e2] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleLogOutConfirm}
                className="flex-1 h-11 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col w-full pb-safe">
        {/* Notifications Group */}
        <div className="px-page-margin-mobile pb-6 pt-2">
          <div className="text-caption text-on-surface-variant uppercase tracking-wider mb-stack-sm ml-2">Notifications</div>
          <div className="bg-surface-container-lowest rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#e8e8e8] overflow-hidden">
            {/* Booking Updates */}
            <label className="flex items-center justify-between p-4 bg-surface-container-lowest hover:bg-slate-50/50 transition-colors touch-manipulation cursor-pointer">
              <span className="text-body text-on-surface font-medium">Booking Updates</span>
              <div className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={bookingUpdates}
                  onChange={(e) => handleToggle('settings_booking_updates', e.target.checked, setBookingUpdates, 'Booking Updates')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-outline-variant rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"></div>
              </div>
            </label>
            <div className="h-px bg-outline-subtle mx-4"></div>

            {/* Appointment Reminders */}
            <label className="flex items-center justify-between p-4 bg-surface-container-lowest hover:bg-slate-50/50 transition-colors touch-manipulation cursor-pointer">
              <span className="text-body text-on-surface font-medium">Appointment Reminders</span>
              <div className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={appointmentReminders}
                  onChange={(e) => handleToggle('settings_appt_reminders', e.target.checked, setAppointmentReminders, 'Appointment Reminders')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-outline-variant rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"></div>
              </div>
            </label>
            <div className="h-px bg-outline-subtle mx-4"></div>

            {/* Rewards Updates */}
            <label className="flex items-center justify-between p-4 bg-surface-container-lowest hover:bg-slate-50/50 transition-colors touch-manipulation cursor-pointer">
              <span className="text-body text-on-surface font-medium">Rewards Updates</span>
              <div className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rewardsUpdates}
                  onChange={(e) => handleToggle('settings_rewards_updates', e.target.checked, setRewardsUpdates, 'Rewards Updates')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-outline-variant rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"></div>
              </div>
            </label>
            <div className="h-px bg-outline-subtle mx-4"></div>

            {/* Offers and Promotions */}
            <label className="flex items-center justify-between p-4 bg-surface-container-lowest hover:bg-slate-50/50 transition-colors touch-manipulation cursor-pointer">
              <span className="text-body text-on-surface font-medium">Offers and Promotions</span>
              <div className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={offersPromo}
                  onChange={(e) => handleToggle('settings_offers_promo', e.target.checked, setOffersPromo, 'Offers and Promotions')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-outline-variant rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"></div>
              </div>
            </label>
            <div className="h-px bg-outline-subtle mx-4"></div>

            {/* Email Notifications */}
            <label className="flex items-center justify-between p-4 bg-surface-container-lowest hover:bg-slate-50/50 transition-colors touch-manipulation cursor-pointer">
              <span className="text-body text-on-surface font-medium">Email Notifications</span>
              <div className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailNotifs}
                  onChange={(e) => handleToggle('settings_email_notifs', e.target.checked, setEmailNotifs, 'Email Notifications')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-outline-variant rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"></div>
              </div>
            </label>
            <div className="h-px bg-outline-subtle mx-4"></div>

            {/* Push Notifications */}
            <label className="flex items-center justify-between p-4 bg-surface-container-lowest hover:bg-slate-50/50 transition-colors touch-manipulation cursor-pointer">
              <span className="text-body text-on-surface font-medium">Push Notifications</span>
              <div className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={pushNotifs}
                  onChange={(e) => handleToggle('settings_push_notifs', e.target.checked, setPushNotifs, 'Push Notifications')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-outline-variant rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"></div>
              </div>
            </label>
          </div>
        </div>

        {/* Location Group */}
        <div className="px-page-margin-mobile pb-6">
          <div className="text-caption text-on-surface-variant uppercase tracking-wider mb-stack-sm ml-2">Location</div>
          <div className="bg-surface-container-lowest rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#e8e8e8] overflow-hidden">
            <div className="w-full flex items-center justify-between p-4 bg-surface-container-lowest text-left">
              <div>
                <span className="block text-body text-on-surface font-medium">Preferred Location</span>
                <span className="block text-caption text-on-surface-variant mt-0.5">{preferredLoc}</span>
              </div>
              <span className="material-symbols-outlined text-outline">chevron_right</span>
            </div>
            <div className="h-px bg-outline-subtle mx-4"></div>

            <button
              type="button"
              onClick={() => {
                onNavigate('location-modal');
              }}
              className="w-full flex items-center justify-between p-4 bg-surface-container-lowest active:bg-slate-50 transition-colors text-left cursor-pointer"
            >
              <span className="text-body text-on-surface font-medium">Change Location</span>
              <span className="material-symbols-outlined text-outline">chevron_right</span>
            </button>
            <div className="h-px bg-outline-subtle mx-4"></div>

            <label className="flex items-center justify-between p-4 bg-surface-container-lowest hover:bg-slate-50/50 transition-colors touch-manipulation cursor-pointer">
              <span className="text-body text-on-surface font-medium">Use Location Automatically</span>
              <div className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={useLocAuto}
                  onChange={(e) => handleToggle('settings_use_loc_auto', e.target.checked, setUseLocAuto, 'Auto Location detection')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-outline-variant rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"></div>
              </div>
            </label>
          </div>
        </div>

        {/* Language Group */}
        <div className="px-page-margin-mobile pb-6">
          <div className="text-caption text-on-surface-variant uppercase tracking-wider mb-stack-sm ml-2">Language</div>
          <div className="bg-surface-container-lowest rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#e8e8e8] overflow-hidden flex flex-col">
            <label
              onClick={() => handleLanguageChange('english')}
              className="flex items-center justify-between p-4 cursor-pointer active:bg-slate-50 transition-colors"
            >
              <span className="text-body text-on-surface font-medium">English</span>
              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors border-primary">
                {language === 'english' && <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>}
              </div>
              <input type="radio" name="language" checked={language === 'english'} readOnly className="hidden" />
            </label>
            <div className="h-px bg-outline-subtle mx-4"></div>

            <label
              onClick={() => handleLanguageChange('hindi')}
              className="flex items-center justify-between p-4 cursor-pointer active:bg-slate-50 transition-colors"
            >
              <span className="text-body text-on-surface font-medium">हिन्दी</span>
              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors border-outline-variant">
                {language === 'hindi' && <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>}
              </div>
              <input type="radio" name="language" checked={language === 'hindi'} readOnly className="hidden" />
            </label>
          </div>
        </div>

        {/* Display Group */}
        <div className="px-page-margin-mobile pb-6">
          <div className="text-caption text-on-surface-variant uppercase tracking-wider mb-stack-sm ml-2">Display</div>
          <div className="bg-surface-container-lowest rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#e8e8e8] overflow-hidden flex flex-col">
            <label
              onClick={() => handleDisplayChange('device')}
              className="flex items-center justify-between p-4 cursor-pointer active:bg-slate-50 transition-colors"
            >
              <span className="text-body text-on-surface font-medium">Use Device Setting</span>
              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors border-primary">
                {displayMode === 'device' && <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>}
              </div>
              <input type="radio" name="display" checked={displayMode === 'device'} readOnly className="hidden" />
            </label>
            <div className="h-px bg-outline-subtle mx-4"></div>

            <label
              onClick={() => handleDisplayChange('light')}
              className="flex items-center justify-between p-4 cursor-pointer active:bg-slate-50 transition-colors"
            >
              <span className="text-body text-on-surface font-medium">Light Mode</span>
              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors border-outline-variant">
                {displayMode === 'light' && <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>}
              </div>
              <input type="radio" name="display" checked={displayMode === 'light'} readOnly className="hidden" />
            </label>
          </div>
        </div>

        {/* Privacy Group */}
        <div className="px-page-margin-mobile pb-6">
          <div className="text-caption text-on-surface-variant uppercase tracking-wider mb-stack-sm ml-2">Privacy</div>
          <div className="bg-surface-container-lowest rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#e8e8e8] overflow-hidden flex flex-col">
            <button
              onClick={() => triggerToast('Location permission is currently managed by your browser settings.')}
              className="w-full flex items-center justify-between p-4 bg-surface-container-lowest active:bg-slate-50 transition-colors text-left cursor-pointer"
            >
              <div>
                <span className="block text-body text-on-surface font-medium">Location Permission</span>
                <span className="block text-caption text-on-surface-variant mt-0.5">While Using App</span>
              </div>
              <span className="material-symbols-outlined text-outline">chevron_right</span>
            </button>
            <div className="h-px bg-outline-subtle mx-4"></div>

            <button
              onClick={() => triggerToast('Notification settings are managed securely by your system.')}
              className="w-full flex items-center justify-between p-4 bg-surface-container-lowest active:bg-slate-50 transition-colors text-left cursor-pointer"
            >
              <div>
                <span className="block text-body text-on-surface font-medium">Notification Permission</span>
                <span className="block text-caption text-on-surface-variant mt-0.5">Allowed</span>
              </div>
              <span className="material-symbols-outlined text-outline">chevron_right</span>
            </button>
            <div className="h-px bg-outline-subtle mx-4"></div>

            <button
              onClick={() => triggerToast('Nexora encrypts all local data storage. No data is shared with third parties.')}
              className="w-full flex items-center justify-between p-4 bg-surface-container-lowest active:bg-slate-50 transition-colors text-left cursor-pointer"
            >
              <span className="text-body text-on-surface font-medium">Manage Personal Data</span>
              <span className="material-symbols-outlined text-outline">chevron_right</span>
            </button>
          </div>
        </div>

        {/* App Info Group */}
        <div className="px-page-margin-mobile pb-6">
          <div className="text-caption text-on-surface-variant uppercase tracking-wider mb-stack-sm ml-2">App Info</div>
          <div className="bg-surface-container-lowest rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#e8e8e8] overflow-hidden flex flex-col">
            <button
              onClick={handleInstallApp}
              className="w-full flex items-center justify-between p-4 bg-surface-container-lowest active:bg-slate-50 transition-colors text-left group cursor-pointer"
            >
              <span className="text-body text-primary font-medium group-active:opacity-80 transition-opacity">Install Nexora App</span>
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>download</span>
            </button>
            <div className="h-px bg-outline-subtle mx-4"></div>

            <button
              onClick={handleCheckUpdates}
              disabled={isUpdating}
              className="w-full flex items-center justify-between p-4 bg-surface-container-lowest active:bg-slate-50 transition-colors text-left cursor-pointer disabled:opacity-75"
            >
              <div>
                <span className="block text-body text-on-surface font-medium">Check for Updates</span>
                <span className="block text-caption text-on-surface-variant mt-0.5">Version v2.4.0</span>
              </div>
              {isUpdating ? (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="material-symbols-outlined text-outline">refresh</span>
              )}
            </button>
          </div>
        </div>

        {/* Log Out Button */}
        <div className="px-page-margin-mobile pb-12 pt-6 flex justify-center">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="text-label-md text-error font-medium px-6 py-2.5 rounded-full active:bg-error-container/50 hover:bg-red-50 transition-colors cursor-pointer"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};
