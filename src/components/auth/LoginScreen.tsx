import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Eye, EyeOff } from 'lucide-react';
import { WELCOME_BG_URL, LOGO_SQUARE } from '../../data/mockData';

export const LoginScreen: React.FC<{onToggleAuth: () => void}> = ({onToggleAuth}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    console.log('handleLogin triggered');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        console.error('Login error:', error);
        setErrorMsg('Invalid email or password. Please try again.');
    } else {
        console.log('Login successful');
        alert('Logged in!');
    }
  };

  const handleGoogleLogin = async () => {
    console.log('handleGoogleLogin triggered');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) {
        console.error('Google login error:', error);
        alert(error.message);
    } else {
        console.log('Google login initiated');
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert('Please enter your email address first.');
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      alert(error.message);
    } else {
      alert('Password reset link has been sent to your email.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#fff8f8] flex flex-col max-w-md mx-auto overflow-y-auto">
      <div className="relative w-full h-[20vh] shrink-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${WELCOME_BG_URL}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#fff8f8] via-[#fff8f8]/50 to-transparent" />
        <div className="absolute top-8 inset-x-0 flex justify-center z-10">
          <img src={LOGO_SQUARE} alt="Nexora Brand Logo" className="h-14 w-14 rounded-2xl shadow-md object-cover border border-white/60" />
        </div>
      </div>

      <div className="flex-1 flex flex-col px-6 pt-6 pb-8 z-10 bg-[#fff8f8]">
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <h2 className="text-[26px] font-extrabold text-[#26181c] tracking-tight">Welcome back</h2>
            <input type="email" placeholder="Email" className="p-4 border border-[#e8e8e8] rounded-2xl bg-white text-xs" required onChange={(e) => setEmail(e.target.value)} />
            <div className="relative">
                <input type={showPassword ? "text" : "password"} placeholder="Password" className="p-4 border border-[#e8e8e8] rounded-2xl bg-white w-full text-xs" required onChange={(e) => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4 text-[#8c7077]">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
            <label className="flex items-center gap-2 text-xs text-[#5a3f47] font-semibold">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="accent-[#e6007e]" />
                Remember Me
            </label>
            {errorMsg && <p className="text-red-500 text-xs mt-2">{errorMsg}</p>}
            <button type="submit" className="w-full h-[52px] bg-[#e6007e] text-white font-bold rounded-2xl mt-2">Login</button>
        </form>
        <button onClick={handleGoogleLogin} className="w-full h-[50px] mt-4 border border-[#e8e8e8] rounded-2xl bg-white font-bold text-xs flex items-center justify-center gap-2.5">
          Continue with Google
        </button>
        <div className="flex justify-between mt-6 text-xs text-[#5a3f47]">
            <button className="font-semibold" onClick={handleForgotPassword}>Forgot Password?</button>
            <button className="font-extrabold text-[#e6007e]" onClick={onToggleAuth}>Create Account</button>
        </div>
      </div>
    </div>
  );
};
