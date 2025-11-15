const Precaution = require("../model/Precaution");

//add a precaution
exports.addPrecaution = async (req, res) => {
  try {
    const { disasterType, severity, title, precautions, isActive } = req.body;

    const precaution = new Precaution({
      userId: req.user.id, //user ID from auth middleware
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

//view precautions 
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
};