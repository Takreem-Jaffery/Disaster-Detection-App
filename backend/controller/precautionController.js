const Precaution = require("../model/Precaution");

// add a precaution
exports.addPrecaution = async (req, res) => {
  try {
    const { disasterType, severity, title, precautions, isActive } = req.body;

    const precaution = new Precaution({
      userId: req.user.id,
      disasterType,
      severity,
      title,
      precautions,
      isActive,
    });

    await precaution.save();
    res.status(201).json({ message: "Precaution added successfully", precaution });
  } catch (error) {
    res.status(500).json({ message: "Error adding precaution", error: error.message });
  }
};

// view precautions 
exports.getPrecautions = async (req, res) => {
  try {
    const { disasterType, severity, isActive } = req.query;

    let filters = {};
    if (disasterType) filters.disasterType = disasterType;
    if (severity) filters.severity = severity;
    if (isActive) filters.isActive = isActive;

    const precautions = await Precaution.find(filters).populate("userId", "name email");

    res.status(200).json(precautions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching precautions", error: error.message });
  }
}; // <-- THIS was missing!!


// update a precaution
exports.updatePrecaution = async (req, res) => {
  try {
    const { id } = req.params;
    const { disasterType, severity, title, precautions, isActive } = req.body;

    const precaution = await Precaution.findById(id);

    if (!precaution) {
      return res.status(404).json({ message: "Precaution not found" });
    }

    if (disasterType) precaution.disasterType = disasterType;
    if (severity) precaution.severity = severity;
    if (title) precaution.title = title;
    if (precautions) precaution.precautions = precautions;
    if (isActive !== undefined) precaution.isActive = isActive;

    await precaution.save();

    res.status(200).json({
      message: "Precaution updated successfully",
      precaution,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating precaution",
      error: error.message,
    });
  }
};

// delete a precaution
exports.deletePrecaution = async (req, res) => {
  try {
    const { id } = req.params;

    const precaution = await Precaution.findById(id);

    if (!precaution) {
      return res.status(404).json({ message: "Precaution not found" });
    }

    await Precaution.findByIdAndDelete(id);

    res.status(200).json({
      message: "Precaution deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting precaution",
      error: error.message,
    });
  }
};
