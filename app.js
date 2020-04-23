const express = require('express');
const morgan = require('morgan');
const mquery = require('express-mquery');

const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routs/tourRoutes');
const userRouter = require('./routs/userRouter');

const app = express();

app.use(mquery());

//1) MIDDLEWARE
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json()); // data from the body will be added req object
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log('req.requestTime', req.requestTime);
  console.log('req.headers ...:::', req.headers);

  next();
});

// 3) ROUTES
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);

const AppError = require('./utils/appError');

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server.`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
