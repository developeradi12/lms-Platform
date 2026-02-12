import { generateUniqueSlug } from "@/lib/generateUniqueSlug";
import mongoose, { Schema, models } from "mongoose"
import slugify from "slugify";

const ChapterSchema = new Schema(
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
      // default: function () {
      //   return this.description
      // }
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    order: { type: Number, default: 0 }, // sorting ke liye
  },
  { timestamps: true }
)
// ✅ CREATE + SAVE
ChapterSchema.pre("save", async function (next) {
  // generate only if not provided
  if (!this.slug) {
    this.slug = await generateUniqueSlug(this.title,mongoose.models.Chapter);
  }

  // SEO defaults
  if (!this.metaTitle) this.metaTitle = this.title;
  if (!this.metaDescription) this.metaDescription = this.description;

  next();
});

export default models.Chapter || mongoose.model("Chapter", ChapterSchema)
