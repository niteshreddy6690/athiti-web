

"use client";

import React, { useState, useEffect } from 'react';
import { Clock, User, Home, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { API_URL } from '@/utils/constants';
import CheckoutModal from '@/components/feature/Checkout/CheckoutModal';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingBooking, setProcessingBooking] = useState(null);
  const [checkoutBookingData, setCheckoutBookingData] = useState(null); 

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/booking`);
      const allBooking = await response.json();
      setBookings(allBooking);
    } catch (err) {
      setError('Failed to fetch bookings');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCheckIn = async (bookingId) => {
    try {
      setProcessingBooking(bookingId);
      await new Promise(resolve => setTimeout(resolve, 1500));

      setBookings(bookings.map(booking =>
        booking._id === bookingId
          ? {
              ...booking,
              auditStatus: {
                ...booking.auditStatus,
                checkIn: {
                  completed: true,
                  completedAt: new Date().toISOString(),
                  completedBy: 'current_user',
                },
              },
              status: 'active',
            }
          : booking
      ));
    } catch (err) {
      console.error('Error checking in:', err);
      alert('Failed to check in. Please try again.');
    } finally {
      setProcessingBooking(null);
    }
  };

  const handleCheckOut = async (booking) => {
    try {
      setProcessingBooking(booking._id);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCheckoutBookingData(booking); // ✅ Open modal with booking data
    } catch (err) {
      console.error('Error checking out:', err);
      alert('Failed to check out. Please try again.');
    } finally {
      setProcessingBooking(null);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getRoomStatusColor = (status) => {
    switch (status) {
      case 'occupied': return 'bg-red-100 text-red-800';
      case 'available': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const BookingItem = ({ booking }) => {

    console.log("booking",booking)
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div className="flex items-center gap-3 mb-4 lg:mb-0">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Home className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Booking #{booking._id.slice(-6)}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
                <span className="text-sm text-gray-500">Created: {formatDateTime(booking.createdAt)}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {!booking.auditStatus?.checkIn?.completed && (
              <button
                onClick={() => handleCheckIn(booking._id)}
                disabled={processingBooking === booking._id}
                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                {processingBooking === booking._id ? 'Processing...' : 'Check In'}
              </button>
            )}
            {booking.auditStatus?.checkIn?.completed && !booking.auditStatus?.checkOut?.completed && (
              <button
                onClick={() => handleCheckOut(booking)}
                disabled={processingBooking === booking._id}
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                {processingBooking === booking._id ? 'Processing...' : 'Check Out'}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Room Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Home className="w-4 h-4" />
              Room Details
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Room Number:</span>
                <span className="font-medium">#{booking.roomId?.roomNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Room Type:</span>
                <span className="font-medium capitalize">{booking.roomId?.roomType || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Capacity:</span>
                <span className="font-medium">{booking.roomId?.capacity || 'N/A'} guests</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoomStatusColor(booking.roomId?.status)}`}>
                  {booking.roomId?.status || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Guest Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              Guest Details
            </h4>
            <div className="space-y-2 text-sm">
              {booking.guestId ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{booking.guestId.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{booking.guestId.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{booking.guestId.phone}</span>
                  </div>
                </>
              ) : (
                <div className="text-gray-500 italic">No guest information available</div>
              )}
            </div>
          </div>

          {/* Booking Timeline */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Booking Timeline
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Check-in:</span>
                <span className="font-medium">{formatDateTime(booking.checkInTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Check-out:</span>
                <span className="font-medium">{formatDateTime(booking.checkOutTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">{booking.duration || 'N/A'} nights</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Charges:</span>
                <span className="font-medium">₹{booking?.totalCharges || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
        {checkoutBookingData?._id === booking._id && (
          <CheckoutModal
            isOpen={!!checkoutBookingData}
            onClose={() => setCheckoutBookingData(null)}
            guestData={booking.guestId}
            roomData={booking.roomId}
            bookingData={booking}
          />
        )}
      </div>
    );
  };

  if (loading) {
    return <div className="text-center p-10 text-gray-500">Loading bookings...</div>;
  }

  if (error) {
    return (
      <div className="p-10 text-center text-red-600">
        <AlertCircle className="mx-auto mb-2" />
        <p>{error}</p>
        <button onClick={fetchBookings} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Booking Management</h1>
        {bookings.length === 0 ? (
          <div className="text-center text-gray-600">No bookings found.</div>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <BookingItem key={booking._id} booking={booking} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingManagement;
