import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // ← added
import { toast } from 'react-toastify';
import { X, MapPin, IndianRupee, Phone } from 'lucide-react';

import {
  formatRupee,
  formatDateDDMMYYYY,
} from '../../utils/index';
import { getMyBookings } from '../../api/bookingApi';
import Loader from '../../components/common/Loader';

const PlayerBookings = () => {
  const navigate = useNavigate(); // ← added
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    pages: 1,
  });
  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchBookings = async (page = 1) => {
    setLoading(true);
    try {
      const data = await getMyBookings({ page, limit: 20 });
      
      const sortedBookings = (data.bookings || []).sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });

      setBookings(sortedBookings);

      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (err) {
      toast.error(err.message || 'Could not load your bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(1);
  }, []);

  const getStatusStyle = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'confirmed':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'pending':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-600 border-gray-200 line-through';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const isPaymentPending = (booking) =>
    (booking.paymentStatus || '').toLowerCase() === 'pending';

  const canPay = (booking) =>
    (booking.status || '').toLowerCase() === 'confirmed' &&
    Number(booking.balanceDue || 0) > 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <div className="text-sm text-gray-600">
            {pagination.total} {pagination.total === 1 ? 'booking' : 'bookings'}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <div className="text-6xl mb-4 opacity-70">📅</div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">
              No bookings found
            </h3>
            <p className="text-gray-600">You haven’t made any bookings yet.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {bookings.map((booking) => (
              <div
                key={booking.id || booking._id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-green-300 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="p-5 space-y-4 text-sm">
                  {/* Turf + Status */}
                  <div className="flex justify-between items-start gap-3">
                    <h3 className="font-semibold text-gray-900 text-base truncate">
                      {booking.turf?.name || 'Turf'}
                    </h3>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusStyle(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-2 gap-4 text-gray-700">
                    <div>
                      <div className="text-xs text-gray-500">Date</div>
                      <div className="font-medium">
                        {formatDateDDMMYYYY(booking.date)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Time</div>
                      <div className="font-medium">{booking.totalTime || '—'}</div>
                    </div>
                  </div>

                  {/* City */}
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin size={15} className="text-gray-500" />
                    <span>{booking.turf?.location?.city || '—'}</span>
                  </div>

                  {/* Amount & Payment status */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <div className="text-lg font-bold text-gray-900 flex items-center gap-1">
                      <IndianRupee size={16} className="text-gray-700" />
                      {formatRupee(booking.totalAmount)}
                    </div>

                    <div className="text-right">
                      {booking.balanceDue > 0 ? (
                        <div className="text-sm font-medium text-amber-700">
                          Due: {formatRupee(booking.balanceDue)}
                        </div>
                      ) : (
                        <div className="text-sm font-medium text-green-600">
                          Fully Paid
                        </div>
                      )}

                      {isPaymentPending(booking) && (
                        <div className="text-xs text-amber-600 mt-0.5">
                          Payment Pending
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3 pt-2">
                    {canPay(booking) && (
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 rounded-lg transition"
                      >
                        Pay Now
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className={`flex-1 text-sm font-medium py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition ${
                        canPay(booking) ? '' : 'bg-green-50 text-green-700 border-green-200'
                      }`}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-10">
            <button
              disabled={pagination.page === 1}
              onClick={() => fetchBookings(pagination.page - 1)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>

            <span className="text-sm text-gray-700 font-medium">
              Page {pagination.page} of {pagination.pages}
            </span>

            <button
              disabled={pagination.page === pagination.pages}
              onClick={() => fetchBookings(pagination.page + 1)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-200 shadow-xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex justify-between items-center z-10">
              <h2 className="font-bold text-gray-900">Booking Details</h2>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1.5 hover:bg-gray-100 rounded-full transition"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            <div className="p-5 space-y-5 text-sm">
              {/* Turf Info */}
              <div className="space-y-3 pb-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">
                  {selectedBooking.turf?.name}
                </h3>
                <div className="space-y-2 text-gray-700">
                  <p className="flex items-start gap-2">
                    <MapPin size={15} className="mt-0.5 text-gray-500 flex-shrink-0" />
                    <span>
                      {selectedBooking.turf?.location?.address || '—'}<br />
                      {selectedBooking.turf?.location?.city || '—'},{' '}
                      {selectedBooking.turf?.location?.state || '—'}
                    </span>
                  </p>

                  {selectedBooking.turf?.contact?.primaryMobile && (
                    <p className="flex items-center gap-2">
                      <Phone size={15} className="text-gray-500" />
                      <span>{selectedBooking.turf.contact.primaryMobile}</span>
                      {selectedBooking.turf.contact.secondaryMobile && (
                        <span>/ {selectedBooking.turf.contact.secondaryMobile}</span>
                      )}
                    </p>
                  )}
                </div>
              </div>

              {/* Booking Info */}
              <div className="grid grid-cols-2 gap-4 py-3 border-b border-gray-100">
                <div>
                  <div className="text-xs text-gray-500">Date</div>
                  <div className="font-medium">
                    {formatDateDDMMYYYY(selectedBooking.date)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Time</div>
                  <div className="font-medium">{selectedBooking.totalTime}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Duration</div>
                  <div className="font-medium">{selectedBooking.totalHours} hrs</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Status</div>
                  <div className="font-medium capitalize">{selectedBooking.status}</div>
                </div>
              </div>

              {/* Payment Section */}
              <div className="space-y-4">
                <div className="flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span>{formatRupee(selectedBooking.totalAmount)}</span>
                </div>

                <div className="flex justify-between text-gray-700">
                  <span>Paid</span>
                  <span className="text-green-700 font-medium">
                    {formatRupee(selectedBooking.totalPaid || selectedBooking.advancePaid || 0)}
                  </span>
                </div>

                {selectedBooking.balanceDue > 0 && (
                  <div className="flex justify-between pt-2 border-t border-gray-100">
                    <span className="text-gray-700">Pending Amount</span>
                    <span className="text-amber-700 font-semibold text-base">
                      {formatRupee(selectedBooking.balanceDue)}
                    </span>
                  </div>
                )}

                {isPaymentPending(selectedBooking) && (
                  <div className="text-sm text-amber-600 bg-amber-50 p-2.5 rounded border border-amber-200">
                    Payment Pending – Please complete payment to confirm
                  </div>
                )}

                {canPay(selectedBooking) && (
                  <button
                    onClick={() => {
                      navigate('/pay-balance', {  // ← change this path if your route is different
                        state: {
                          bookingId: selectedBooking.id || selectedBooking._id,
                          turfName: selectedBooking.turf?.name || 'Turf',
                          date: formatDateDDMMYYYY(selectedBooking.date),
                          totalAmount: selectedBooking.totalAmount,
                          totalPaid: selectedBooking.totalPaid || selectedBooking.advancePaid || 0,
                          balanceDue: selectedBooking.balanceDue,
                        },
                      });
                      setSelectedBooking(null); // close modal immediately
                    }}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg mt-2 transition"
                  >
                    Pay {formatRupee(selectedBooking.balanceDue)} Now
                  </button>
                )}
              </div>

              <button
                onClick={() => setSelectedBooking(null)}
                className="w-full py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerBookings;