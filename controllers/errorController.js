const AppError = require('../utils/appError');

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.statusCode,
    err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  //Operational error taht we trust
  if (err.isOperational) {
    res
      .status(err.statusCode)
      .json({ status: err.statusCode, message: err.message });
  } else {
    //Programming or other unknown error: don't leak error details
    //1) log it
    console.error('ERROR 💥', err);

    //2) send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong',
      isOP: err.isOperational,
    });
  }
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value} `;
  return new AppError(message, 404);
};

const handleDuplicateFieldError = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/);
  console.log('value :', value);
  const message = `Duplicate filed value ${err.path}: ${err.value} `;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;

  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token, please log in again.', 401);
const handleJWTExpired = () => new AppError('Token expired, log in again', 401);

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  }

  if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldError(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
    if (error.name === 'TokenExpiredError') error = handleJWTExpired(error);

    sendErrorProd(error, res);
  }
};
