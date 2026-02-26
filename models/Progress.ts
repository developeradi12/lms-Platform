import mongoose, { Schema, Types, model } from "mongoose";

const ProgressSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    lesson: {
      type: Types.ObjectId,
      ref: "Lesson",
      required: true,
    },

    course: {
      type: Types.ObjectId,
      ref: "Course",
      required: true,
       index: true,
    },

    watchedSeconds: {
      type: Number,
      default: 0,
    },

    isCompleted: {
      type: Boolean,
      default: false,
    },

    completedAt: Date,
  },
  { timestamps: true }
);

ProgressSchema.index(
  { user: 1, lesson: 1 },
  { unique: true }
);
export default mongoose.models.Progress ||
  mongoose.model("Progress", ProgressSchema)