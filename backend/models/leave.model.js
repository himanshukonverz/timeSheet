import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
      },
  
      leaveDate: {
        type: Date,
        required: true,
        index: true
      },
  
      leaveType: {
        type: String,
        enum: ["leave", "week-off", "holiday"],
        required: true
      },
  
      duration: {
        type: String,
        enum: [240, 480],
        default : [480]
      },

      
  
      status: {
        type: String,
        enum: ["approved", "pending", "rejected"],
        default: "approved"
      }
    },
    { timestamps: true }
  );

export default Leave = mongoose.model("Leave", leaveSchema)