const Tour = require('../models/tourModel');

exports.getAllTours = async (req, res) => {
  try {
    const data = await Tour.find();
    res
      .status(200)
      .json({ status: 'success', results: data.length, data: data });
  } catch (err) {
    return res.status(404).json({ status: 'fail', data: err });
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
