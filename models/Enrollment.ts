import mongoose, { Schema, Types } from "mongoose";

const EnrollmentSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,//fast search
    },

    course: {
      type: Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    enrolledAt: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "COMPLETED", "REFUNDED"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

// 🚨 Prevent duplicate purchase
EnrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

export default mongoose.models.Enrollment ||
  mongoose.model("Enrollment", EnrollmentSchema);
