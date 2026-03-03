import mongoose, { Schema, Types } from "mongoose";
import { boolean } from "zod";

const ProgressSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    course: {
      type: Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    completedLessons: [
      {
        type: Types.ObjectId,
        ref: "Lesson",
      },
    ],

    lastAccessedLesson: {
      type: Types.ObjectId,
      ref: "Lesson",
    },
     isCompeted:{
      type:boolean
     },
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// 🔥 Prevent duplicate progress per course per user
ProgressSchema.index({ user: 1, course: 1 }, { unique: true });

export default mongoose.models.Progress ||
  mongoose.model("Progress", ProgressSchema);