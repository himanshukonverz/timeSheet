import mongoose from "mongoose";

const contributorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    role: {
      type: String,
      required: true,
      enum: ["owner", "manager", "developer", "tester", "viewer"]
    }
  },
  { _id: false } // no separate _id for each contributor
);

const projectSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      required: true,
      trim: true,
      unique : true
    },

    contributors: {
      type: [contributorSchema],
      default: []
    },
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Project", projectSchema);