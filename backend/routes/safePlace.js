const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

const safeController = require('../controller/safePlaceController');
const roleAdmin = require('../middleware/roleAdmin'); // use your admin middleware
const auth = require('../middleware/auth');

// validation chain for create and update
const validate = [
  body('name').optional().isString().trim().isLength({ min: 1 }),
  body('description').optional().isString(),
  body('address').optional().isString(),
  body('contact').optional().isString(),
  body('capacity').optional().isInt({ min: 0 }),
  body('lat').optional().isFloat({ min: -90, max: 90 }),
  body('lng').optional().isFloat({ min: -180, max: 180 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  }
];

// public listing & detail
router.get('/listSafePlace', auth, safeController.listSafePlaces);
router.get('/getSafePlace/:id', auth, safeController.getSafePlace);

// admin-only create / update / delete
router.post('/create', auth, roleAdmin, validate, safeController.createSafePlace);
router.put('/update/:id', auth, roleAdmin, validate, safeController.updateSafePlace);
router.delete('/delete/:id', auth, roleAdmin, safeController.deleteSafePlace);

module.exports = router;
