import mongoose, { Schema, Types } from "mongoose";

const Order = new Schema(
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
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    paymentId: {
      type: String,
      unique: true, //  prevents duplicate payments
    },
    orderId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

//   model export (Next.js safe)
export default mongoose.models.Order || mongoose.model("Order", Order);