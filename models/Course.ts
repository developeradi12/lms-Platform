import { generateUniqueSlug } from "@/lib/generateUniqueSlug";
import mongoose, { Schema, Types, models } from "mongoose"
import slugify from "slugify";


const CourseSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    thumbnail: {
      type: String,
      default: ""
    },
    instructor: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    category: {
      type: Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    chapters: [
      {
        type: Types.ObjectId,
        ref: "Chapter"
      }
    ],
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    duration: {
      type: Number, // minutes
      default: 0,
    },
    level: {
      type: String,
      enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
      default: "BEGINNER",
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },
    totalEnrollments: {
      type: Number,
      default: 0,
    },

    metaTitle: {
      type: String,
      trim: true,
    },

    metaDescription: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
)
CourseSchema.pre("save", async function (next) {
  // generate only if not provided
  if (!this.slug) {
    this.slug = await generateUniqueSlug(this.title, mongoose.models.Course);
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
