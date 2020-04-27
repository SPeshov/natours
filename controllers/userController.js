const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const filterObj = (obj, ...allowedFields) => {
  Object.keys(obj).forEach((el) => {
    const newObj = {};
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }

    return newObj;
  });
};

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

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user tries  to update password
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError(`This route is not for password updates `, 400));
  }
  // 2) Update user data

  const update = filterObj(req.body, 'name', 'email');
  const newUser = await User.findByIdAndUpdate(req.user.id, update, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ status: 'success', data: { user: newUser } });
});

exports.deleteMe = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({ status: 'success', data: null });
});
