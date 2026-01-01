import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    empId: {
        type: Number,
        unique: true,
        index: true,
        required : true
    },

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