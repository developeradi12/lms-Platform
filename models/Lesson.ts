import { generateUniqueSlug } from "@/lib/generateUniqueSlug";
import mongoose, { Schema, models } from "mongoose"
import slugify from "slugify";

const LessonSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "", trim: true },
    metaTitle: {
      type: String,
      trim: true,
    },

    metaDescription: {
      type: String,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
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
LessonSchema.pre("save", async function (next) {
  if (!this.slug) {
    this.slug = await generateUniqueSlug(this.title, mongoose.models.Lesson);
  }
  if (!this.metaTitle) this.metaTitle = this.title;
  if (!this.metaDescription) this.metaDescription = this.description;

  next();
})

export default models.Lesson || mongoose.model("Lesson", LessonSchema)