import { Schema, Types } from "mongoose";

const ReviewSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
    },

    course: {
      type: Types.ObjectId,
      ref: "Course",
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
    },

    comment: String,
  },
  { timestamps: true }
);

// One review per user per course
ReviewSchema.index({ user: 1, course: 1 }, { unique: true });
