const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    hackathon: { type: mongoose.Schema.Types.ObjectId, ref: "Hackathon", required: true, index: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true, index: true },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    projectName: { type: String, required: [true, "Project name is required"], trim: true, maxlength: 100 },
    problemStatement: { type: String, required: true },
    solution: { type: String, required: true },
    description: { type: String, required: true },

    githubLink: {
      type: String,
      match: [/^https?:\/\/(www\.)?github\.com\/.+/, "Must be a valid GitHub URL"],
    },
    demoLink: { type: String, default: "" },

    techStack: [{ type: String, trim: true }],

    images: [
      {
        url: String,
        publicId: String,
      },
    ],
    presentationPdf: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    demoVideo: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },

    status: {
      type: String,
      enum: ["draft", "submitted", "under_review", "reviewed"],
      default: "draft",
      index: true,
    },

    submittedAt: { type: Date },
    isPubliclyVisible: { type: Boolean, default: true }, // controls Public Project Gallery listing

    averageScore: { type: Number, default: 0 },
    rank: { type: Number, default: null },
  },
  { timestamps: true }
);

submissionSchema.index({ hackathon: 1, team: 1 }, { unique: true });
submissionSchema.index({ projectName: "text", description: "text", techStack: "text" });

module.exports = mongoose.model("Submission", submissionSchema);
