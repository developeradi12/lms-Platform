import mongoose, { Schema } from "mongoose";

const SubmissionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },

    lesson: { type: Schema.Types.ObjectId, ref: "Lesson" },

    //  ADD THIS
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    fileUrl: {
      type: String,
      required: false,
      default: ""
    },

    description: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["PENDING", "REVIEWED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Submission ||
  mongoose.model("Submission", SubmissionSchema);