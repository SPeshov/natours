const Tour = require('../models/tourModel');

exports.getAllTours = (req, res) => {
  res.status(200).json({ status: 'success', results: 0, data: '' });
};

exports.getTour = (req, res) => {
  console.log(req.requestTime);

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: 1,
    data: { tours: '' },
  });
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    return res.status(201).json({ status: 'success', data: { tour: newTour } });
  } catch (err) {
    return res.status(400).json({ status: 'fail', data: err });
  }
};
