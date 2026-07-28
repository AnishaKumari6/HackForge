const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    hackathon: { type: mongoose.Schema.Types.ObjectId, ref: "Hackathon", required: true, index: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    participant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
      index: true,
    },

    qrCode: { type: String, default: "" }, // data URL for QR-based check-in
    checkedIn: { type: Boolean, default: false },
    checkedInAt: { type: Date },

    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    reviewNote: { type: String, default: "" },
  },
  { timestamps: true }
);

registrationSchema.index({ hackathon: 1, participant: 1 }, { unique: true });

module.exports = mongoose.model("Registration", registrationSchema);
