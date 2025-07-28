const express = require('express');
const { loginUser, signupUser } = require('../controllers/authController');
const router = express.Router();

// POST /api/auth/signup
router.post('/signup', signupUser);

// POST /api/auth/login
router.post('/login', loginUser);

module.exports = router;