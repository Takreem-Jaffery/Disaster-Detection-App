const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

const { 
  addPrecaution, 
  getPrecautions, 
  updatePrecaution, 
  deletePrecaution 
} = require('../controller/precautionController');


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


router.get('/view', auth, getPrecautions);

router.put(
  '/update/:id',
  [
    check('disasterType')
      .optional()
      .isIn(['flood', 'rainfall', 'earthquake', 'heatwave']),
    check('severity')
      .optional()
      .isIn(['high', 'medium', 'low']),
    check('title')
      .optional()
      .notEmpty(),
    check('precautions')
      .optional()
      .notEmpty(),
    check('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be true or false')
  ],
  validate,
  auth,
  updatePrecaution
);

router.delete('/delete/:id', auth, deletePrecaution);

module.exports = router;
