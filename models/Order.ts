import { Schema, Types } from "mongoose";

export const OrderSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
    },

    course: {
      type: Types.ObjectId,
      ref: "Course",
    },

    amount: Number,

    currency: {
      type: String,
      default: "INR",
    },

    paymentId: String,
    orderId: String,

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);
