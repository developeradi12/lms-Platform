import mongoose, { Schema, models } from "mongoose"

const LessonSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "", trim: true },
    chapter: {
      type: Schema.Types.ObjectId,
      ref: "Chapter",
      required: true,
    },

    videoUrl: { type: String, default: "" },
    duration: { type: Number, default: 0 },
    isFreePreview: { type: Boolean, default: false },

    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export default models.Lesson || mongoose.model("Lesson", LessonSchema)