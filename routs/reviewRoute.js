const express = require('express');
const authController = require('../controllers/authController');

const Review = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(authController.protect, Review.getAllReviews)
  .post(authController.protect, Review.setTourUserIds, Review.createReview);

router
  .route('/:id')
  .get(Review.getReview)
  .patch(Review.updateReview)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    Review.deleteReview
  );

module.exports = router;
