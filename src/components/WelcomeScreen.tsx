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
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [emailError, setEmailError] = useState<string | null>(null);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setEmailError('Enter a valid email address');
      return;
    }
    setEmailError(null);
    onContinue();
  };

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
            className="text-[10px] bg-rose-100 text-rose-700 px-2 py-1 rounded cursor-pointer"
          >
            Offline
          </button>
          <button
            onClick={() => setSimulatedState('update')}
            className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded cursor-pointer"
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
                className="w-full h-12 bg-[#e6007e] text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer"
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
                className="w-full h-12 bg-[#e6007e] text-white font-semibold text-xs rounded-xl shadow-md mb-2 cursor-pointer"
              >
                Update Now
              </button>
              <button
                onClick={() => setSimulatedState('normal')}
                className="w-full h-10 text-xs text-[#5a3f47] cursor-pointer"
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
      {/* Upper Header Image (Collapsible when logging in) */}
      <div className={`relative w-full transition-all duration-300 shrink-0 overflow-hidden ${authMode === 'welcome' ? 'h-[36vh]' : 'h-[20vh]'}`}>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${WELCOME_BG_URL}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#fff8f8] via-[#fff8f8]/50 to-transparent" />

        {/* Nexora Brand Icon */}
        <div className="absolute top-8 inset-x-0 flex justify-center z-10">
          <img
            src={LOGO_SQUARE}
            alt="Nexora Brand Logo"
            className="h-14 w-14 rounded-2xl shadow-md object-cover border border-white/60"
          />
        </div>
      </div>

      {/* Main Content Section */}
      <div className="flex-1 flex flex-col justify-between px-6 pt-2 pb-8 z-10 bg-[#fff8f8]">
        {authMode === 'welcome' ? (
          <>
            <div className="flex flex-col gap-3 text-center items-center mt-2">
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
                className="w-full h-[52px] bg-[#e6007e] text-white font-bold text-[16px] rounded-2xl shadow-lg shadow-[#e6007e]/25 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
              >
                Log In
              </button>

              <button
                onClick={() => setAuthMode('signup')}
                className="w-full h-[52px] bg-[#fde7f3] text-[#e6007e] font-bold text-[16px] rounded-2xl active:scale-95 transition-all flex items-center justify-center cursor-pointer"
              >
                Create Account
              </button>

              <button
                onClick={onContinue}
                className="mt-2 text-[#5a3f47] font-semibold text-[14px] underline-offset-4 hover:underline active:opacity-70 transition-opacity text-center py-2 cursor-pointer"
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
          /* LOGIN & SIGNUP FORM SCREEN */
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 animate-in slide-in-from-bottom duration-300">
            {/* Header Navigation */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setAuthMode('welcome')}
                className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#26181c] shadow-xs hover:bg-slate-100 cursor-pointer"
                aria-label="Go back"
              >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              </button>

              <span className="text-xs font-extrabold uppercase px-2.5 py-1 rounded-full bg-[#fde7f3] text-[#e6007e] border border-[#f3c2dc]">
                {authMode === 'login' ? 'Log In' : 'Sign Up'}
              </span>
            </div>

            {/* Title */}
            <div>
              <h2 className="text-[26px] font-extrabold text-[#26181c] tracking-tight">
                {authMode === 'login' ? 'Welcome back' : 'Create Account'}
              </h2>
              <p className="text-xs text-[#5a3f47] mt-0.5">
                {authMode === 'login'
                  ? 'Log in to manage your bookings and rewards.'
                  : 'Join Nexora to unlock exclusive salon deals and points.'}
              </p>
            </div>

            {/* Email Field */}
            <div className="flex flex-col gap-1.5 group">
              <label className="text-xs font-bold text-[#26181c] ml-1" htmlFor="email">
                Email Address
              </label>
              <div
                className={`relative w-full rounded-2xl bg-white shadow-2xs transition-all ring-1 ${
                  emailError ? 'ring-rose-500' : 'ring-[#e8e8e8] focus-within:ring-[#e6007e]'
                }`}
              >
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8c7077]">
                  <span className="material-symbols-outlined text-[20px]">mail</span>
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  placeholder="name@example.com"
                  className="w-full h-[50px] bg-transparent pl-11 pr-4 rounded-2xl text-xs text-[#26181c] font-medium placeholder:text-[#8c7077]/60 focus:outline-none"
                />
              </div>
              {emailError && (
                <p className="text-[11px] text-rose-600 ml-1 mt-0.5 flex items-center gap-1 font-semibold">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {emailError}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5 group">
              <label className="text-xs font-bold text-[#26181c] ml-1" htmlFor="password">
                Password
              </label>
              <div className="relative w-full rounded-2xl bg-white shadow-2xs transition-all ring-1 ring-[#e8e8e8] focus-within:ring-[#e6007e]">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8c7077]">
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full h-[50px] bg-transparent pl-11 pr-12 rounded-2xl text-xs text-[#26181c] font-medium placeholder:text-[#8c7077]/60 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8c7077] hover:text-[#26181c] transition-colors cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            {authMode === 'login' && (
              <div className="flex items-center justify-between text-xs my-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded-md transition-all flex items-center justify-center border ${
                        rememberMe
                          ? 'bg-[#e6007e] border-[#e6007e] text-white shadow-2xs'
                          : 'bg-white border-[#8c7077]/40'
                      }`}
                    >
                      {rememberMe && (
                        <span className="material-symbols-outlined text-[14px]">check</span>
                      )}
                    </div>
                  </div>
                  <span className="text-[#5a3f47] font-semibold">Remember Me</span>
                </label>

                <button
                  type="button"
                  onClick={() => alert('Password reset link sent to your email.')}
                  className="text-[#e6007e] font-bold hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {/* Submit Action */}
            <button
              type="submit"
              className="w-full h-[52px] bg-[#e6007e] hover:bg-[#c9006e] text-white font-bold text-sm rounded-2xl shadow-lg shadow-[#e6007e]/20 transition-all duration-300 active:scale-98 flex items-center justify-center gap-2 cursor-pointer mt-1"
            >
              {authMode === 'login' ? 'Log In' : 'Create Account'}
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>

            {/* Divider */}
            <div className="flex items-center justify-center gap-3 my-1 opacity-70">
              <div className="h-[1px] flex-1 bg-[#8c7077]/20" />
              <span className="text-[11px] font-medium text-[#5a3f47]">or continue with</span>
              <div className="h-[1px] flex-1 bg-[#8c7077]/20" />
            </div>

            {/* Social Login - Google Button */}
            <button
              type="button"
              onClick={onContinue}
              className="w-full h-[50px] bg-white text-[#26181c] font-bold text-xs rounded-2xl border border-[#e8e8e8] shadow-2xs hover:bg-slate-50 transition-all active:scale-98 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <svg height="18" viewBox="0 0 48 48" width="18" xmlns="http://www.w3.org/2000/svg">
                <path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107" />
                <path d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00" />
                <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50" />
                <path d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571c.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2" />
              </svg>
              Continue with Google
            </button>

            {/* Footer Mode Switcher */}
            <div className="text-center pt-2">
              <p className="text-xs text-[#5a3f47]">
                {authMode === 'login' ? 'New to Nexora?' : 'Already have an account?'}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === 'login' ? 'signup' : 'login');
                    setEmailError(null);
                  }}
                  className="font-extrabold text-[#e6007e] hover:underline ml-1 cursor-pointer"
                >
                  {authMode === 'login' ? 'Create Account' : 'Log In'}
                </button>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

