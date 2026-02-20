import connectDb from "@/lib/db"
import Category from "@/models/Category"

export async function getAllCategories() {
  await connectDb()

  const categories = await Category.find()
    .select("name slug")
    .lean()

  return categories.map((cat: any) => ({
    _id: cat._id.toString(),
    name: cat.name,
    slug: cat.slug,
  }))
}

//sending entire schema only send required data is overcame
/*❌ Sending unnecessary data
❌ Bigger payload
❌ Security risk (internal fields exposed)
❌ Bad API design*/

/* {{{{      This Is Called: DTO Pattern (Data Transfer Object)          }}}}*/