import mongoose, { Schema, models } from "mongoose"

const ChapterSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "", trim: true },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],


    order: { type: Number, default: 0 }, // sorting ke liye
  },
  { timestamps: true }
)


export default models.Chapter || mongoose.model("Chapter", ChapterSchema)
