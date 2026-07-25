import React, { useState } from 'react';
import { WELCOME_BG_URL, LOGO_SQUARE } from '../data/mockData';

interface WelcomeScreenProps {
  onContinue: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onContinue }) => {
  const [isSplash, setIsSplash] = useState<boolean>(true);
  const [authMode, setAuthMode] = useState<'welcome' | 'login' | 'signup'>('welcome');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [simulatedState, setSimulatedState] = useState<'normal' | 'offline' | 'update'>('normal');

  // Auto transition from splash after 1.8 seconds unless manually testing states
  React.useEffect(() => {
    if (simulatedState === 'normal') {
      const timer = setTimeout(() => {
        setIsSplash(false);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [simulatedState]);

  if (isSplash) {
    return (
      <div className="fixed inset-0 z-50 bg-[#fcf9f8] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        {/* Main Splash Content */}
        <div className="flex flex-col items-center justify-center my-auto z-10 animate-in fade-in zoom-in duration-700">
          <div className="mb-6 relative">
            <div className="absolute inset-0 bg-[#e6007e]/15 rounded-full blur-2xl transform scale-125" />
            <img
              src={LOGO_SQUARE}
              alt="Nexora Logo"
              className="w-24 h-24 object-contain relative z-10 drop-shadow-xl rounded-2xl animate-pulse"
            />
          </div>
          <h1 className="text-[32px] font-extrabold text-[#26181c] tracking-tight mb-1">Nexora</h1>
          <p className="text-[15px] text-[#5a3f47] max-w-[240px] leading-relaxed">
            Salon booking made simple
          </p>
        </div>

        {/* Loading Indicator at Bottom */}
        <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center gap-2 z-10">
          <svg className="w-6 h-6 animate-spin text-[#e6007e]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path
              className="opacity-100"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              fill="currentColor"
            />
          </svg>
          <span className="text-[12px] text-[#5a3f47]/80 font-medium">Getting things ready...</span>
        </div>

        {/* State Simulator Controls for Dev/Testing */}
        <div className="absolute top-4 right-4 flex gap-1 z-30">
          <button
            onClick={() => setSimulatedState('offline')}
            className="text-[10px] bg-rose-100 text-rose-700 px-2 py-1 rounded"
          >
            Offline
          </button>
          <button
            onClick={() => setSimulatedState('update')}
            className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded"
          >
            Update
          </button>
        </div>

        {/* Offline Modal */}
        {simulatedState === 'offline' && (
          <div className="absolute inset-0 bg-[#fff8f8]/95 backdrop-blur-md z-40 flex flex-col items-center justify-center p-6">
            <div className="bg-white p-6 rounded-[24px] shadow-xl border border-[#e8e8e8] text-center w-full max-w-xs">
              <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-[32px]">wifi_off</span>
              </div>
              <h2 className="text-lg font-bold text-[#26181c] mb-1">You're offline</h2>
              <p className="text-xs text-[#5a3f47] mb-6">Check your internet connection and try again.</p>
              <button
                onClick={() => setSimulatedState('normal')}
                className="w-full h-12 bg-[#e6007e] text-white font-semibold text-xs rounded-xl shadow-md"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Update Available Modal */}
        {simulatedState === 'update' && (
          <div className="absolute inset-0 bg-[#fff8f8]/95 backdrop-blur-md z-40 flex flex-col items-center justify-center p-6">
            <div className="bg-white p-6 rounded-[24px] shadow-xl border border-[#e8e8e8] text-center w-full max-w-xs">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-[32px]">system_update</span>
              </div>
              <h2 className="text-lg font-bold text-[#26181c] mb-1">A new version is ready</h2>
              <p className="text-xs text-[#5a3f47] mb-6">
                Update the app to get the latest improvements and bug fixes.
              </p>
              <button
                onClick={() => setSimulatedState('normal')}
                className="w-full h-12 bg-[#e6007e] text-white font-semibold text-xs rounded-xl shadow-md mb-2"
              >
                Update Now
              </button>
              <button
                onClick={() => setSimulatedState('normal')}
                className="w-full h-10 text-xs text-[#5a3f47]"
              >
                Later
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#fff8f8] flex flex-col max-w-md mx-auto overflow-y-auto animate-in fade-in">
      {/* Upper 42% Image Header with Soft Fade */}
      <div className="relative w-full h-[40vh] shrink-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${WELCOME_BG_URL}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#fff8f8] via-[#fff8f8]/40 to-transparent" />

        {/* Nexora Brand Icon top center */}
        <div className="absolute top-10 inset-x-0 flex justify-center z-10">
          <img
            src={LOGO_SQUARE}
            alt="Nexora Brand Logo"
            className="h-16 w-16 rounded-2xl shadow-md object-cover border border-white/60"
          />
        </div>
      </div>

      {/* Main Content Section */}
      <div className="flex-1 flex flex-col justify-between px-6 pt-2 pb-10 z-10 bg-[#fff8f8]">
        {authMode === 'welcome' ? (
          <>
            <div className="flex flex-col gap-3 text-center items-center">
              <h1 className="text-[26px] font-extrabold text-[#26181c] leading-tight tracking-tight">
                Book trusted beauty services near you
              </h1>
              <p className="text-[15px] text-[#5a3f47] max-w-[300px] leading-relaxed font-normal">
                Find salons, compare prices and book your preferred time in a few simple steps.
              </p>
            </div>

            <div className="flex flex-col gap-3 mt-8">
              <button
                onClick={() => setAuthMode('login')}
                className="w-full h-[52px] bg-[#e6007e] text-white font-semibold text-[16px] rounded-2xl shadow-lg shadow-[#e6007e]/25 active:scale-95 transition-all flex items-center justify-center"
              >
                Log In
              </button>

              <button
                onClick={() => setAuthMode('signup')}
                className="w-full h-[52px] bg-[#fde7f3] text-[#e6007e] font-semibold text-[16px] rounded-2xl active:scale-95 transition-all flex items-center justify-center"
              >
                Create Account
              </button>

              <button
                onClick={onContinue}
                className="mt-2 text-[#5a3f47] font-semibold text-[14px] underline-offset-4 hover:underline active:opacity-70 transition-opacity text-center py-2"
              >
                Continue as Guest
              </button>
            </div>

            <p className="text-center text-[12px] text-[#8c7077] mt-6 leading-relaxed">
              By continuing, you agree to Nexora's <br />
              <span className="text-[#26181c] underline cursor-pointer">Terms</span> and{' '}
              <span className="text-[#26181c] underline cursor-pointer">Privacy Policy</span>.
            </p>
          </>
        ) : (
          <div className="flex flex-col gap-4 animate-in slide-in-from-bottom">
            <button
              onClick={() => setAuthMode('welcome')}
              className="self-start text-xs font-semibold text-[#e6007e] flex items-center gap-1 mb-2"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back
            </button>

            <h2 className="text-[22px] font-bold text-[#26181c]">
              {authMode === 'login' ? 'Welcome Back' : 'Create Nexora Account'}
            </h2>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-[#5a3f47] mb-1 block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full h-12 px-4 rounded-xl border border-[#e8e8e8] bg-white text-sm focus:ring-2 focus:ring-[#e6007e]/30 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#5a3f47] mb-1 block">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 px-4 rounded-xl border border-[#e8e8e8] bg-white text-sm focus:ring-2 focus:ring-[#e6007e]/30 outline-none"
                />
              </div>

              <button
                onClick={onContinue}
                className="w-full h-[52px] bg-[#e6007e] text-white font-semibold text-[15px] rounded-2xl shadow-md mt-2"
              >
                {authMode === 'login' ? 'Sign In & Continue' : 'Create Account & Continue'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
