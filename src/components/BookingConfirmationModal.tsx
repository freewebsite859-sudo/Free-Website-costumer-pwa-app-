import React from 'react';
import { Booking } from '../types';

interface BookingConfirmationModalProps {
  booking: Booking;
  onViewBookings: () => void;
  onClose: () => void;
}

export const BookingConfirmationModal: React.FC<BookingConfirmationModalProps> = ({
  booking,
  onViewBookings,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-5 animate-in fade-in max-w-md mx-auto">
      <div className="bg-white rounded-[28px] p-6 w-full shadow-2xl flex flex-col items-center text-center animate-in zoom-in duration-300 border border-[#e8e8e8]">
        {/* Success Icon Badge */}
        <div className="w-20 h-20 rounded-full bg-[#fde7f3] text-[#e6007e] flex items-center justify-center mb-4 shadow-inner relative">
          <div className="absolute inset-0 bg-[#e6007e]/20 rounded-full animate-ping opacity-75" />
          <span className="material-symbols-outlined text-[44px]">check_circle</span>
        </div>

        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full uppercase tracking-wider mb-2">
          Booking Confirmed
        </span>

        <h3 className="text-[22px] font-extrabold text-[#26181c] mb-1">
          {booking.salonName}
        </h3>
        <p className="text-xs text-[#5a3f47] mb-4">
          Booking ID: <span className="font-mono font-bold text-[#8e004b]">{booking.id}</span>
        </p>

        {/* Appointment Details Box */}
        <div className="w-full p-4 bg-[#fff0f2] rounded-2xl border border-[#fde7f3] flex flex-col gap-2.5 text-left mb-6">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#5a3f47] font-medium">Services:</span>
            <span className="font-bold text-[#26181c] text-right truncate max-w-[180px]">
              {booking.services.map((s) => s.name).join(', ')}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-[#5a3f47] font-medium">Date & Time:</span>
            <span className="font-bold text-[#e6007e]">
              {booking.dateStr}, {booking.timeSlot}
            </span>
          </div>

          {booking.staffName && (
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#5a3f47] font-medium">Preferred Stylist:</span>
              <span className="font-bold text-[#26181c]">{booking.staffName}</span>
            </div>
          )}

          <div className="h-px bg-[#fce2e7] my-0.5" />

          <div className="flex justify-between items-center text-xs">
            <span className="text-[#5a3f47] font-medium">Total Booking Amount:</span>
            <span className="font-bold text-[#26181c]">₹{booking.totalAmount}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#5a3f47] font-medium">Advance Paid — 25%:</span>
            <span className="font-bold text-[#e6007e]">₹{Math.round(booking.totalAmount * 0.25)}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#5a3f47] font-medium">Remaining After Service — 75%:</span>
            <span className="font-bold text-[#e6007e]">₹{Math.round(booking.totalAmount * 0.75)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col gap-2">
          <button
            onClick={onViewBookings}
            className="w-full h-[50px] bg-[#e6007e] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#e6007e]/25 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">event_note</span>
            View My Bookings
          </button>

          <button
            onClick={onClose}
            className="w-full h-11 text-xs font-semibold text-[#5a3f47] hover:text-[#26181c]"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};
