import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, MapPin, CheckCircle2, WifiOff, Wifi } from 'lucide-react';
import { Booking } from '../types';

interface OfflineDashboardCardProps {
  booking: Booking;
}

export const OfflineDashboardCard: React.FC<OfflineDashboardCardProps> = ({ booking }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-5 border border-[#e8e8e8] shadow-sm relative overflow-hidden"
    >
      {/* Cached Badge */}
      <div className="absolute top-0 right-0">
        <div className={`${
          isOnline ? 'bg-[#f3f4f6] text-[#4b5563]' : 'bg-amber-50 text-amber-600 border-amber-200'
        } text-[10px] font-bold px-3 py-1.5 rounded-bl-2xl flex items-center gap-1 border-l border-b border-[#e5e7eb] transition-colors duration-300`}>
          {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
          {isOnline ? 'OFFLINE READY' : 'CACHED'}
        </div>
      </div>

      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[#fdf2f8] flex items-center justify-center text-[#e6007e] shrink-0">
          <CheckCircle2 size={24} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[16px] text-[#26181c] truncate">
            {booking.salonName}
          </h3>
          <p className="text-[13px] text-[#5a3f47] flex items-center gap-1 mt-0.5">
            <MapPin size={12} className="text-[#e6007e]" />
            {booking.locationArea}
          </p>
          
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#f3f4f6]">
            <div className="flex items-center gap-1.5 text-[12px] text-[#5a3f47] font-medium">
              <Calendar size={14} className="text-[#e6007e]" />
              {booking.dateStr}
            </div>
            <div className="w-1 h-1 rounded-full bg-[#e5e7eb]" />
            <div className="flex items-center gap-1.5 text-[12px] text-[#5a3f47] font-medium">
              <Clock size={14} className="text-[#e6007e]" />
              {booking.timeSlot}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-1">
            {booking.services.slice(0, 2).map((service, idx) => (
              <span 
                key={idx}
                className="text-[10px] px-2 py-0.5 bg-[#fdf2f8] text-[#e6007e] rounded-full font-medium"
              >
                {service.name}
              </span>
            ))}
            {booking.services.length > 2 && (
              <span className="text-[10px] px-2 py-0.5 bg-[#f3f4f6] text-[#4b5563] rounded-full font-medium">
                +{booking.services.length - 2} more
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
