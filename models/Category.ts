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

async function generateUniqueSlug(name: string) {
  let slug = slugify(name, { lower: true, strict: true });

  let exists = await mongoose.models.Category.findOne({ slug });

  // handle duplicates
  while (exists) {
    slug = `${slug}-${Math.floor(Math.random() * 10000)}`;
    exists = await mongoose.models.Category.findOne({ slug });
  }

  return slug;
}

CategorySchema.pre("save", async function (next) {
  // only regenerate if name changed
  if (this.isModified("name")) {
    this.slug = await generateUniqueSlug(this.name);
  }

  // SEO defaults
  if (!this.metaTitle) {
    this.metaTitle = this.name;
  }

  if (!this.metaDescription) {
    this.metaDescription = this.description;
  }

  next();
});


CategorySchema.pre("findOneAndUpdate", async function (next) {
  const update: any = this.getUpdate()
  const name = update?.name || update?.$set?.name;
  const incomingSlug = update?.slug || update?.$set?.slug
  if (incomingSlug) {
    return next()
  }

  // regenerate slug only if name updated
  if (name) {
    const slug = await generateUniqueSlug(name);

    if (update.$set) {
      update.$set.slug = slug;
      update.$set.metaTitle ??= name;
    } else {
      update.slug = slug;
      update.metaTitle ??= name;
    }
  }

  this.setUpdate(update);

  next();
});

const Category =
  models.Category || model<ICategory>("Category", CategorySchema);
export default Category;