import React, { useState } from 'react';
import { Booking, Screen } from '../types';

interface BookingsScreenProps {
  bookings: Booking[];
  onNavigate: (screen: Screen) => void;
  onCancelBooking: (bookingId: string) => void;
  onTriggerTestNotification?: (bookingId: string) => void;
}

export const BookingsScreen: React.FC<BookingsScreenProps> = ({
  bookings,
  onNavigate,
  onCancelBooking,
  onTriggerTestNotification,
}) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const upcomingBookings = bookings.filter(
    (b) => b.status === 'CONFIRMED' || b.status === 'PENDING'
  );
  const pastBookings = bookings.filter((b) => b.status === 'PAST');
  const cancelledBookings = bookings.filter((b) => b.status === 'CANCELLED');

  return (
    <div className="flex flex-col w-full gap-5 pb-28 pt-2">
      {/* Segment Tabs */}
      <div className="flex items-center w-full bg-[#ffe8ed] rounded-2xl p-1 shadow-sm mt-2">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-3 px-3 rounded-xl text-[13px] font-semibold transition-all ${
            activeTab === 'upcoming'
              ? 'bg-white shadow-sm text-[#26181c]'
              : 'text-[#5a3f47] hover:text-[#26181c]'
          }`}
        >
          Upcoming ({upcomingBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`flex-1 py-3 px-3 rounded-xl text-[13px] font-semibold transition-all ${
            activeTab === 'past'
              ? 'bg-white shadow-sm text-[#26181c]'
              : 'text-[#5a3f47] hover:text-[#26181c]'
          }`}
        >
          Past ({pastBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`flex-1 py-3 px-3 rounded-xl text-[13px] font-semibold transition-all ${
            activeTab === 'cancelled'
              ? 'bg-white shadow-sm text-[#26181c]'
              : 'text-[#5a3f47] hover:text-[#26181c]'
          }`}
        >
          Cancelled ({cancelledBookings.length})
        </button>
      </div>

      {/* Upcoming Tab */}
      {activeTab === 'upcoming' && (
        <div className="flex flex-col gap-4 w-full animate-in fade-in">
          {upcomingBookings.length > 0 ? (
            upcomingBookings.map((booking) => {
              const isConfirmed = booking.status === 'CONFIRMED';
              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-[24px] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] relative overflow-hidden group border border-[#e8e8e8]"
                >
                  <div className="flex justify-between items-start mb-3 relative z-10">
                    <div>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase mb-2 ${
                          isConfirmed
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {booking.status}
                      </span>
                      <h3 className="text-[18px] text-[#26181c] font-bold mb-0.5">
                        {booking.salonName}
                      </h3>
                      <p className="text-[14px] text-[#5a3f47] font-medium">
                        {booking.services.map((s) => s.name).join(', ')}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-[#ffe8ed] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[#8e004b]">content_cut</span>
                    </div>
                  </div>

                  {/* Date & Time Row */}
                  <div className="flex items-center gap-4 py-3 mb-4 border-t border-[#e8e8e8]/60 relative z-10">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#5a3f47] text-[20px]">
                        calendar_month
                      </span>
                      <span className="text-[13px] text-[#26181c] font-semibold">
                        {booking.dateStr}
                      </span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-[#8c7077]" />
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#5a3f47] text-[20px]">
                        schedule
                      </span>
                      <span className="text-[13px] text-[#26181c] font-semibold">
                        {booking.timeSlot}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="flex-1 h-[44px] bg-[#fde7f3] text-[#e6007e] text-[12px] font-bold rounded-xl active:scale-[0.98] transition-transform flex items-center justify-center gap-1.5"
                    >
                      Manage
                    </button>
                    {onTriggerTestNotification && (
                      <button
                        onClick={() => onTriggerTestNotification(booking.id)}
                        className="flex-1 h-[44px] bg-[#26181c] text-amber-300 text-[12px] font-bold rounded-xl active:scale-[0.98] transition-transform flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[16px] animate-pulse text-amber-400">notifications_active</span>
                        Test 1h Push
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center w-full bg-white rounded-3xl p-6 border border-[#e8e8e8]">
              <div className="w-24 h-24 mb-4 relative flex items-center justify-center">
                <div className="absolute inset-0 bg-[#e6007e]/10 rounded-full animate-pulse blur-xl" />
                <div className="relative w-16 h-16 bg-[#fde7f3] rounded-full flex items-center justify-center text-[#e6007e]">
                  <span className="material-symbols-outlined text-[32px]">event_busy</span>
                </div>
              </div>
              <h3 className="text-[18px] text-[#26181c] font-bold mb-1">No Upcoming Bookings</h3>
              <p className="text-[14px] text-[#5a3f47] mb-6 max-w-[260px]">
                Treat yourself to a relaxing spa session or a trendy hair makeover today!
              </p>
              <button
                onClick={() => onNavigate('home')}
                className="w-full h-[48px] bg-[#e6007e] text-white text-[14px] font-semibold rounded-xl active:scale-95 transition-transform shadow-md shadow-[#e6007e]/20"
              >
                Book a Treatment
              </button>
            </div>
          )}
        </div>
      )}

      {/* Past Tab */}
      {activeTab === 'past' && (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center w-full bg-white rounded-3xl p-6 border border-[#e8e8e8] animate-in fade-in">
          <div className="w-24 h-24 mb-4 relative flex items-center justify-center">
            <div className="absolute inset-0 bg-[#e6007e]/5 rounded-full blur-xl" />
            <div className="relative w-16 h-16 bg-[#ffe8ed] rounded-full flex items-center justify-center text-[#8c7077]">
              <span className="material-symbols-outlined text-[36px]">history</span>
            </div>
          </div>
          <h3 className="text-[18px] text-[#26181c] font-bold mb-1">No Past Bookings</h3>
          <p className="text-[14px] text-[#5a3f47] mb-6 max-w-[260px]">
            Looks like you haven't visited us yet. Let's change that!
          </p>
          <button
            onClick={() => onNavigate('home')}
            className="w-full h-[52px] bg-[#e6007e] text-white text-[14px] font-semibold rounded-xl active:scale-95 transition-transform shadow-md shadow-[#e6007e]/30"
          >
            Book your first service
          </button>
        </div>
      )}

      {/* Cancelled Tab */}
      {activeTab === 'cancelled' && (
        <div className="flex flex-col gap-3 animate-in fade-in">
          {cancelledBookings.length > 0 ? (
            cancelledBookings.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-[#e8e8e8] opacity-75"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-semibold uppercase mb-1">
                      Cancelled
                    </span>
                    <h4 className="font-bold text-[#26181c] text-[16px]">{b.salonName}</h4>
                    <p className="text-xs text-[#5a3f47]">{b.services.map((s) => s.name).join(', ')}</p>
                  </div>
                  <span className="text-xs font-semibold text-[#8c7077]">{b.dateStr}</span>
                </div>
                <button
                  onClick={() => onNavigate('home')}
                  className="mt-2 text-xs text-[#e6007e] font-semibold hover:underline"
                >
                  Rebook Treatment
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl p-6 border border-[#e8e8e8]">
              <span className="material-symbols-outlined text-[40px] text-[#e0bec6] mb-2">block</span>
              <p className="text-sm font-semibold text-[#26181c]">No Cancelled Bookings</p>
            </div>
          )}
        </div>
      )}

      {/* Manage Booking Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-[28px] p-6 w-full max-w-sm shadow-2xl flex flex-col gap-4 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between border-b border-[#fce2e7] pb-3">
              <h3 className="text-[18px] font-bold text-[#26181c]">Manage Appointment</h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1 rounded-full text-[#8c7077] hover:bg-[#ffe8ed]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-3 bg-[#fff0f2] rounded-2xl border border-[#fde7f3]">
              <p className="text-xs text-[#8c7077]">Booking ID: {selectedBooking.id}</p>
              <h4 className="text-base font-bold text-[#26181c] mt-0.5">{selectedBooking.salonName}</h4>
              <p className="text-xs text-[#5a3f47] font-medium mt-1">
                {selectedBooking.dateStr} at {selectedBooking.timeSlot}
              </p>
              <p className="text-xs text-[#e6007e] font-semibold mt-1">
                Total Paid: ₹{selectedBooking.totalAmount}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  alert(`Added appointment at ${selectedBooking.salonName} on ${selectedBooking.dateStr} to calendar!`);
                }}
                className="w-full h-11 bg-[#ffe8ed] text-[#26181c] rounded-xl font-semibold text-xs flex items-center justify-center gap-2 hover:bg-[#fce2e7]"
              >
                <span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
                Add to Calendar
              </button>

              <button
                onClick={() => {
                  if (confirm('Are you sure you want to cancel this booking?')) {
                    onCancelBooking(selectedBooking.id);
                    setSelectedBooking(null);
                  }
                }}
                className="w-full h-11 bg-rose-50 text-rose-600 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 hover:bg-rose-100"
              >
                <span className="material-symbols-outlined text-[18px]">cancel</span>
                Cancel Booking
              </button>

              <button
                onClick={() => setSelectedBooking(null)}
                className="w-full h-10 text-xs font-semibold text-[#8c7077]"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
