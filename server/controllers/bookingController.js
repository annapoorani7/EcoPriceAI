const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');

const getRoomAvailability = (hotel, roomType) => {
  const room = hotel.rooms.find((item) => item.roomType === roomType);
  return room || null;
};

const createBooking = async (req, res) => {
  try {
    const idempotencyKey = req.get('Idempotency-Key');
    if (!idempotencyKey || idempotencyKey.length > 128) {
      return res.status(400).json({
        success: false,
        message: 'A valid booking request key is required. Please retry the booking.',
      });
    }

    const previousBooking = await Booking.findOne({ user: req.user._id, idempotencyKey })
      .populate('user', 'name email')
      .populate('hotel', 'name city state');

    if (previousBooking) {
      return res.status(200).json({
        success: true,
        message: 'This booking request was already completed.',
        booking: previousBooking,
      });
    }

    const {
      hotelId,
      roomType,
      numberOfRooms,
      guestName,
      guestEmail,
      guestPhone,
      numberOfGuests,
      checkInDate,
      checkOutDate,
      specialRequests,
    } = req.body;

    if (!hotelId || !roomType || !guestName || !guestEmail || !guestPhone || !checkInDate || !checkOutDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required booking fields',
      });
    }

    if (!['admin', 'hotelOwner', 'customer'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to create bookings',
      });
    }

    const normalizedNumberOfRooms = Number(numberOfRooms);
    const normalizedNumberOfGuests = Number(numberOfGuests ?? 1);

    if (!Number.isFinite(normalizedNumberOfRooms) || normalizedNumberOfRooms < 1) {
      return res.status(400).json({
        success: false,
        message: 'Number of rooms must be at least 1',
      });
    }

    if (!Number.isFinite(normalizedNumberOfGuests) || normalizedNumberOfGuests < 1) {
      return res.status(400).json({
        success: false,
        message: 'Number of guests must be at least 1',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(hotelId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid hotel ID',
      });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime()) || checkIn >= checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Check-in date must be before check-out date',
      });
    }

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found',
      });
    }

    if (req.user.role === 'hotelOwner' && hotel.owner?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to create bookings for this hotel',
      });
    }

    const room = getRoomAvailability(hotel, roomType);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room type not found for this hotel',
      });
    }

    if (normalizedNumberOfRooms > room.availableRooms) {
      return res.status(409).json({
        success: false,
        message: 'Insufficient room availability for the selected dates',
      });
    }

    if (normalizedNumberOfGuests > room.capacity * normalizedNumberOfRooms) {
      return res.status(400).json({
        success: false,
        message: `The selected rooms can accommodate up to ${room.capacity * normalizedNumberOfRooms} guest(s)`,
      });
    }

    const numberOfNights = Math.max(1, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)));
    const basePrice = Number(room.basePrice);
    const totalAmount = numberOfNights * basePrice * normalizedNumberOfRooms;

    const bookingPayload = {
      user: req.user._id,
      hotel: hotelId,
      roomType,
      numberOfRooms: normalizedNumberOfRooms,
      guestName: String(guestName).trim(),
      guestEmail: String(guestEmail).trim(),
      guestPhone: String(guestPhone).trim(),
      numberOfGuests: normalizedNumberOfGuests,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      basePrice,
      numberOfNights,
      totalAmount,
      specialRequests: specialRequests || '',
      bookingReference: `BK-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      idempotencyKey,
    };

    let createdBooking;
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        const hotelWithAvailability = await Hotel.findOne(
          {
            _id: hotelId,
            'rooms.roomType': roomType,
            'rooms.availableRooms': { $gte: normalizedNumberOfRooms },
          },
          { 'rooms.$': 1 }
        ).session(session);

        if (!hotelWithAvailability) {
          throw Object.assign(new Error('Selected room type is no longer available'), { statusCode: 409 });
        }

        const existingRoom = hotelWithAvailability.rooms.find((item) => item.roomType === roomType);
        if (!existingRoom) {
          throw Object.assign(new Error('Room type not found for this hotel'), { statusCode: 404 });
        }

        const hotelUpdate = await Hotel.findOneAndUpdate(
          {
            _id: hotelId,
            'rooms.roomType': roomType,
            'rooms.availableRooms': { $gte: normalizedNumberOfRooms },
          },
          {
            $inc: { 'rooms.$.availableRooms': -normalizedNumberOfRooms },
          },
          { new: true, session }
        );

        if (!hotelUpdate) {
          throw Object.assign(new Error('Selected room type is no longer available'), { statusCode: 409 });
        }

        const [created] = await Booking.create([bookingPayload], { session });
        createdBooking = created;
      });
    } finally {
      session.endSession();
    }

    const populatedBooking = await Booking.findById(createdBooking._id)
      .populate('user', 'name email')
      .populate('hotel', 'name city state');

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: populatedBooking,
    });
  } catch (error) {
    console.error('Create booking error:', error);

    if (error.code === 11000 && error.keyPattern?.idempotencyKey) {
      const previousBooking = await Booking.findOne({
        user: req.user._id,
        idempotencyKey: req.get('Idempotency-Key'),
      })
        .populate('user', 'name email')
        .populate('hotel', 'name city state');

      if (previousBooking) {
        return res.status(200).json({
          success: true,
          message: 'This booking request was already completed.',
          booking: previousBooking,
        });
      }
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    const transactionUnavailable = /Transaction numbers are only allowed/i.test(error.message || '');
    return res.status(error.statusCode || (transactionUnavailable ? 503 : 500)).json({
      success: false,
      message: error.statusCode
        ? error.message
        : 'Unable to complete your booking right now. Please try again shortly.',
    });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('hotel', 'name city state')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error('Get my bookings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching your bookings',
    });
  }
};

const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID',
      });
    }

    const booking = await Booking.findById(id)
      .populate('user', 'name email')
      .populate('hotel', 'name city state');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (req.user.role !== 'admin' && booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this booking',
      });
    }

    return res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error('Get booking error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching booking',
    });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const { bookingStatus, paymentStatus, hotel, startDate, endDate } = req.query;
    const filter = {};

    if (bookingStatus) filter.bookingStatus = bookingStatus;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (hotel) filter.hotel = hotel;

    if (startDate || endDate) {
      filter.checkInDate = {};
      if (startDate) filter.checkInDate.$gte = new Date(startDate);
      if (endDate) filter.checkInDate.$lte = new Date(endDate);
    }

    const bookings = await Booking.find(filter)
      .populate('user', 'name email')
      .populate('hotel', 'name city state')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error('Get all bookings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching bookings',
    });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { bookingStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID',
      });
    }

    const booking = await Booking.findById(id).populate('hotel', 'rooms');
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can update booking status',
      });
    }

    const allowedTransitions = {
      pending: ['confirmed'],
      confirmed: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
    };

    if (!allowedTransitions[booking.bookingStatus]?.includes(bookingStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking status transition',
      });
    }

    booking.bookingStatus = bookingStatus;

    if (bookingStatus === 'cancelled') {
      if (booking.bookingStatus === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Completed bookings cannot be cancelled',
        });
      }

      if (booking.bookingStatus !== 'cancelled' && booking.paymentStatus !== 'refunded') {
        const hotel = await Hotel.findById(booking.hotel._id);
        const room = hotel && hotel.rooms.find((item) => item.roomType === booking.roomType);
        if (room) {
          room.availableRooms += booking.numberOfRooms;
          await hotel.save();
        }
      }
    }

    const updatedBooking = await booking.save();

    return res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      booking: updatedBooking,
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating booking status',
    });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID',
      });
    }

    const booking = await Booking.findById(id).populate('hotel', 'rooms');
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (req.user.role !== 'admin' && booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this booking',
      });
    }

    if (booking.bookingStatus === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Completed bookings cannot be cancelled',
      });
    }

    if (booking.bookingStatus === 'cancelled' || booking.paymentStatus === 'refunded') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled',
      });
    }

    const hotel = await Hotel.findById(booking.hotel._id);
    const room = hotel && hotel.rooms.find((item) => item.roomType === booking.roomType);
    if (room) {
      room.availableRooms += booking.numberOfRooms;
      await hotel.save();
    }

    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = 'refunded';
    const updatedBooking = await booking.save();

    return res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      booking: updatedBooking,
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while cancelling booking',
    });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  getAllBookings,
  updateBookingStatus,
  cancelBooking,
};
