const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');

const AppError = require('../utils/appError');

// CREATE
exports.createReview = catchAsync(async (req, res) => {
  const data = await Review.create(req.body);
  return res.status(201).json({ status: 'success', data: { tour: data } });
});

// GET
exports.getReview = catchAsync(async (req, res, next) => {
  const data = await Review.findById(req.params.id);

  if (!data) {
    return next(new AppError(`No tour found with that ${req.params.id}`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: { tours: data },
  });
});

exports.getAllReviews = catchAsync(async (req, res) => {
  const data = await Review.find();

  res.status(200).json({ status: 'success', data });
});

// UPDATE
exports.updateReview = catchAsync(async (req, res, next) => {
  const data = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!data) {
    return next(
      new AppError(`No review found with that id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: 1,
    data: { review: data },
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const data = await Review.findByIdAndDelete(req.params.id);

  if (!data) {
    return next(
      new AppError(`No review found with that ${req.params.id}`, 404)
    );
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
