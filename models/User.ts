import mongoose, { models, Schema, Types } from "mongoose"
import bcrypt from "bcryptjs"

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address",
      ],
    },

    password: {
      type: String,
      required: true,
      select: true,
    },

    role: {
      type: String,
      enum: ["SUPER_ADMIN", "ADMIN", "INSTRUCTOR", "STUDENT"],
      default: "STUDENT",
    },
    enrolledCourses: [{
      type: Types.ObjectId,
      ref: "Enrollment",
    }],

    avatar: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED", "BLOCKED"],
      default: "ACTIVE",
    },

    refreshToken: {
      type: String,
      default: "",
      select: true,
    },

    wishlist: [
      {
        type: Types.ObjectId,
        ref: "Course",
      },
    ],

    orders: [
      {
        type: Types.ObjectId,
        ref: "Order",
      },
    ],

    reviews: [
      {
        type: Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  { timestamps: true }
)

// 🔐 Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

export default models.User || mongoose.model("User", UserSchema)