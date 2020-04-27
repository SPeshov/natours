const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = userController;

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword
);

router.patch('/updateMe', authController.protect, userController.updateMe);

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
//
