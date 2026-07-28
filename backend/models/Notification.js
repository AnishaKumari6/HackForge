const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: [
        "team_invite",
        "team_approved",
        "team_rejected",
        "registration_approved",
        "registration_rejected",
        "submission_reviewed",
        "results_announced",
        "hackathon_reminder",
        "judge_assigned",
        "general",
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String, default: "" }, // frontend route to navigate to on click
    relatedHackathon: { type: mongoose.Schema.Types.ObjectId, ref: "Hackathon" },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
