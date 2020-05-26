const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const data = await Model.findByIdAndDelete(req.params.id);

    if (!data) {
      return next(
        new AppError(`No document found with that ${req.params.id}`, 404)
      );
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const data = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!data) {
      return next(
        new AppError(`No document found with that ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: 1,
      data: { data },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res) => {
    const data = await Model.create(req.body);
    return res.status(201).json({ status: 'success', data: { data } });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) {
      query = query.populate(popOptions);
    }
    const data = await query;
    if (!data) {
      return next(
        new AppError(`No document found with that id ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      status: 'success',
      data: { tours: data },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res) => {
    //to allow for nested get reviews on tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const apiFeatures = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // execute query
    const data = await apiFeatures.query;

    res
      .status(200)
      .json({ status: 'success', results: data.length, data: data });
  });
