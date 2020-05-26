const express = require('express');
const authController = require('../controllers/authController');

const Review = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true });

// protect all routes after this middleware
router.use(authController.protect);

router
  .route('/')
  .get(Review.getAllReviews)
  .post(
    authController.restrictTo('user', 'admin'),
    Review.setTourUserIds,
    Review.createReview
  );

router
  .route('/:id')
  .get(Review.getReview)
  .patch(authController.restrictTo('user', 'admin'), Review.updateReview)
  .delete(authController.restrictTo('user', 'admin'), Review.deleteReview);

module.exports = router;
