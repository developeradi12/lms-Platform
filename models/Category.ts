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


// ✅ generate unique slug
async function generateUniqueSlug(name: string) {
  const baseSlug = slugify(name, { lower: true, strict: true });
  let slug = baseSlug;

  let exists = await mongoose.models.Category.findOne({ slug });

  while (exists) {
    slug = `${baseSlug}-${Math.floor(Math.random() * 10000)}`;
    exists = await mongoose.models.Category.findOne({ slug });
  }

  return slug;
}

// ✅ CREATE + SAVE
CategorySchema.pre("save", async function (next) {
  // slug generate only if name changed AND slug manually not changed
  if (this.isModified("name") && !this.isModified("slug")) {
    this.slug = await generateUniqueSlug(this.name);
  }

  // sanitize manual slug if user set it
  if (this.isModified("slug") && this.slug) {
    this.slug = slugify(this.slug, { lower: true, strict: true });
  }

  // SEO defaults
  if (!this.metaTitle) this.metaTitle = this.name;
  if (!this.metaDescription) this.metaDescription = this.description;

  next();
});

// ✅ UPDATE (findOneAndUpdate / findByIdAndUpdate)
async function handleSlugInUpdate(this: any, next: any) {
  const update: any = this.getUpdate() || {};

  const name = update?.name || update?.$set?.name;
  const incomingSlug = update?.slug || update?.$set?.slug;

  // ✅ if user manually updates slug → keep it (sanitize)
  if (incomingSlug) {
    const cleanSlug = slugify(incomingSlug, { lower: true, strict: true });

    if (update.$set) update.$set.slug = cleanSlug;
    else update.slug = cleanSlug;

    this.setUpdate(update);
    return next();
  }

  // ✅ if slug not given but name updated → regenerate slug
  if (name) {
    const newSlug = await generateUniqueSlug(name);

    if (update.$set) {
      update.$set.slug = newSlug;
      update.$set.metaTitle ??= name;
      update.$set.metaDescription ??= update.$set.description ?? "";
    } else {
      update.slug = newSlug;
      update.metaTitle ??= name;
      update.metaDescription ??= update.description ?? "";
    }
  }

  this.setUpdate(update);
  next();
}

CategorySchema.pre("findOneAndUpdate", handleSlugInUpdate);

const Category = models.Category || model<ICategory>("Category", CategorySchema);
export default Category;

// CategorySchema.pre("findOneAndUpdate", async function (next) {
//   const update: any = this.getUpdate()

//   /* note := { getUpdate() Mongoose ka built-in method hai Schema middleware (pre hook) 
//   ke andar this par available hota hai jab hook query middleware ho 
//   (jaise findOneAndUpdate, updateOne, etc.)} */

//   const name = update?.name || update?.$set?.name;
//   const incomingSlug = update?.slug || update?.$set?.slug

//   //  If user manually updates slug → keep it (but sanitize it)
//   if (incomingSlug) {
//     const cleanSlug = slugify(incomingSlug, { lower: true, strict: true });

//     if (update.$set) {
//       update.$set.slug = cleanSlug;
//     } else {
//       update.slug = cleanSlug;
//     }

//     this.setUpdate(update);
//     return next();
//   }

//   //  If user didn't send slug, but updated name → regenerate slug
//   if (name) {
//     const slug = await generateUniqueSlug(name);

//     if (update.$set) {
//       update.$set.slug = slug;
//       update.$set.metaTitle ??= name;
//     } else {
//       update.slug = slug;
//       update.metaTitle ??= name;
//     }
//   }

//   this.setUpdate(update);

//   next();
// });

// const Category =
//   models.Category || model<ICategory>("Category", CategorySchema);
// export default Category;