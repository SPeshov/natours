const express = require('express');

const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoute');

const {
  getTour,
  createTour,
  getAllTours,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistances,
} = require('../controllers/tourController');

const router = express.Router();

router.route('/top-5-tours').get(aliasTopTours, getAllTours);
router.route('/stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin);
// /tours-within/223/center/-40,45/unit/mi

router.route('/distances/:latlng/unit/:unit').get(getDistances);

router
  .route('/')
  .get(authController.protect, getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    createTour
  );

router
  .route('/:id')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide', 'user'),
    getTour
  )
  .patch(updateTour)
  .delete(authController.protect, deleteTour);

router.use('/:tourId/reviews', reviewRouter);

module.exports = router;
