import { Schema, Types } from "mongoose";

const ProgressSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    course: {
      type: Types.ObjectId,
      ref: "Course",
      required: true,
    },

    completedLessons: [
      {
        type: Types.ObjectId,
        ref: "Lesson",
      },
    ],

    lastWatchedLesson: {
      type: Types.ObjectId,
      ref: "Lesson",
    },

    percentage: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

ProgressSchema.index({ user: 1, course: 1 }, { unique: true });
