import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true
    },

    projectCategory: {
      type: String,
      enum: ["implementation", "integration", "AMS"],
      required: true
    },

    projectStage: {
      type: String,
      enum: [
        "BPU",
        "Staging Config",
        "CRP",
        "TTT",
        "Prod Config",
        "Prod Review",
        "Go Live",
        "Hypercare",
        "Others"
      ],
      required: true
    },

    taskDescription: {
      type: String,
      required: true,
      trim: true
    },

    plannedDuration: {
      type: Number, // Minutes
      required: true,
      min: 0
    },

    actualDuration: {
      type: Number, // Minutes
      default: 0,
      min: 0
    },

    status: {
      type: String,
      enum: ["in_progress", "completed", "cancelled"],
      required : true
    },

    isDeleted: {
        type: Boolean,
        default: false,
    },
      
    deletedAt: {
        type: Date,
        default: null
    },
    
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    }
  },
  {
    timestamps: true // creates createdAt & updatedAt
  }
);

export default mongoose.model("Task", taskSchema);