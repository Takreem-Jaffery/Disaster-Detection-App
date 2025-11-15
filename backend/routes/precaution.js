const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { addPrecaution, getPrecautions } = require('../controller/precautionController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

// @route   POST /api/precautions/add
// @desc    Add a new precaution
// @access  Public (no auth for now)
router.post(
  '/add',
  [
    check('disasterType', 'Disaster type is required')
      .isIn(['flood', 'rainfall', 'earthquake', 'heatwave']),
    check('severity', 'Severity is required')
      .isIn(['high', 'medium', 'low']),
    check('title', 'Title is required').notEmpty(),
    check('precautions', 'Precautions details are required').notEmpty(),
    check('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be true or false')
  ],
  validate, 
  auth,  
  addPrecaution
);

// @route   GET /api/precautions/view
// @desc    Get all precautions (with optional filters in query params)
// @access  Public
router.get('/view', auth, getPrecautions);

module.exports = router;
