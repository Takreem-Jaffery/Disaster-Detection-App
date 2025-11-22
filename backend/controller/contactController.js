// controllers/contactController.js
const Contact = require('../model/Contact');

// Get all contacts with optional filtering
const getContacts = async (req, res) => {
    try {
        const { category, search, priority } = req.query;
        
        let query = {};
        
        // Filter by category
        if (category && category !== 'all') {
            query.category = category;
        }
        
        // Filter by priority
        if (priority) {
            query.priority = priority;
        }
        
        // Search by title or description
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        const contacts = await Contact.find(query)
            .sort({ priority: -1, title: 1 });
        
        res.status(200).json({
            success: true,
            count: contacts.length,
            data: contacts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching contacts',
            error: error.message
        });
    }
};

// Get single contact by ID
const getContactById = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: contact
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching contact',
            error: error.message
        });
    }
};

// Get all categories
const getCategories = async (req, res) => {
    try {
        const categories = [
            { id: 'all', label: 'All', icon: 'apps' },
            { id: 'emergency', label: 'Emergency', icon: 'warning' },
            { id: 'government', label: 'Government', icon: 'business' },
            { id: 'weather', label: 'Weather', icon: 'cloud' },
            { id: 'support', label: 'Support', icon: 'heart' }
        ];
        
        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching categories',
            error: error.message
        });
    }
};

// Admin: Create new contact
const createContact = async (req, res) => {
    try {
        const contact = await Contact.create(req.body);
        
        res.status(201).json({
            success: true,
            data: contact
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error creating contact',
            error: error.message
        });
    }
};

// Admin: Update contact
const updateContact = async (req, res) => {
    try {
        const contact = await Contact.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: contact
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating contact',
            error: error.message
        });
    }
};

// Admin: Delete contact
const deleteContact = async (req, res) => {
    try {
        const contact = await Contact.findByIdAndDelete(req.params.id);
        
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Contact deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting contact',
            error: error.message
        });
    }
};

module.exports = {
    getContacts,
    getContactById,
    getCategories,
    createContact,
    updateContact,
    deleteContact
};