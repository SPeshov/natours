const util = require('util');

const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;
  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
  });

  if (!newUser) {
    return next(new AppError('User creation failed', 500));
  }

  const token = signToken(newUser.id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1) Check if email and pass exists
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 500));
  }

  //2) check if user exists and pass is correct

  const user = await User.findOne({ email }).select('+password');
  console.log('user :', user);

  const correct = user && (await user.correctPassword(password, user.password));

  if (!user || !correct) {
    return next(new AppError('Incorrect email or password', 401));
  }

  //3) if everything is ok, send token to client

  const token = signToken(user.id);
  res.status(200).json({ status: 'success', token });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) get token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError(
        'You are not logged in, please log in again to get access',
        401
      )
    );
  }
  // 2) validate token - verification
  const decoded = await util.promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  // 3) check if user still exist
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError(
        'You are not logged in, please log in again to get access',
        401
      )
    );
  }
  // 4) check if user changed password after the token was issues

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('You recently changed password', 401));
  }

  // GRANT USER DATA TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});
