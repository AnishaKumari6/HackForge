const mongoose = require("mongoose");

const teamMemberSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["leader", "member"], default: "member" },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const teamInviteSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["pending", "accepted", "declined", "expired"], default: "pending" },
    token: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Team name is required"], trim: true, maxlength: 60 },
    hackathon: { type: mongoose.Schema.Types.ObjectId, ref: "Hackathon", required: true, index: true },
    members: [teamMemberSchema],
    invites: [teamInviteSchema],
    description: { type: String, maxlength: 500, default: "" },

    status: {
      type: String,
      enum: ["forming", "pending_approval", "approved", "rejected"],
      default: "forming",
      index: true,
    },
    rejectionReason: { type: String, default: "" },
  },
  { timestamps: true }
);

teamSchema.index({ hackathon: 1, name: 1 }, { unique: true });

teamSchema.methods.getLeader = function getLeader() {
  return this.members.find((m) => m.role === "leader");
};

teamSchema.methods.isFull = function isFull(maxTeamSize) {
  return this.members.length >= maxTeamSize;
};

module.exports = mongoose.model("Team", teamSchema);
