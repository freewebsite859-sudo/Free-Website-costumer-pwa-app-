import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import { AVATAR_URL } from '../data/mockData';
import { Screen, UserLocation } from '../types';

interface ProfileScreenProps {
  location: UserLocation;
  favoritesCount: number;
  onNavigate: (screen: Screen) => void;
  onOpenLocation: () => void;
}

interface MonthlyStat {
  month: string;
  spending: number;
  appointments: number;
}

const SIX_MONTH_STATS: MonthlyStat[] = [
  { month: 'Feb', spending: 1200, appointments: 2 },
  { month: 'Mar', spending: 2400, appointments: 3 },
  { month: 'Apr', spending: 1800, appointments: 2 },
  { month: 'May', spending: 3100, appointments: 4 },
  { month: 'Jun', spending: 1500, appointments: 2 },
  { month: 'Jul', spending: 2450, appointments: 3 },
];

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  location,
  favoritesCount,
  onNavigate,
  onOpenLocation,
}) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [activeMetric, setActiveMetric] = useState<'spending' | 'appointments'>('spending');

  const totalSpent = SIX_MONTH_STATS.reduce((acc, curr) => acc + curr.spending, 0);
  const totalAppointments = SIX_MONTH_STATS.reduce((acc, curr) => acc + curr.appointments, 0);
  const avgSpentPerSession = Math.round(totalSpent / totalAppointments);

  return (
    <div className="flex flex-col w-full gap-5 pb-28 pt-2 animate-in fade-in">
      {/* Profile Info Header Card */}
      <div className="bg-white rounded-[24px] p-5 shadow-sm border border-[#e8e8e8] flex items-center gap-4">
        <img
          src={AVATAR_URL}
          alt="User Profile"
          className="w-16 h-16 rounded-full object-cover border-2 border-[#e6007e]"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <h2 className="text-[18px] font-bold text-[#26181c] truncate">Priya Sharma</h2>
            <span className="material-symbols-outlined text-[16px] text-[#0353db]" title="Verified Profile">
              verified
            </span>
          </div>
          <p className="text-[13px] text-[#5a3f47] font-medium">+91 98765 43210</p>
          <p className="text-[11px] text-[#e6007e] font-semibold mt-0.5">priya.sharma@example.com</p>
        </div>
      </div>

      {/* Booking Stats Card with Recharts */}
      <div className="bg-white rounded-[24px] p-5 shadow-sm border border-[#f0d8e2] flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#fde7f3] text-[#e6007e] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">analytics</span>
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-[#26181c]">Booking Stats</h3>
              <p className="text-[11px] text-[#5a3f47]">Last 6 Months Activity</p>
            </div>
          </div>

          <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-[#fde7f3] text-[#e6007e] border border-[#f3c2dc]">
            Feb - Jul 2024
          </span>
        </div>

        {/* Quick KPI Counters */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#fff0f3] p-2.5 rounded-2xl border border-[#fcd5e8] flex flex-col">
            <span className="text-[10px] text-[#8c7077] font-medium">Total Spent</span>
            <span className="text-[15px] font-extrabold text-[#e6007e]">₹{totalSpent.toLocaleString('en-IN')}</span>
          </div>

          <div className="bg-[#fff0f3] p-2.5 rounded-2xl border border-[#fcd5e8] flex flex-col">
            <span className="text-[10px] text-[#8c7077] font-medium">Appointments</span>
            <span className="text-[15px] font-extrabold text-[#26181c]">{totalAppointments} Visits</span>
          </div>

          <div className="bg-[#fff0f3] p-2.5 rounded-2xl border border-[#fcd5e8] flex flex-col">
            <span className="text-[10px] text-[#8c7077] font-medium">Avg / Visit</span>
            <span className="text-[15px] font-extrabold text-[#26181c]">₹{avgSpentPerSession}</span>
          </div>
        </div>

        {/* Metric Selector Pills */}
        <div className="flex bg-[#f8eff3] p-1 rounded-xl gap-1">
          <button
            onClick={() => setActiveMetric('spending')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeMetric === 'spending'
                ? 'bg-white text-[#e6007e] shadow-xs'
                : 'text-[#5a3f47] hover:text-[#26181c]'
            }`}
          >
            Monthly Spending (₹)
          </button>
          <button
            onClick={() => setActiveMetric('appointments')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeMetric === 'appointments'
                ? 'bg-white text-[#e6007e] shadow-xs'
                : 'text-[#5a3f47] hover:text-[#26181c]'
            }`}
          >
            Appointments Count
          </button>
        </div>

        {/* Recharts Visual Container */}
        <div className="w-full h-[200px] pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {activeMetric === 'spending' ? (
              <BarChart data={SIX_MONTH_STATS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0d8e2" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#5a3f47' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#8c7077' }} />
                <Tooltip
                  cursor={{ fill: 'rgba(230, 0, 126, 0.05)' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#26181c] text-white p-2.5 rounded-xl shadow-lg border border-[#e6007e] text-xs">
                          <p className="font-bold text-amber-300">{label} 2024</p>
                          <p className="text-white mt-0.5">
                            Spent: <strong className="text-[#e6007e]">₹{payload[0].value}</strong>
                          </p>
                          <p className="text-slate-300 text-[10px]">
                            {SIX_MONTH_STATS.find((s) => s.month === label)?.appointments} appointments booked
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="spending" fill="#e6007e" radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart data={SIX_MONTH_STATS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0d8e2" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#5a3f47' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#8c7077' }} allowDecimals={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#26181c] text-white p-2.5 rounded-xl shadow-lg border border-[#e6007e] text-xs">
                          <p className="font-bold text-amber-300">{label} 2024</p>
                          <p className="text-white mt-0.5">
                            Appointments: <strong className="text-[#e6007e]">{payload[0].value} visits</strong>
                          </p>
                          <p className="text-slate-300 text-[10px]">
                            Spent: ₹{SIX_MONTH_STATS.find((s) => s.month === label)?.spending}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="appointments"
                  stroke="#e6007e"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#e6007e', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Menu Options Group */}
      <div className="bg-white rounded-2xl border border-[#e8e8e8] overflow-hidden shadow-sm">
        <button
          onClick={onOpenLocation}
          className="w-full flex items-center justify-between p-4 hover:bg-[#fff0f2] transition-colors text-left border-b border-[#e8e8e8]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#fde7f3] flex items-center justify-center text-[#e6007e]">
              <span className="material-symbols-outlined text-[20px]">location_on</span>
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#26181c]">Saved Location</p>
              <p className="text-[12px] text-[#5a3f47]">{location.area}, {location.city}</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-[#8c7077]">chevron_right</span>
        </button>

        <button
          onClick={() => onNavigate('search')}
          className="w-full flex items-center justify-between p-4 hover:bg-[#fff0f2] transition-colors text-left border-b border-[#e8e8e8]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#fde7f3] flex items-center justify-center text-[#e6007e]">
              <span className="material-symbols-outlined text-[20px]">favorite</span>
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#26181c]">Favorite Salons</p>
              <p className="text-[12px] text-[#5a3f47]">{favoritesCount} saved studios</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-[#8c7077]">chevron_right</span>
        </button>

        <button
          onClick={() => onNavigate('bookings')}
          className="w-full flex items-center justify-between p-4 hover:bg-[#fff0f2] transition-colors text-left border-b border-[#e8e8e8]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#fde7f3] flex items-center justify-center text-[#e6007e]">
              <span className="material-symbols-outlined text-[20px]">receipt_long</span>
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#26181c]">Payment History</p>
              <p className="text-[12px] text-[#5a3f47]">UPI, Cards, & Cash at Salon</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-[#8c7077]">chevron_right</span>
        </button>

        <div className="flex items-center justify-between p-4 border-b border-[#e8e8e8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#ffe8ed] flex items-center justify-center text-[#8e004b]">
              <span className="material-symbols-outlined text-[20px]">notifications</span>
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#26181c]">Appointment Reminders</p>
              <p className="text-[12px] text-[#5a3f47]">SMS & Push notifications</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={(e) => setNotificationsEnabled(e.target.checked)}
            className="w-5 h-5 accent-[#e6007e] rounded cursor-pointer"
          />
        </div>

        <button
          onClick={() => alert('Support team hotline: +91 1800 123 4567')}
          className="w-full flex items-center justify-between p-4 hover:bg-[#fff0f2] transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#ffe8ed] flex items-center justify-center text-[#8e004b]">
              <span className="material-symbols-outlined text-[20px]">support_agent</span>
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#26181c]">Help & Support</p>
              <p className="text-[12px] text-[#5a3f47]">24/7 Concierge Service</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-[#8c7077]">chevron_right</span>
        </button>
      </div>

      <button
        onClick={() => onNavigate('welcome')}
        className="w-full h-12 bg-rose-50 text-rose-600 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-rose-100 transition-colors"
      >
        <span className="material-symbols-outlined text-[18px]">logout</span>
        Log Out
      </button>
    </div>
  );
};

