const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/signup', auth.sendSignupOTP);
router.post('/verify-signup', auth.verifySignupOTP);
router.post('/login', auth.login);
router.post('/forgot-password', auth.forgotPassword);
router.post('/verify-reset-otp', auth.verifyResetOTP);
router.post('/reset-password', auth.resetPassword);
router.put('/change-password', protect, auth.changePassword);
router.get('/me', protect, auth.getMe);

module.exports = router;
