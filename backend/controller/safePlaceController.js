const SafePlace = require('../model/SafePlace');


exports.createSafePlace = async (req, res) => {
  try {
    const { name, description, address, contact, capacity, lat, lng } = req.body;
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ message: 'lat and lng required as numbers' });
    }

    const safe = new SafePlace({
      name,
      description,
      address,
      contact,
      capacity,
      location: { type: 'Point', coordinates: [lng, lat] },
      createdBy: req.user ? req.user._id : null
    });

    await safe.save();
    return res.status(201).json(safe);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};


exports.getSafePlace = async (req, res) => {
  try {
    const safe = await SafePlace.findById(req.params.id);
    if (!safe) return res.status(404).json({ message: 'Safe place not found' });
    return res.json(safe);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update safe place
 */
exports.updateSafePlace = async (req, res) => {
  try {
    const update = { ...req.body };

    if (update.lat !== undefined && update.lng !== undefined) {
      update.location = { type: 'Point', coordinates: [update.lng, update.lat] };
      delete update.lat;
      delete update.lng;
    }

    const safe = await SafePlace.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!safe) return res.status(404).json({ message: 'Safe place not found' });
    return res.json(safe);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete safe place
 */
exports.deleteSafePlace = async (req, res) => {
  try {
    const safe = await SafePlace.findByIdAndDelete(req.params.id);
    if (!safe) return res.status(404).json({ message: 'Safe place not found' });
    return res.json({ message: 'Safe place deleted', id: req.params.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * List safe places (with optional geo radius search)
 * Query params:
 *  - lat, lng, radius (in meters) -> returns places within radius
 *  - page, limit -> pagination
 */
exports.listSafePlaces = async (req, res) => {
  try {
    const { lat, lng, radius = 5000, page = 1, limit = 20 } = req.query;
    const skip = (Math.max(1, page) - 1) * limit;

    if (lat && lng) {
      const places = await SafePlace.find({
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
            $maxDistance: parseInt(radius, 10)
          }
        }
      })
      .skip(skip).limit(parseInt(limit, 10));

      return res.json(places);
    } else {
      const places = await SafePlace.find().skip(skip).limit(parseInt(limit, 10));
      return res.json(places);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
