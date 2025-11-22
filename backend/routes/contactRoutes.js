// routes/contactRoutes.js
const express = require('express');
const router = express.Router();
const {
    getContacts,
    getContactById,
    getCategories,
    createContact,
    updateContact,
    deleteContact
} = require('../controller/contactController');

// Public routes
router.get('/', getContacts);
router.get('/categories', getCategories);
router.get('/:id', getContactById);

// Admin routes (add auth middleware later)
router.post('/', createContact);
router.put('/:id', updateContact);
router.delete('/:id', deleteContact);

module.exports = router;