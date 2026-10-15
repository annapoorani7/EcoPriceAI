import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { bookingService, hotelService } from '../../services/apiService';
import './Bookings.css';

const formatDate = (value) => {
  if (!value) return 'Not available';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Not available' : date.toLocaleDateString();
};

const formatCurrency = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? `₹${amount.toLocaleString('en-IN')}` : 'Not available';
};

const normalizeBooking = (booking, fallback = {}) => ({
  ...booking,
  id: booking._id,
  guestName: booking.guestName || fallback.guestName || 'Not available',
  hotel: booking.hotel?.name || fallback.hotel || 'Not available',
  roomType: booking.roomType || fallback.roomType || 'Not available',
  checkIn: formatDate(booking.checkInDate) || fallback.checkIn || 'Not available',
  checkOut: formatDate(booking.checkOutDate) || fallback.checkOut || 'Not available',
  status: booking.bookingStatus || fallback.status || 'Not available',
  price: formatCurrency(booking.totalAmount ?? fallback.totalAmount),
});

const StatusPill = ({ status }) => {
  const map = {
    confirmed: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
  };
  const label = status === 'Not available' ? status : status.charAt(0).toUpperCase() + status.slice(1);
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[status] || 'bg-gray-100 text-gray-800'}`}>{label}</span>;
};

const initialBookingForm = {
  hotelId: '',
  roomType: '',
  numberOfRooms: 1,
  guestName: '',
  guestEmail: '',
  guestPhone: '',
  numberOfGuests: 1,
  checkInDate: '',
  checkOutDate: '',
  specialRequests: '',
};

const createBookingRequestId = () => (
  window.crypto?.randomUUID
    ? window.crypto.randomUUID()
    : `booking-${Date.now()}-${Math.random().toString(36).slice(2)}`
);

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cancellingId, setCancellingId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formState, setFormState] = useState(initialBookingForm);
  const [bookingRequestId, setBookingRequestId] = useState('');
  const [formError, setFormError] = useState('');
  const [creating, setCreating] = useState(false);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await bookingService.getMyBookings();
      setBookings(Array.isArray(response.bookings) ? response.bookings.map(normalizeBooking) : []);
    } catch (err) {
      setError(err.message || 'Unable to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadHotels = useCallback(async () => {
    try {
      const response = await hotelService.getHotels();
      const availableHotels = Array.isArray(response.hotels) ? response.hotels : [];
      setHotels(availableHotels);
      if (!availableHotels.length) {
        setFormState((current) => ({ ...current, hotelId: '', roomType: '' }));
      }
    } catch (err) {
      setHotels([]);
      setFormState((current) => ({ ...current, hotelId: '', roomType: '' }));
    }
  }, []);

  useEffect(() => {
    loadBookings();
    loadHotels();
  }, [loadBookings, loadHotels]);

  const selectedHotel = useMemo(
    () => hotels.find((hotel) => hotel._id === formState.hotelId) || null,
    [formState.hotelId, hotels]
  );

  const selectedRoom = useMemo(
    () => (selectedHotel?.rooms || []).find((room) => room.roomType === formState.roomType) || null,
    [formState.roomType, selectedHotel]
  );

  const filtered = useMemo(() => {
    let list = bookings;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((b) => b.guestName.toLowerCase().includes(q) || b.hotel.toLowerCase().includes(q) || b.roomType.toLowerCase().includes(q));
    }
    if (statusFilter !== 'All') list = list.filter((b) => b.status === statusFilter.toLowerCase());
    return list;
  }, [bookings, query, statusFilter]);

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const start = (page - 1) * perPage;
  const pageItems = filtered.slice(start, start + perPage);

  const resetCreateForm = () => {
    setFormState(initialBookingForm);
    setFormError('');
  };

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(pages, p + 1));

  const handleCancel = async (booking) => {
    if (!window.confirm(`Cancel booking for ${booking.guestName}?`)) return;

    setCancellingId(booking.id);
    setError('');
    setSuccess('');
    try {
      const response = await bookingService.cancelBooking(booking.id);
      const updatedBooking = response.booking ? normalizeBooking(response.booking, { ...booking, status: 'cancelled' }) : { ...booking, status: 'cancelled' };
      setBookings((currentBookings) => currentBookings.map((item) => (item.id === booking.id ? updatedBooking : item)));
      setSuccess('Booking cancelled successfully.');
    } catch (err) {
      setError(err.message || 'Unable to cancel booking. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  const handleCreateBooking = async (event) => {
    event.preventDefault();
    setFormError('');

    if (!formState.hotelId || !formState.roomType || !formState.guestName.trim() || !formState.guestEmail.trim() || !formState.guestPhone.trim() || !formState.checkInDate || !formState.checkOutDate) {
      setFormError('Please complete all required booking details.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formState.guestEmail.trim())) {
      setFormError('Please enter a valid guest email address.');
      return;
    }

    if (formState.guestPhone.trim().length < 7) {
      setFormError('Please enter a valid guest phone number.');
      return;
    }

    if (Number(formState.numberOfGuests) < 1 || Number(formState.numberOfRooms) < 1) {
      setFormError('At least 1 guest and 1 room are required.');
      return;
    }

    if (!selectedHotel || !selectedRoom) {
      setFormError('Please select a valid hotel and room type.');
      return;
    }

    if (Number(formState.numberOfRooms) > Number(selectedRoom.availableRooms)) {
      setFormError(`Only ${selectedRoom.availableRooms} room(s) are available for this selection.`);
      return;
    }

    const checkIn = new Date(formState.checkInDate);
    const checkOut = new Date(formState.checkOutDate);
    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime()) || checkIn >= checkOut) {
      setFormError('Check-out date must be after the check-in date.');
      return;
    }

    try {
      setCreating(true);
      const payload = {
        hotelId: formState.hotelId,
        roomType: formState.roomType,
        numberOfRooms: Number(formState.numberOfRooms),
        guestName: formState.guestName.trim(),
        guestEmail: formState.guestEmail.trim(),
        guestPhone: formState.guestPhone.trim(),
        numberOfGuests: Number(formState.numberOfGuests),
        checkInDate: formState.checkInDate,
        checkOutDate: formState.checkOutDate,
        specialRequests: formState.specialRequests.trim(),
      };

      const response = await bookingService.createBooking(payload, bookingRequestId);
      const bookingReference = response.booking?.bookingReference || 'N/A';
      setSuccess(`Booking created successfully. Reference: ${bookingReference}`);
      setError('');
      setShowCreateModal(false);
      resetCreateForm();
      setBookingRequestId('');
      await loadBookings();
    } catch (err) {
      setFormError(err.message || 'Unable to create booking. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="page-shell bookings-page">
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <p className="soft-badge">Reservations</p>
            <h1>Booking History</h1>
            <p className="booking-intro">Review reservations and manage booking status for your account.</p>
          </div>
          <div className="booking-header-actions">
            <button
              type="button"
              className="primary-btn booking-create-btn"
              onClick={() => {
                resetCreateForm();
                setBookingRequestId(createBookingRequestId());
                setShowCreateModal(true);
              }}
            >
              Create Booking
            </button>
            <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Search guest, hotel, room type" className="flex-1 sm:flex-none px-3 py-2 border rounded-md" />
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="px-3 py-2 border rounded-md">
              <option>All</option>
              <option>Pending</option>
              <option>Confirmed</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>
          </div>
        </div>

        {loading && <div className="booking-state">Loading bookings...</div>}
        {error && <div className="booking-feedback booking-error">{error}</div>}
        {success && <div className="booking-feedback booking-success">{success}</div>}

        {showCreateModal && (
          <div className="booking-modal-backdrop" onClick={() => setShowCreateModal(false)}>
            <div className="booking-modal" onClick={(event) => event.stopPropagation()}>
              <div className="booking-modal-header">
                <h2>Create Booking</h2>
                <button type="button" className="booking-modal-close" onClick={() => setShowCreateModal(false)} aria-label="Close booking form">×</button>
              </div>

              <form onSubmit={handleCreateBooking} className="booking-form-grid">
                <div className="booking-field-group">
                  <label>Hotel</label>
                  <select
                    value={formState.hotelId}
                    onChange={(event) => {
                      setFormState((current) => ({ ...current, hotelId: event.target.value, roomType: '', numberOfRooms: 1 }));
                      setFormError('');
                    }}
                  >
                    <option value="">Select a hotel</option>
                    {hotels.map((hotel) => (
                      <option key={hotel._id} value={hotel._id}>{hotel.name}</option>
                    ))}
                  </select>
                </div>

                <div className="booking-field-group">
                  <label>Room type</label>
                  <select
                    value={formState.roomType}
                    onChange={(event) => {
                      setFormState((current) => ({ ...current, roomType: event.target.value }));
                      setFormError('');
                    }}
                    disabled={!selectedHotel || !selectedHotel.rooms?.length}
                  >
                    <option value="">Select a room type</option>
                    {(selectedHotel?.rooms || []).map((room) => (
                      <option key={room._id || room.roomType} value={room.roomType}>{room.roomType}</option>
                    ))}
                  </select>
                </div>

                <div className="booking-field-group">
                  <label>Number of rooms</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedRoom?.availableRooms || 1}
                    value={formState.numberOfRooms}
                    onChange={(event) => setFormState((current) => ({ ...current, numberOfRooms: Number(event.target.value) || 1 }))}
                  />
                </div>

                <div className="booking-field-group">
                  <label>Guest name</label>
                  <input type="text" value={formState.guestName} onChange={(event) => setFormState((current) => ({ ...current, guestName: event.target.value }))} />
                </div>

                <div className="booking-field-group">
                  <label>Guest email</label>
                  <input type="email" value={formState.guestEmail} onChange={(event) => setFormState((current) => ({ ...current, guestEmail: event.target.value }))} />
                </div>

                <div className="booking-field-group">
                  <label>Guest phone</label>
                  <input type="tel" value={formState.guestPhone} onChange={(event) => setFormState((current) => ({ ...current, guestPhone: event.target.value }))} />
                </div>

                <div className="booking-field-group">
                  <label>Number of guests</label>
                  <input type="number" min="1" value={formState.numberOfGuests} onChange={(event) => setFormState((current) => ({ ...current, numberOfGuests: Number(event.target.value) || 1 }))} />
                </div>

                <div className="booking-field-group">
                  <label>Check-in</label>
                  <input type="date" value={formState.checkInDate} onChange={(event) => setFormState((current) => ({ ...current, checkInDate: event.target.value }))} />
                </div>

                <div className="booking-field-group">
                  <label>Check-out</label>
                  <input type="date" value={formState.checkOutDate} onChange={(event) => setFormState((current) => ({ ...current, checkOutDate: event.target.value }))} />
                </div>

                <div className="booking-field-group booking-field-full">
                  <label>Special requests</label>
                  <textarea value={formState.specialRequests} onChange={(event) => setFormState((current) => ({ ...current, specialRequests: event.target.value }))} rows="3" />
                </div>

                {selectedRoom && (
                  <div className="booking-room-summary booking-field-full">
                    <span>Available rooms: {selectedRoom.availableRooms}</span>
                    <span>Base price: ₹{Number(selectedRoom.basePrice).toLocaleString('en-IN')}</span>
                  </div>
                )}

                {formError && <div className="booking-feedback booking-error booking-field-full">{formError}</div>}

                <div className="booking-form-actions booking-field-full">
                  <button type="button" className="secondary-btn" onClick={() => setShowCreateModal(false)}>Cancel</button>
                  <button type="submit" className="primary-btn" disabled={creating}>
                    {creating ? 'Creating...' : 'Create Booking'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Guest Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Hotel</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Room Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Check-in</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Check-out</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Price</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-gray-500">Bookings will appear here after reservations are recorded.</td>
                  </tr>
                )}
                {pageItems.map((b) => (
                  <tr key={b.id} className="border-t">
                    <td className="px-4 py-4">{b.guestName}</td>
                    <td className="px-4 py-4">{b.hotel}</td>
                    <td className="px-4 py-4">{b.roomType}</td>
                    <td className="px-4 py-4">{b.checkIn}</td>
                    <td className="px-4 py-4">{b.checkOut}</td>
                    <td className="px-4 py-4"><StatusPill status={b.status} /></td>
                    <td className="px-4 py-4 text-right font-medium">{b.price}</td>
                    <td className="px-4 py-4 text-right">
                      {b.status !== 'cancelled' && b.status !== 'completed' && (
                        <button onClick={() => handleCancel(b)} disabled={cancellingId === b.id} className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded disabled:opacity-50">
                          {cancellingId === b.id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && bookings.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
            <div className="flex items-center gap-2">
              <button onClick={handlePrev} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50" disabled={page === 1}>Previous</button>
              <button onClick={handleNext} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50" disabled={page === pages}>Next</button>
              <div className="text-sm text-gray-600">Page {page} of {pages}</div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-600">Rows per page:</div>
              <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }} className="px-2 py-1 border rounded">
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
              <div className="text-sm text-gray-600">({total} results)</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;
