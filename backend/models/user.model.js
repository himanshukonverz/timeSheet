import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true
    },

    password: {
      type: String,
      required: true,
      select: false // prevents password from being returned in queries
    },

    role: {
      type: String,
      enum: ["employee", "admin", "manager"],
      default: "employee"
    },

    reportsTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    joiningDate: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true // createdAt, updatedAt
  }
);

export default mongoose.model("User", userSchema);