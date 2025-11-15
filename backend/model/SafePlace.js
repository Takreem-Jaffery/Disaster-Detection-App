const mongoose = require('mongoose');

const SafePlaceSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    address: { type: String, default: '' },

  // GeoJSON point for location (longitude, latitude)
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { 
            type: [Number], // [lng, lat]
            required: true,
        }
    },

    contact: { type: String, default: '' },
    capacity: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
    }, 
    {
        timestamps: true
    }
);

SafePlaceSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('SafePlace', SafePlaceSchema);