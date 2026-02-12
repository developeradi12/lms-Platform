import { generateUniqueSlug } from "@/lib/generateUniqueSlug";
import mongoose, { Schema, models } from "mongoose"
import slugify from "slugify";


const CourseSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    metaTitle: {
      type: String,
      trim: true,
    },

    metaDescription: {
      type: String,
      trim: true,
    },
    thumbnail: { type: String, default: "" },
    price: { type: Number, default: 0 },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
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
CourseSchema.pre("save", async function (next) {
  // generate only if not provided
  if (!this.slug) {
    this.slug = await generateUniqueSlug(this.title,mongoose.models.Course);
  }

  // sanitize manual slug
  if (this.slug) {
    this.slug = slugify(this.slug, { lower: true, strict: true });
  }

  // SEO defaults
  if (!this.metaTitle) this.metaTitle = this.title;
  if (!this.metaDescription) this.metaDescription = this.description;

  next();
});

export default models.Course || mongoose.model("Course", CourseSchema)
