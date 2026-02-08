const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Validators
const registerValidator = [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('full_name').notEmpty()
];

const loginValidator = [
  body('email').isEmail(),
  body('password').notEmpty()
];

// Public
router.post('/register', registerValidator, authController.register);
router.post('/login', loginValidator, authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected
router.post('/logout', authMiddleware, authController.logout);
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);
router.get('/stats', authMiddleware, authController.getUserStats);

module.exports = router;
