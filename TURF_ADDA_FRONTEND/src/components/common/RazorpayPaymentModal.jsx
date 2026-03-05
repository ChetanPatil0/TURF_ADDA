// RazorpayPaymentModal.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { RiCloseLine } from 'react-icons/ri';
import { useMessageModal } from '../../context/MessageModalContext';
import { createBooking, verifyRazorpayPayment } from '../../lib/api';

const formatRupee = (amount) =>
  Number(amount).toLocaleString('en-IN', {
    maximumFractionDigits: 0,
    style: 'currency',
    currency: 'INR',
  }).replace('₹', '₹ ');

const RazorpayPaymentModal = ({
  isOpen,
  onClose,
  bookingSummary,
  onSuccess,
  turfId,
  selectedDate,
  selectedSlots,
}) => {
  const { showMessage } = useMessageModal();
  const [isProcessing, setIsProcessing] = useState(false);
  const [advancePaid, setAdvancePaid] = useState(0);

  const {
    turfName = 'Unknown Turf',
    date = '',
    slots = [],
    totalAmount = 0,
    advanceRequired: minAdvance = 0,
  } = bookingSummary || {};

  useEffect(() => {
    if (minAdvance > 0) {
      setAdvancePaid(minAdvance);
    }
  }, [minAdvance]);

  const isAmountValid = useMemo(
    () => advancePaid >= minAdvance && advancePaid <= totalAmount && advancePaid > 0,
    [advancePaid, minAdvance, totalAmount]
  );

  if (!isOpen) return null;

  const handlePayNow = async () => {
    if (!isAmountValid) {
      showMessage({
        type: 'error',
        title: 'Invalid Amount',
        message: `Minimum advance is ${formatRupee(minAdvance)}.`,
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
        throw new Error(createdBooking?.message || 'Failed to create booking order');
      }

      const { booking } = createdBooking.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: booking.advanceRequired * 100, // in paise
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
                title: 'Payment Successful!',
                message: `₹${advancePaid.toLocaleString('en-IN')} paid.\nBooking confirmed.`,
                primaryText: 'Continue',
                onPrimary: () => {
                  onSuccess?.(verifyResult);
                  onClose();
                },
              });
            } else {
              throw new Error(verifyResult.message || 'Payment verification failed');
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
          name: 'Player Name',
          email: 'player@example.com',
          contact: '9999999999',
        },
        theme: { color: '#22c55e' },
        modal: {
          ondismiss: () => {
            showMessage({
              type: 'warning',
              title: 'Payment Cancelled',
              message: 'Payment window was closed.',
            });
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Payment flow error:', err);
      showMessage({
        type: 'error',
        title: 'Something went wrong',
        message: err.message || 'Failed to start payment. Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center overflow-y-auto">
      {/* Backdrop click to close (only when not processing) */}
      <div className="absolute inset-0" onClick={() => !isProcessing && onClose()} />

      <div
        className={`
          relative bg-white w-full max-w-md sm:max-w-lg md:max-w-xl 
          min-h-screen sm:min-h-[90vh] md:min-h-[auto]
          sm:rounded-3xl shadow-2xl overflow-hidden
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 pb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl md:text-3xl font-bold">Confirm Booking</h2>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="text-white/80 hover:text-white disabled:opacity-50 transition"
              aria-label="Close"
            >
              <RiCloseLine size={32} />
            </button>
          </div>
          <p className="text-green-100 mt-1 opacity-90">Secure payment via Razorpay</p>
        </div>

        {/* Main content */}
        <div className="p-6 md:p-8 flex-1 flex flex-col">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <p className="text-sm text-gray-600">Turf</p>
              <p className="font-semibold text-lg mt-1">{turfName}</p>
            </div>
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <p className="text-sm text-gray-600">Date</p>
              <p className="font-semibold text-lg mt-1">{date || '—'}</p>
            </div>
          </div>

          {/* Slots */}
          <div className="mb-8">
            <p className="text-base font-medium text-gray-700 mb-3">Selected Slots</p>
            <div className="flex flex-wrap gap-2.5">
              {slots.length === 0 ? (
                <p className="text-gray-500 italic">No slots selected</p>
              ) : (
                slots.map((slot, i) => (
                  <div
                    key={i}
                    className="px-4 py-2 bg-green-50 text-green-800 rounded-full text-sm font-medium border border-green-200"
                  >
                    {slot.startTime} – {slot.endTime} • {formatRupee(slot.price)}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Payment Section */}
          <div className="mt-auto space-y-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{formatRupee(totalAmount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Minimum Advance</p>
                <p className="text-3xl font-bold text-green-700 mt-1">{formatRupee(minAdvance)}</p>
              </div>
            </div>

            <div>
              <label className="block text-base font-medium text-gray-800 mb-3">
                Amount to Pay Now
              </label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-4xl font-bold text-gray-600">
                  ₹
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={advancePaid || ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setAdvancePaid(val === '' ? 0 : Number(val));
                  }}
                  className={`
                    w-full pl-16 pr-6 py-5 text-4xl font-bold border-2 rounded-2xl text-center
                    focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${
                      advancePaid < minAdvance && advancePaid > 0
                        ? 'border-red-400 focus:ring-red-400'
                        : advancePaid > totalAmount
                        ? 'border-amber-400 focus:ring-amber-400'
                        : 'border-gray-300 focus:border-green-500 focus:ring-green-500'
                    }
                  `}
                />
              </div>

              {advancePaid > 0 && advancePaid < minAdvance && (
                <p className="text-red-600 text-sm mt-2 font-medium">
                  → Must be at least {formatRupee(minAdvance)}
                </p>
              )}

              {advancePaid > totalAmount && (
                <p className="text-amber-700 text-sm mt-2 font-medium">
                  → Cannot exceed total {formatRupee(totalAmount)}
                </p>
              )}
            </div>

            {/* Final Pay Button */}
            <button
              onClick={handlePayNow}
              disabled={isProcessing || !isAmountValid}
              className={`
                w-full py-6 px-8 rounded-2xl font-bold text-xl shadow-xl transition-all
                flex items-center justify-center gap-3
                ${
                  isProcessing || !isAmountValid
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white'
                }
              `}
            >
              {isProcessing ? (
                <>
                  <svg
                    className="animate-spin h-6 w-6 text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      className="opacity-25"
                    />
                    <path
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                      className="opacity-75"
                    />
                  </svg>
                  Processing...
                </>
              ) : (
                `Pay ${formatRupee(advancePaid)} Securely`
              )}
            </button>

            <button
              onClick={onClose}
              disabled={isProcessing}
              className="w-full py-5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-2xl font-bold text-lg transition disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Footer trust badge */}
        <div className="text-center text-sm text-gray-500 py-5 bg-gray-50 border-t">
          Secured by Razorpay • SSL Encrypted • No hidden charges
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default RazorpayPaymentModal;