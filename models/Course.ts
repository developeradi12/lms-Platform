import mongoose, { Schema, models } from "mongoose"

const LessonSchema = new Schema(
  {
    title: { type: String, required: true },
    videoUrl: { type: String, default: "" },
    duration: { type: Number, default: 0 }, // minutes
    isFreePreview: { type: Boolean, default: false },
  },
  { _id: true }
)

const ChapterSchema = new Schema(
  {
    title: { type: String, required: true },
    lessons: { type: [LessonSchema], default: [] },
  },
  { _id: true }
)

const CourseSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    thumbnail: { type: String, default: "" },
    price: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    instructor: { type: Schema.Types.ObjectId, ref: "User" },
    isPublished: { type: Boolean, default: false },
    chapters: { type: [ChapterSchema], default: [] },

    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export default models.Course || mongoose.model("Course", CourseSchema)
