import React from 'react';
import { Booking } from '../types';

interface BookingDetailsModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onRebook: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
}

export const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  booking,
  isOpen,
  onClose,
  onRebook,
  onCancel,
}) => {
  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-emerald-100 text-emerald-800';
      case 'PENDING': return 'bg-amber-100 text-amber-800';
      case 'PAST': return 'bg-slate-100 text-slate-600';
      case 'COMPLETED': return 'bg-sky-100 text-sky-800';
      case 'CANCELLED': return 'bg-rose-100 text-rose-800';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-white flex flex-col pt-safe pb-safe">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-outline-subtle">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-[#26181c] rounded-full hover:bg-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          <h2 className="text-[18px] font-semibold text-[#26181c]">Booking Details</h2>
        </div>
        <span className={`px-3 py-1 rounded-full text-[12px] font-bold ${getStatusColor(booking.status)}`}>
          {booking.status}
        </span>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-5 gap-6 flex flex-col">
        {/* Salon Details */}
        <div className="bg-surface-container rounded-xl p-4 shadow-sm">
          <h3 className="text-[16px] font-semibold text-[#26181c]">{booking.salonName}</h3>
          <p className="text-[14px] text-[#5a3f47]">{booking.locationArea}</p>
        </div>

        {/* Appointment Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-container rounded-xl p-4 shadow-sm">
            <span className="material-symbols-outlined text-primary mb-1">calendar_month</span>
            <p className="text-[12px] text-[#5a3f47] font-medium">Date</p>
            <p className="text-[14px] font-semibold text-[#26181c]">{booking.dateStr}</p>
          </div>
          <div className="bg-surface-container rounded-xl p-4 shadow-sm">
            <span className="material-symbols-outlined text-primary mb-1">schedule</span>
            <p className="text-[12px] text-[#5a3f47] font-medium">Time</p>
            <p className="text-[14px] font-semibold text-[#26181c]">{booking.timeSlot}</p>
          </div>
        </div>

        {/* Services & Staff */}
        <div className="bg-surface-container rounded-xl p-4 shadow-sm">
          <h4 className="text-[14px] font-semibold text-[#5a3f47] mb-2">Services</h4>
          <ul className="text-[14px] text-[#26181c] space-y-1">
            {booking.services.map((s, i) => (
              <li key={i} className="flex justify-between">
                <span>{s.name}</span>
                <span className="font-medium">₹{s.price}</span>
              </li>
            ))}
          </ul>
          {booking.staffName && (
            <div className="mt-4 pt-4 border-t border-outline-subtle">
              <p className="text-[14px] text-[#5a3f47]">Professional: <span className="font-semibold text-[#26181c]">{booking.staffName}</span></p>
            </div>
          )}
        </div>

        {/* Total Price */}
        <div className="flex justify-between items-center p-4">
          <span className="text-[16px] font-medium text-[#5a3f47]">Total Paid</span>
          <span className="text-[20px] font-bold text-[#e6007e]">₹{booking.totalAmount}</span>
        </div>
      </main>

      {/* Footer Actions */}
      <footer className="p-4 border-t border-outline-subtle grid grid-cols-2 gap-3">
        {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
          <button
            onClick={() => onCancel(booking)}
            className="h-[52px] rounded-xl font-semibold text-[15px] border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          onClick={() => alert('Downloading invoice...')}
          className="h-[52px] rounded-xl font-semibold text-[15px] border border-outline-subtle text-[#26181c] hover:bg-surface-variant transition-colors"
        >
          Invoice
        </button>
        <button
          onClick={() => onRebook(booking)}
          className="h-[52px] col-span-2 rounded-xl font-semibold text-[15px] bg-primary text-white hover:bg-primary-pink transition-all active:scale-[0.98]"
        >
          Rebook
        </button>
      </footer>
    </div>
  );
};
