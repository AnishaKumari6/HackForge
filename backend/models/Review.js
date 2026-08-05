const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    hackathon: { type: mongoose.Schema.Types.ObjectId, ref: "Hackathon", required: true, index: true },
    submission: { type: mongoose.Schema.Types.ObjectId, ref: "Submission", required: true, index: true },
    judge: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    scores: {
      innovation: { type: Number, required: true, min: 0, max: 10 },
      technicalComplexity: { type: Number, required: true, min: 0, max: 10 },
      ui: { type: Number, required: true, min: 0, max: 10 },
      ux: { type: Number, required: true, min: 0, max: 10 },
      scalability: { type: Number, required: true, min: 0, max: 10 },
      documentation: { type: Number, required: true, min: 0, max: 10 },
      presentation: { type: Number, required: true, min: 0, max: 10 },
    },

    totalScore: { type: Number, default: 0 }, // auto-calculated average across criteria
    comments: { type: String, maxlength: 1000, default: "" },

    status: { type: String, enum: ["draft", "submitted"], default: "submitted" },
  },
  { timestamps: true }
);

reviewSchema.index({ submission: 1, judge: 1 }, { unique: true });

// Auto-calculate total score as the mean of all scoring criteria whenever scores change
reviewSchema.pre("save", function calculateTotal(next) {
  if (this.isModified("scores")) {
    const values = Object.values(this.scores.toObject ? this.scores.toObject() : this.scores);
    const sum = values.reduce((acc, v) => acc + (Number(v) || 0), 0);
    this.totalScore = Number((sum / values?.length).toFixed(2));
  }
  next();
});

module.exports = mongoose.model("Review", reviewSchema);
