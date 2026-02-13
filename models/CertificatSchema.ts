import { Schema, Types } from "mongoose";

const CertificateSchema = new Schema({
  user: {
    type: Types.ObjectId,
    ref: "User",
  },

  course: {
    type: Types.ObjectId,
    ref: "Course",
  },

  certificateUrl: String,

  issuedAt: {
    type: Date,
    default: Date.now,
  },
});
