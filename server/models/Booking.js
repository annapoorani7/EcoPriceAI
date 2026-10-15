const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: [true, 'Hotel is required'],
      index: true,
    },
    roomType: {
      type: String,
      required: [true, 'Room type is required'],
      trim: true,
    },
    numberOfRooms: {
      type: Number,
      required: [true, 'Number of rooms is required'],
      min: [1, 'At least one room must be booked'],
    },
    guestName: {
      type: String,
      required: [true, 'Guest name is required'],
      trim: true,
    },
    guestEmail: {
      type: String,
      required: [true, 'Guest email is required'],
      trim: true,
    },
    guestPhone: {
      type: String,
      required: [true, 'Guest phone is required'],
      trim: true,
    },
    numberOfGuests: {
      type: Number,
      required: [true, 'Number of guests is required'],
      min: [1, 'At least one guest is required'],
    },
    checkInDate: {
      type: Date,
      required: [true, 'Check-in date is required'],
    },
    checkOutDate: {
      type: Date,
      required: [true, 'Check-out date is required'],
    },
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Base price cannot be negative'],
    },
    numberOfNights: {
      type: Number,
      required: [true, 'Number of nights is required'],
      min: [1, 'Stay must be at least one night'],
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
    },
    bookingStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'unpaid',
    },
    specialRequests: {
      type: String,
      default: '',
      trim: true,
    },
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ hotel: 1, createdAt: 1 });
bookingSchema.index({ hotel: 1, checkInDate: 1 });

bookingSchema.pre('validate', function setReference(next) {
  if (!this.bookingReference) {
    this.bookingReference = `BK-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
