import { generateUniqueSlug } from "@/lib/generateUniqueSlug";
import mongoose, { Schema, model, models } from "mongoose"
import slugify from "slugify"

interface ICategory {
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  metaTitle?: string;
  metaDescription?: string;
}
const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true, // 🔥 faster search
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, //for query to find
      // default: function () {
      //   return slugify(this.name, { lower: true, strict: true });
      // },

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



// ✅ CREATE + SAVE
CategorySchema.pre("save", async function (next) {
  // generate only if not provided
  if (!this.slug) {
    this.slug = await generateUniqueSlug(this.name, models.Category || model("Category", CategorySchema));
  }

  // sanitize manual slug
  if (this.slug) {
    this.slug = slugify(this.slug, { lower: true, strict: true });
  }

  // SEO defaults
  if (!this.metaTitle) this.metaTitle = this.name;
  if (!this.metaDescription) this.metaDescription = this.description;

  next();
});

// ✅ UPDATE (findOneAndUpdate / findByIdAndUpdate)
CategorySchema.pre("findOneAndUpdate", async function (next) {
  const update: any = this.getUpdate() || {};

   const incomingSlug = update?.slug || update?.$set?.slug;


  // ✅ if user manually updates slug → keep it (sanitize)
  if (incomingSlug) {
    const cleanSlug = slugify(incomingSlug, { lower: true, strict: true });

    if (update.$set) update.$set.slug = cleanSlug;
    else update.slug = cleanSlug;

    this.setUpdate(update);
  
  }
  next();
});

 const Category =
  models.Category || model<ICategory>("Category", CategorySchema);

export default Category;