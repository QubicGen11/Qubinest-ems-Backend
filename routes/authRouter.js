const express = require('express');
const {
    registerUser, 
    loginUser,
    logoutUser, 
    getAllUsers,
    changePassword,
    verifyOTP,
    resendOTP,
    updateUserStatus
} = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.put('/changepassword', changePassword);
router.get('/allusers', getAllUsers);
router.put('/updateUserStatus', updateUserStatus);
module.exports = router;