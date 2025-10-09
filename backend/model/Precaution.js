const mongoose = require("mongoose");

const precautionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    disasterType: {
      type: String,
      enum: ["flood", "rainfall", "earthquake", "heatwave"],
      required: true,
    },
    severity: {
      type: String,
      enum: ["high", "medium", "low"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    precautions: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Precaution", precautionSchema);
