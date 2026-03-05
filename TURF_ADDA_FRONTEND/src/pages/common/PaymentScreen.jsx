
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RiCloseLine, RiErrorWarningLine } from 'react-icons/ri';
import { useMessageModal } from '../../context/MessageModalContext';
import useAuthStore from '../../store/authStore';
import { createBooking, verifyRazorpayPayment } from '../../api/bookingApi';

const formatRupee = (amount) =>
  Number(amount).toLocaleString('en-IN', {
    maximumFractionDigits: 0,
    style: 'currency',
    currency: 'INR',
  }).replace('₹', '₹ ');

const PaymentScreen = () => {
  const { showMessage } = useMessageModal();
  const navigate = useNavigate();
  const location = useLocation();
  
  
  const { user } = useAuthStore();

  const { bookingSummary, turfId, selectedDate, selectedSlots } = location.state || {};

  const [isProcessing, setIsProcessing] = useState(false);
  const [advancePaid, setAdvancePaid] = useState(0);

  const {
    turfName = 'Unknown Turf',
    date = '',
    slots = [],
    totalAmount = 0,
    title = 'Confirm Payment',
  } = bookingSummary || {};

  // Calculate minimum advance as 20% of total
  const minAdvance = totalAmount > 0 ? Math.ceil(totalAmount * 0.2) : 0;

  // Auto-fill with minimum advance on first load
  useEffect(() => {
    if (minAdvance > 0 && advancePaid === 0) {
      setAdvancePaid(minAdvance);
    }
  }, [minAdvance, advancePaid]);

  // Validation: advance must be >= minAdvance AND <= totalAmount
  const isAmountValid = useMemo(
    () => advancePaid >= minAdvance && advancePaid <= totalAmount && advancePaid > 0,
    [advancePaid, minAdvance, totalAmount]
  );

  if (!bookingSummary || !turfId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-4">
          <RiErrorWarningLine className="text-red-400 text-4xl mx-auto mb-3" />
          <p className="text-base font-semibold text-gray-700 mb-4">No booking details found</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const handlePayNow = async () => {
    if (!isAmountValid) {
      showMessage({
        type: 'error',
        title: 'Invalid Amount',
        message: `Pay between ${formatRupee(minAdvance)} and ${formatRupee(totalAmount)}`,
      });
      return;
    }

    setIsProcessing(true);

    try {
      const bookingData = {
        turfId,
        date: selectedDate || new Date().toISOString().split('T')[0],
        slotIds: selectedSlots.map((s) => s.id || s._id || s.slotId),
        sport: 'football',
        paymentMethod: 'online',
        advancePaidNow: advancePaid,
      };

      console.log('Creating booking →', bookingData);
      const createdBooking = await createBooking(bookingData);
      console.log('Booking response:', createdBooking);

      if (!createdBooking?.success || !createdBooking?.data?.booking?.razorpayOrderId) {
        throw new Error(createdBooking?.message || 'Failed to create order');
      }

      const { booking } = createdBooking.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: advancePaid * 100,
        currency: 'INR',
        name: 'Turfadda',
        description: `Advance for ${turfName}`,
        order_id: booking.razorpayOrderId,
        handler: async (response) => {
          try {
            const verifyResult = await verifyRazorpayPayment(response);
            if (verifyResult.success) {
              showMessage({
                type: 'success',
                title: 'Payment Done!',
                message: `${formatRupee(advancePaid)} paid. Booking confirmed!`,
                primaryText: 'View Bookings',
                onPrimary: () => navigate('/bookings'),
              });
            } else {
              throw new Error(verifyResult.message || 'Verification failed');
            }
          } catch (err) {
            showMessage({
              type: 'error',
              title: 'Verification Failed',
              message: err.message || 'Could not verify payment.',
            });
          }
        },
        prefill: {
          name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.name || 'User',
          email: user?.email || '',
          contact: user?.mobile || user?.phone || user?.phoneNumber || '',
        },
        theme: { color: '#16a34a' },
        modal: {
          ondismiss: () => showMessage({ type: 'warning', message: 'Payment cancelled' }),
        },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      console.error(err);
      showMessage({ type: 'error', message: err.message || 'Payment failed' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Close Button - Top Right (No Fixed Header) */}
      <div className="flex justify-between items-center p-3 sticky top-0 z-40 bg-white border-b border-gray-200">
        <h1 className="text-lg font-bold text-gray-900">{title}</h1>
        <button 
          onClick={() => navigate(-1)} 
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RiCloseLine size={20} className="text-gray-600" />
        </button>
      </div>

      <main className="max-w-xl mx-auto px-4 py-4">
        
        {/* Booking Details */}
        <div className="mb-5">
          <h2 className="text-xs font-bold text-gray-500 uppercase mb-2">Booking</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Turf</span>
              <span className="font-semibold text-gray-900">{turfName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date</span>
              <span className="font-semibold text-gray-900">{date || '—'}</span>
            </div>
          </div>
        </div>

        {/* Slots List */}
        {slots.length > 0 && (
          <div className="mb-5">
            <h2 className="text-xs font-bold text-gray-500 uppercase mb-2">Slots</h2>
            <div className="space-y-1.5">
              {slots.map((slot, i) => (
                <div key={i} className="flex justify-between text-sm bg-white p-3 rounded border border-gray-200">
                  <span className="text-gray-900 font-medium">
                    {slot.startTime} – {slot.endTime}
                  </span>
                  <span className="text-green-600 font-semibold">{formatRupee(slot.price)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Amount Summary - Minimal */}
        <div className="bg-white rounded border border-gray-200 p-4 mb-5 space-y-3">
          <div className="flex justify-between pb-3 border-b border-gray-200">
            <span className="text-xs text-gray-600 font-medium">Total</span>
            <span className="text-lg font-bold text-gray-900">{formatRupee(totalAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-600 font-medium">Min Advance (20%)</span>
            <span className="text-lg font-bold text-green-600">{formatRupee(minAdvance)}</span>
          </div>
        </div>

        {/* Advance Amount Input */}
        <div className="mb-5">
          <h2 className="text-xs font-bold text-gray-500 uppercase mb-2">Pay Amount</h2>
          
          <div className="relative mb-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-700">₹</span>
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              value={advancePaid || ''}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setAdvancePaid(val === '' ? 0 : Number(val));
              }}
              className={`w-full pl-12 pr-3 py-3 text-3xl font-bold text-center rounded border-2 transition-all focus:outline-none focus:ring-1
                ${advancePaid < minAdvance && advancePaid > 0
                  ? 'border-red-400 ring-red-200 bg-red-50 text-red-900'
                  : advancePaid > totalAmount
                  ? 'border-red-400 ring-red-200 bg-red-50 text-red-900'
                  : advancePaid > 0
                  ? 'border-green-400 ring-green-200 bg-green-50 text-green-900'
                  : 'border-gray-300 bg-white text-gray-900'
                }`}
              placeholder="0"
            />
          </div>

          {/* Validation Messages - Compact */}
          {advancePaid > 0 && advancePaid < minAdvance && (
            <div className="bg-red-50 border border-red-300 rounded px-3 py-2 mb-3 text-xs text-red-700 font-medium">
              Min: {formatRupee(minAdvance)} • Max: {formatRupee(totalAmount)}
            </div>
          )}

          {advancePaid > totalAmount && (
            <div className="bg-red-50 border border-red-300 rounded px-3 py-2 mb-3 text-xs text-red-700 font-medium">
              Cannot exceed {formatRupee(totalAmount)}
            </div>
          )}
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePayNow}
          disabled={isProcessing || !isAmountValid}
          className={`w-full py-3 px-4 rounded font-bold text-base transition-all flex items-center justify-center gap-2
            ${isProcessing || !isAmountValid
              ? 'bg-gray-300 cursor-not-allowed text-gray-600'
              : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25" />
                <path fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" className="opacity-75" />
              </svg>
              Processing...
            </>
          ) : (
            `Pay ${formatRupee(advancePaid)}`
          )}
        </button>

        <div className="text-center mt-4 text-xs text-gray-500">
          <p>Secured by Razorpay • SSL Encrypted</p>
        </div>

      </main>
    </div>
  );
};

export default PaymentScreen;