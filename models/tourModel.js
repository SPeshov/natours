const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour needs to have a name.'],
    unique: true,
    trim: true,
  },
  rating: { type: Number, default: 4.5 },
  price: { type: Number, required: true },
  duration: {
    type: Number,
    required: [true, 'must have duration'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'must have size'],
  },
  difficulty: {
    type: String,
    required: [true, 'must have difficulty level'],
  },
  ratingsAverage: {
    type: Number,
    required: [true, 'must have ratingsAverage'],
    default: 4.5,
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
    required: [true, 'must have ratingsQuantity'],
  },
  priceDiscount: Number,
  summary: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    required: true,
  },
  imageCover: {
    type: String,
    trim: true,
    required: [true, 'must have img url'],
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  startDates: [Date],
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
