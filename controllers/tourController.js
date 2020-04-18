const Tour = require('../models/tourModel');

const APIFeatures = require('../utils/apiFeatures');

exports.getAllTours = async (req, res) => {
  try {
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // execute query
    const data = await features.query;

    res
      .status(200)
      .json({ status: 'success', results: data.length, data: data });
  } catch (err) {
    return res.status(404).json({ status: 'fail', data: err.message });
  }
};

exports.getTour = async (req, res) => {
  try {
    const data = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: 1,
      data: { tours: data },
    });
  } catch (err) {
    return res.status(404).json({ status: 'fail', data: err });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    return res.status(201).json({ status: 'success', data: { tour: newTour } });
  } catch (err) {
    return res.status(400).json({ status: 'fail', data: err });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const data = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: 1,
      data: { tours: data },
    });
  } catch (err) {
    return res.status(404).json({ status: 'fail', data: err });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    return res.status(404).json({ status: 'fail', data: err });
  }
};

exports.aliasTopTours = async (req, res, next) => {
  req.query = {
    limit: '5',
    sort: '-ratingsAverage,price',
    fields: 'name,price,difficulty,duration',
  };

  next();
};

exports.getTourStats = async (req, res) => {
  try {
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
      // {
      //   $match: {
      //     _id: { $ne: 'EASY' },
      //   },
      // },
    ]);

    res
      .status(200)
      .json({ stats: 'success', count: stats.length, data: { stats } });
  } catch (err) {
    return res.status(404).json({ status: 'fail', data: err });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
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
  } catch (err) {
    return res.status(404).json({ status: 'fail', data: err });
  }
};
