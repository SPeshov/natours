const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');

// const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour needs to have a name.'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal 40 characters.'],
      minlength: [10, 'A tour name must have less or equal 40 characters.'],
    },
    slug: String,
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
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty need to be either: easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      required: [true, 'must have ratingsAverage'],
      default: 4.5,
      min: [1, 'rating must be above 1.0'],
      max: [5, 'rating must be above 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
      required: [true, 'must have ratingsQuantity'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only refers  to current document on new crate, wont take new `price' when doing updates
          return val < this.price;
        },
        message: 'Discount price {VALUE} should be lower then regular price.',
      },
    },
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
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: { type: String, default: 'Point', enum: ['Point'] },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: { type: String, default: 'Point', enum: ['Point'] },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// VIRTUAL POPULATE
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// DOCUMENT MIDDLEWARE  runs before save command: save() and create() not many
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.pre('save', function (next) {
  console.log('Will save document...');
  next();
});

tourSchema.pre('save', function (next) {
  console.log('Will save document...');

  next();
});

//QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.startTime = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.startTime} ms`);

  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-passwordChangedAt',
  });
  next();
});

// AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

  next();
});

//
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);

//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
