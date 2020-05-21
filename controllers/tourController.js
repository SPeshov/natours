const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

// const AppError = require('../utils/appError');

const Factory = require('./handlerFactory');

exports.getAllTours = Factory.getAll(Tour);

exports.getTour = Factory.getOne(Tour, 'reviews');

exports.createTour = Factory.createOne(Tour);
exports.updateTour = Factory.updateOne(Tour);
exports.deleteTour = Factory.deleteOne(Tour);

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
