const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/appError');

const Factory = require('./handlerFactory');

exports.updateUser = Factory.updateOne(User);
exports.getAllUsers = Factory.getAll(User);
exports.deleteUser = Factory.deleteOne(User);
// DO NOT update passwords with this!
exports.updateMe = Factory.updateOne(User);

exports.createUser = (req, res) => {
  res.status(500).json({ status: 'error', message: 'route not yet defined' });
};

exports.deleteMe = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({ status: 'success', data: null });
});

exports.getUser = Factory.getOne(User);
