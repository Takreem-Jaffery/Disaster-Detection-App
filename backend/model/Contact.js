// models/Contact.js
const mongoose = require('mongoose');

const numberSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['call', 'sms'],
        required: true
    },
    value: {
        type: String,
        required: true
    }
});

const contactSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['emergency', 'government', 'weather', 'support'],
        required: true,
        index: true
    },
    icon: {
        type: String,
        default: 'call'
    },
    numbers: [numberSchema],
    priority: {
        type: String,
        enum: ['high', 'normal'],
        default: 'normal'
    },
    description: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Index for search functionality
contactSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Contact', contactSchema);