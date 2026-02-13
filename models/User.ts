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
      required: true, // ✅ signup + login ke liye required
      select: false,  // ✅ security (find me password by default nahi aayega)
    },

    role: {
      type: String,
      enum: ["SUPER_ADMIN", "ADMIN", "INSTRUCTOR", "STUDENT"],
      default: "STUDENT",
    },

    // ✅ refresh token store (for refresh token flow)
    refreshToken: {
      type: String,
      default: "",
    },

    enrolledCourses: [
      {
        type: Types.ObjectId,
        ref: "enrollment"
      }
    ],


    wishlist:
      [
        {
          type: Types.ObjectId,
          ref: "wishlist"
        }
      ],

    review: [
      {
        type: Types.ObjectId,
        ref: "review"
      }
    ],

    order: [
      {
        type: Types.ObjectId,
        ref: "Order"
      }
    ],
  },
  { timestamps: true }
)

// ✅ Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

export default models.User || mongoose.model("User", UserSchema)
