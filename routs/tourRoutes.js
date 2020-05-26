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
} = require('../controllers/tourController');

const router = express.Router();

router.route('/top-5-tours').get(aliasTopTours, getAllTours);
router.route('/stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);

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
