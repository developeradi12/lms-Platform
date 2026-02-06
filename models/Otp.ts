import mongoose, { models, Schema } from "mongoose"

const OtpSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                "Please enter a valid email address",
            ],
        },

        purpose: {
            type: String,
            enum: ["SIGNUP", "FORGOT_PASSWORD"],
            required: true,
        },

        otp: {
            type: String, // hashed otp
            required: true,
        },

        expiresAt: {
            type: Date,
            required: true,
        },
    },
    { timestamps: true }
)
OtpSchema.index({ email: 1, purpose: 1 })
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default models.Otp || mongoose.model("Otp", OtpSchema)

// { expiresAt: 1 }

// ➡️ index create karo expiresAt field pe
// (1 means ascending order)

// { expireAfterSeconds: 0 }

// ➡️ means exact expiresAt time ke baad delete karo
// 0 seconds ka extra delay nahi