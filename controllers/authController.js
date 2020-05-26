const util = require('util');
const crypto = require('crypto');

const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'prod') {
    cookieOptions.secure = true;
  }

  console.log('cookieOptions :>> ', cookieOptions);

  res.cookie('jwt', cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, role } = req.body;
  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    role,
  });

  if (!newUser) {
    return next(new AppError('User creation failed', 500));
  }

  createAndSendToken(newUser, 201, res);
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

  createAndSendToken(user, 200, res);
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
  console.log('currentUser:', currentUser);
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles ['admin', 'lead-tour']

    console.log(roles, req.user.role);

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You dont have permissions to preform these actions', 403)
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on posted email
  const currentUser = await User.findOne({ email: req.body.email });
  if (!currentUser) {
    return next(new AppError('There is no user with that email.', 404));
  }
  // 2) Generate random token

  const resetToken = currentUser.createPasswordResetToken();
  await currentUser.save({ validateBeforeSave: false });

  // 3) send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH to request with you new password and paswordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email.`;
  try {
    await sendEmail({
      message,
      email: currentUser.email,
      subject: 'Your password reset token (valid 10min)',
    });
  } catch (error) {
    currentUser.passwordResetToken = undefined;
    currentUser.passwordResetExpires = undefined;
    await currentUser.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!')
    );
  }

  res
    .status(200)
    .json({ status: 'success', message: 'token send to your email' });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on token

  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // 2) if token has not expired, and there is user, set the new password
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // 3) Update changedAtPassword property for the user

  // 4) Log the user in, send JWT

  createAndSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('password');

  // 2) Check if posted current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 400));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  // User.findByIdAndUpdate will not work as intended, so we use .save() will trigger document middleware
  await user.save();

  // 4) Log user in, send JWT
  createAndSendToken(user, 200, res);
});
