const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();

  res.status(200).json({ status: 'success', data: { users } });
});
exports.getUser = (req, res) => {
  res.status(500).json({ status: 'error', message: 'route not yet defined' });
};

exports.createUser = (req, res) => {
  res.status(500).json({ status: 'error', message: 'route not yet defined' });
};

exports.updateUser = (req, res) => {
  res.status(500).json({ status: 'error', message: 'route not yet defined' });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({ status: 'error', message: 'route not yet defined' });
};
