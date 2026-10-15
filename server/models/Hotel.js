const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    roomType: {
      type: String,
      required: [true, 'Room type is required'],
      enum: ['Standard', 'Deluxe', 'Premium', 'Suite', 'Cottage'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Room capacity is required'],
      min: [1, 'Capacity must be at least 1'],
    },
    totalRooms: {
      type: Number,
      required: [true, 'Total rooms is required'],
      min: [1, 'Total rooms must be at least 1'],
    },
    availableRooms: {
      type: Number,
      required: [true, 'Available rooms is required'],
      min: [0, 'Available rooms cannot be negative'],
    },
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Base price cannot be negative'],
    },
    amenities: {
      type: [String],
      default: [],
    },
  },
  { _id: true }
);

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Hotel name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
    },
    latitude: {
      type: Number,
      default: 0,
    },
    longitude: {
      type: Number,
      default: 0,
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
    },
    website: {
      type: String,
      default: '',
      trim: true,
    },
    hotelType: {
      type: String,
      required: [true, 'Hotel type is required'],
      trim: true,
    },
    starRating: {
      type: Number,
      min: [1, 'Star rating must be at least 1'],
      max: [5, 'Star rating cannot exceed 5'],
      default: 3,
    },
    amenities: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    ecoFriendly: {
      type: Boolean,
      default: false,
    },
    sustainabilityFeatures: {
      type: [String],
      default: [],
    },
    conservationPrograms: {
      type: [String],
      default: [],
    },
    localActivities: {
      type: [String],
      default: [],
    },
    rooms: {
      type: [roomSchema],
      default: [],
      validate: {
        validator: function validateRooms(value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: 'At least one room is required',
      },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner is required'],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

hotelSchema.index({ city: 1, state: 1, hotelType: 1 });

module.exports = mongoose.model('Hotel', hotelSchema);
