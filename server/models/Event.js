const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    city: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    state: {
      type: String,
      default: '',
      trim: true,
    },
    country: {
      type: String,
      default: 'Indonesia',
      trim: true,
    },
    category: {
      type: String,
      default: 'festival',
      trim: true,
    },
    impact: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    startDate: {
      type: Date,
      required: [true, 'Event start date is required'],
      index: true,
    },
    endDate: {
      type: Date,
      default: null,
    },
    latitude: {
      type: Number,
      default: 0,
    },
    longitude: {
      type: Number,
      default: 0,
    },
    sourceName: {
      type: String,
      default: 'local-feed',
      trim: true,
    },
    sourceUrl: {
      type: String,
      default: '',
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

eventSchema.index({ city: 1, startDate: 1 });

eventSchema.index({ latitude: 1, longitude: 1 });

module.exports = mongoose.model('Event', eventSchema);
