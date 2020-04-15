const express = require('express');

const {
  getTour,
  createTour,
  getAllTours,
  checkID,
  checkBody,
} = require('../controllers/tourController');

const router = express.Router();

router.param('id', checkID);

router.route('/').get(getAllTours).post(checkBody, createTour);
router.route('/:id').get(getTour);

module.exports = router;
