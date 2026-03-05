import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RiCloseLine, RiErrorWarningLine } from 'react-icons/ri';
import { useMessageModal } from '../../context/MessageModalContext';
import useAuthStore from '../../store/authStore';
import { payBalance } from '../../api/bookingApi';


const formatRupee = (amount) =>
  Number(amount).toLocaleString('en-IN', {
    maximumFractionDigits: 0,
    style: 'currency',
    currency: 'INR',
  }).replace('₹', '₹ ');

const BalancePaymentScreen = () => {
  const { showMessage } = useMessageModal();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  // Expecting these from navigation state
  const {
    bookingId,
    turfName = 'Unknown Turf',
    date = '',
    totalAmount = 0,
    totalPaid = 0,
    balanceDue = 0,
    title = 'Pay Remaining Balance',
  } = location.state || {};

  const [isProcessing, setIsProcessing] = useState(false);
  const [payAmount, setPayAmount] = useState(0);

  // Auto-fill with full balance on first load
  useEffect(() => {
    if (balanceDue > 0 && payAmount === 0) {
      setPayAmount(balanceDue);
    }
  }, [balanceDue, payAmount]);

  const isAmountValid = useMemo(
    () =>
      payAmount >= 1 &&
      payAmount <= balanceDue &&
      Number.isInteger(payAmount),
    [payAmount, balanceDue]
  );

  if (!bookingId || balanceDue <= 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-4">
          <RiErrorWarningLine className="text-red-400 text-4xl mx-auto mb-3" />
          <p className="text-base font-semibold text-gray-700 mb-4">
            No pending balance or invalid booking
          </p>
          <button
            onClick={() => navigate('/bookings')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-semibold"
          >
            Back to Bookings
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
        message: `Please pay between ₹ 1 and ${formatRupee(balanceDue)}`,
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Call your payBalance API function
      const payload = {
        amount: payAmount,
        method: 'online',
      
      };

      console.log('Paying balance →', { bookingId, ...payload });

      const result = await payBalance(bookingId, payload);

      if (!result?.razorpayOrderId) {
        throw new Error(result?.message || 'Failed to create Razorpay order');
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: payAmount * 100,
        currency: 'INR',
        name: 'Turfadda',
        description: `Balance payment for ${turfName}`,
        order_id: result.razorpayOrderId,
        handler: async (response) => {
          try {
            // You most likely need a separate verify endpoint for balance payments
            // If your backend already handles webhook verification → skip client verify
            // Otherwise implement verifyRazorpayBalancePayment or reuse existing one

            // For now assuming backend webhook handles it and we just show success
            showMessage({
              type: 'success',
              title: 'Payment Successful!',
              message: `${formatRupee(payAmount)} paid. Booking updated!`,
              primaryText: 'View Bookings',
              onPrimary: () => navigate('/bookings'),
            });

            // Optional: refresh bookings list or navigate after delay
            setTimeout(() => navigate('/bookings'), 1800);
          } catch (err) {
            showMessage({
              type: 'error',
              title: 'Payment Verification Failed',
              message: err.message || 'Could not confirm payment.',
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

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error('Balance payment error:', err);
      showMessage({
        type: 'error',
        title: 'Payment Failed',
        message: err.message || 'Could not initiate payment.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
        {/* Booking Summary */}
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

        {/* Amount Summary */}
        <div className="bg-white rounded border border-gray-200 p-4 mb-5 space-y-3">
          <div className="flex justify-between pb-3 border-b border-gray-200">
            <span className="text-xs text-gray-600 font-medium">Total Amount</span>
            <span className="text-lg font-bold text-gray-900">{formatRupee(totalAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-600 font-medium">Already Paid</span>
            <span className="text-lg font-bold text-green-600">{formatRupee(totalPaid)}</span>
          </div>
          <div className="flex justify-between pt-3 border-t border-gray-200">
            <span className="text-sm font-semibold text-gray-800">Balance Due</span>
            <span className="text-xl font-bold text-amber-700">{formatRupee(balanceDue)}</span>
          </div>
        </div>

        {/* Payment Input */}
        <div className="mb-5">
          <h2 className="text-xs font-bold text-gray-500 uppercase mb-2">Pay Amount</h2>

          <div className="relative mb-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-700">₹</span>
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              value={payAmount || ''}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setPayAmount(val === '' ? 0 : Number(val));
              }}
              className={`w-full pl-12 pr-3 py-3 text-3xl font-bold text-center rounded border-2 transition-all focus:outline-none focus:ring-1
                ${payAmount > 0 && payAmount < balanceDue
                  ? 'border-amber-400 ring-amber-200 bg-amber-50 text-amber-900'
                  : payAmount > balanceDue
                  ? 'border-red-400 ring-red-200 bg-red-50 text-red-900'
                  : payAmount > 0
                  ? 'border-green-400 ring-green-200 bg-green-50 text-green-900'
                  : 'border-gray-300 bg-white text-gray-900'
                }`}
              placeholder="0"
            />
          </div>

          {/* Feedback messages */}
          {payAmount > 0 && payAmount < balanceDue && (
            <div className="bg-amber-50 border border-amber-300 rounded px-3 py-2 mb-3 text-xs text-amber-700 font-medium">
              You can pay any amount up to {formatRupee(balanceDue)}
            </div>
          )}

          {payAmount > balanceDue && (
            <div className="bg-red-50 border border-red-300 rounded px-3 py-2 mb-3 text-xs text-red-700 font-medium">
              Cannot exceed remaining balance of {formatRupee(balanceDue)}
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
            `Pay ${formatRupee(payAmount)} Now`
          )}
        </button>

        <div className="text-center mt-4 text-xs text-gray-500">
          <p>Secured by Razorpay • SSL Encrypted</p>
        </div>
      </main>
    </div>
  );
};

export default BalancePaymentScreen;