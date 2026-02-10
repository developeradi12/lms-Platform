import mongoose, { Schema, models } from "mongoose"
import slugify from "slugify"

const CategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    metaTitle: {
      type: String,
      required: true,
      trim: true,
    },

    metaDescription: {
      type: String,
      trim: true,
      // default: function () {
      //   return this.description
      // }
    },
  },
  { timestamps: true }
)


CategorySchema.pre("save", function (next) {
  // slug default
  if (!this.slug || this.slug.trim() === "") {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
  }

  if (!this.metaTitle || this.metaTitle.trim() === "") {
    this.metaTitle = this.name
  }

  if (!this.metaDescription || this.metaDescription.trim() === "") {
    this.metaDescription = this.description
  }

  next()
})

CategorySchema.pre("findOneAndUpdate", function (next) {
  const update: any = this.getUpdate()
  const $set = update.$set || update

  // slug auto update if name changed and slug not given
  if ((!$set.slug || $set.slug.trim?.() === "") && $set.name) {
    $set.slug = $set.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
  }

  // metaTitle default
  if ((!$set.metaTitle || $set.metaTitle.trim?.() === "") && $set.name) {
    $set.metaTitle = $set.name
  }

  // metaDescription default
  if (
    (!$set.metaDescription || $set.metaDescription.trim?.() === "") &&
    $set.description
  ) {
    $set.metaDescription = $set.description
  }

  update.$set = $set
  this.setUpdate(update)

  next()
})

export default models.Category || mongoose.model("Category", CategorySchema)
