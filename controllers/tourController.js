const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');

exports.getAllTours = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  // execute query
  const data = await features.query;

  res.status(200).json({ status: 'success', results: data.length, data: data });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const data = await Tour.findById(req.params.id);

  if (!data) {
    return next(new AppError(`No tour found with that ${req.params.id}`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: { tours: data },
  });
});

exports.createTour = catchAsync(async (req, res) => {
  const newTour = await Tour.create(req.body);
  return res.status(201).json({ status: 'success', data: { tour: newTour } });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const data = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!data) {
    return next(new AppError(`No tour found with that ${req.params.id}`, 404));
  }

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: 1,
    data: { tours: data },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const data = await Tour.findByIdAndDelete(req.params.id);

  if (!data) {
    return next(new AppError(`No tour found with that ${req.params.id}`, 404));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.aliasTopTours = async (req, res, next) => {
  req.query = {
    limit: '5',
    sort: '-ratingsAverage,price',
    fields: 'name,price,difficulty,duration',
  };

  next();
};

exports.getTourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        num: { $sum: 1 },
        averageRating: { $avg: '$ratingsAverage' },
        numRating: { $sum: '$ratingsQuantity' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: {
        avgPrice: 1,
      },
    },
  ]);

  res
    .status(200)
    .json({ stats: 'success', count: stats.length, data: { stats } });
});

exports.getMonthlyPlan = catchAsync(async (req, res) => {
  const year = Number(req.params.year);
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: `$startDates` },
        numOTourStarts: { $sum: 1 },
        tours: { $push: `$name` },
      },
    },
    { $addFields: { month: `$_id` } },
    { $project: { _id: 0 } },
    { $sort: { numOTourStarts: 1 } },
    { $limit: 12 },
  ]);

  res
    .status(200)
    .json({ stats: 'success', count: plan.length, data: { plan } });
});
