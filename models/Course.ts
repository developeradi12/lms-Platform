import mongoose, { Schema, models } from "mongoose"


const CourseSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    thumbnail: { type: String, default: "" },
    price: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    instructor: { type: Schema.Types.ObjectId, ref: "User" },
    chapters: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chapter" }],
    isPublished: { type: Boolean, default: false },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },

  },
  { timestamps: true }
)

export default models.Course || mongoose.model("Course", CourseSchema)
