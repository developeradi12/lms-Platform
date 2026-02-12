import mongoose from "mongoose";
import slugify from "slugify";

export async function generateUniqueSlug(name: string,
  model: mongoose.Model<any>,
  field: string = "slug"
): Promise<string> {

  const baseSlug = slugify(name, { lower: true, strict: true, trim: true });
  let slug = baseSlug;
  let counter = 1;

  while (await model.exists({ [field]: slug })) {
    slug = `${baseSlug}-${counter++}`;
  }

  return slug;
}