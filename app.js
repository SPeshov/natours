const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routs/tourRoutes');
const userRouter = require('./routs/userRouter');

const app = express();

//1) MIDDLEWARE
app.use(morgan('dev'));
app.use(express.json()); // data from the body will be added req object

app.use((res, req, next) => {
  console.log('Hello middle 🥩');
  next();
});

app.use((res, req, next) => {
  req.requestTime = new Date().toISOString();
  console.log('req.requestTime', req.requestTime);
  next();
});

// 3) ROUTES
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);

// 4) START SERVER

module.exports = app;
