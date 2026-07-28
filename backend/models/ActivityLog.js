const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true }, // e.g. "USER_BLOCKED", "HACKATHON_DELETED"
    targetType: { type: String, enum: ["User", "Hackathon", "Team", "Submission", "Registration", "Other"], default: "Other" },
    targetId: { type: mongoose.Schema.Types.ObjectId },
    description: { type: String, default: "" },
    ipAddress: { type: String, default: "" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ actor: 1 });

module.exports = mongoose.model("ActivityLog", activityLogSchema);
