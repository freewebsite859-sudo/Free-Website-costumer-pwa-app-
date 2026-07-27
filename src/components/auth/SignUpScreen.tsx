import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Eye, EyeOff } from 'lucide-react';
import { WELCOME_BG_URL, LOGO_SQUARE } from '../../data/mockData';

export const SignUpScreen: React.FC<{onToggleAuth: () => void}> = ({onToggleAuth}) => {
  console.log('SignUpScreen rendered');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobile: '',
    termsAccepted: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);

    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    alert('Form submitted! Trying to sign up...');
    
    if (!formData.fullName || !formData.email || !formData.mobile) {
      alert('Please fill in all fields.');
      return;
    }
    
    if (!validatePassword(formData.password)) {
      alert('Password must be at least 8 characters, include uppercase, lowercase, number, and special character. Example: Nexora@123');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    if (!formData.termsAccepted) {
      alert('Please accept the terms');
      return;
    }

    console.log('Validation passed, calling supabase.auth.signUp');
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          mobile: formData.mobile,
        },
      },
    });

    if (error) {
      console.error('Supabase signup error:', error);
      alert('Sign up failed: ' + error.message);
    } else {
      console.log('Signup successful, inserting profile', data);
      if (data.user) {
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: data.user.id,
                full_name: formData.fullName,
                email: formData.email,
                mobile: formData.mobile
            });
        if (profileError) {
            console.error('Profile insertion error:', profileError);
            alert('Signed up, but failed to create profile: ' + profileError.message);
        } else {
            alert('Check your email for confirmation!');
        }
      } else {
        alert('Check your email for confirmation!');
      }
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
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <h2 className="text-[26px] font-extrabold text-[#26181c] tracking-tight">Create Account</h2>
        <input type="text" placeholder="Full Name" className="p-4 border border-[#e8e8e8] rounded-2xl bg-white text-xs" required onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
        <input type="email" placeholder="Email" className="p-4 border border-[#e8e8e8] rounded-2xl bg-white text-xs" required onChange={(e) => setFormData({...formData, email: e.target.value})} />
        <div className="relative">
            <input type={showPassword ? "text" : "password"} placeholder="Password (e.g., Nexora@123)" className="p-4 border border-[#e8e8e8] rounded-2xl bg-white w-full text-xs" required onChange={(e) => setFormData({...formData, password: e.target.value})} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4 text-[#8c7077]">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
        </div>
        <div className="relative">
            <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" className="p-4 border border-[#e8e8e8] rounded-2xl bg-white w-full text-xs" required onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-4 text-[#8c7077]">
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
        </div>
        <input type="tel" placeholder="Mobile Number" className="p-4 border border-[#e8e8e8] rounded-2xl bg-white text-xs" required onChange={(e) => setFormData({...formData, mobile: e.target.value})} />
        <label className="flex items-center gap-2 text-xs text-[#5a3f47] font-semibold">
            <input type="checkbox" required onChange={(e) => setFormData({...formData, termsAccepted: e.target.checked})} className="accent-[#e6007e]" />
            I accept the terms
        </label>
        <button type="submit" className="w-full h-[52px] bg-[#e6007e] text-white font-bold rounded-2xl mt-2">Sign Up</button>
      </form>
      <button className="text-sm mt-6 font-extrabold text-[#e6007e] text-center" onClick={onToggleAuth}>Already have an account? Login</button>
      </div>
    </div>
  );
};
