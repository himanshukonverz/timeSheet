import mongoose from "mongoose";

const contributorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    projectRole: {
      type: String,
      required: true,
      enum: ["Engagement Manager", "Solution Architect", "Implementation Lead", "Module Lead", "Integration Lead", "Support Role", "Project Director", "Project Manager", "Others"]
    },

    projectModules : {
      type : String,
      required : true
    },

    hasEditAccess : {
      type : Boolean,
      default : false
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

    status : {
      type : String,
      enum : ["in-progress", "upcoming", "completed"],
      default : "upcoming"
    },

    startDate : {
      type: Date,
      default : null
    },

    goLiveDate : {
      type: Date,
      default : null
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Project", projectSchema);