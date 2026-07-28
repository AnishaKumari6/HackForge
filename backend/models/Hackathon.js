const mongoose = require("mongoose");

const timelineEventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    date: { type: Date, required: true },
    description: { type: String, default: "" },
  },
  { _id: false }
);

const judgingCriterionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    weight: { type: Number, required: true, min: 1, max: 100 },
  },
  { _id: false }
);

const hackathonSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Title is required"], trim: true, maxlength: 120 },
    slug: { type: String, unique: true },
    tagline: { type: String, maxlength: 200, default: "" },
    description: { type: String, required: [true, "Description is required"] },
    banner: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },

    organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    mode: { type: String, enum: ["online", "offline", "hybrid"], default: "online" },
    location: { type: String, default: "" },

    themes: [{ type: String, trim: true }],
    category: { type: String, default: "General" },

    prizePool: { type: Number, default: 0, min: 0 },
    prizeBreakdown: [
      {
        position: { type: String },
        amount: { type: Number },
        description: { type: String },
      },
    ],

    minTeamSize: { type: Number, default: 1, min: 1 },
    maxTeamSize: { type: Number, default: 4, min: 1 },

    registrationStart: { type: Date, required: true },
    registrationEnd: { type: Date, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    timeline: [timelineEventSchema],
    rules: [{ type: String }],
    judgingCriteria: [judgingCriterionSchema],

    judges: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    maxParticipants: { type: Number, default: 0 }, // 0 = unlimited
    registeredCount: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["draft", "published", "ongoing", "completed", "cancelled"],
      default: "draft",
      index: true,
    },

    resultsPublished: { type: Boolean, default: false },

    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },

    views: { type: Number, default: 0 },
    bookmarksCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

hackathonSchema.index({ title: "text", tagline: "text", description: "text", themes: "text" });
hackathonSchema.index({ registrationEnd: 1 });
hackathonSchema.index({ startDate: 1 });

// Auto-generate a URL-safe slug from the title, disambiguated with a short random suffix
hackathonSchema.pre("validate", function generateSlug(next) {
  if (this.isModified("title") || !this.slug) {
    const base = this.title
      ? this.title
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      : "hackathon";
    this.slug = `${base}-${Math.random().toString(36).slice(2, 7)}`;
  }
  next();
});

// Derived, read-only helper — not persisted — for quick status checks in controllers
hackathonSchema.methods.isRegistrationOpen = function isRegistrationOpen() {
  const now = new Date();
  return (
    this.status === "published" &&
    now >= this.registrationStart &&
    now <= this.registrationEnd &&
    (this.maxParticipants === 0 || this.registeredCount < this.maxParticipants)
  );
};

module.exports = mongoose.model("Hackathon", hackathonSchema);
