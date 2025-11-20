const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { register, login, getMe } = require('../controller/authController');
const auth = require('../middleware/auth');

router.post('/register',
    [
        check('name', 'Name is required').notEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
        check('confirmPassword', 'Confirm Password is required')
      .notEmpty()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords do not match');
        }
        return true; // validation passed
      })
    ],
    register
);

router.post('/login',
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').notEmpty()
    ],
    login
);

router.get('/me', auth, getMe);

module.exports = router;