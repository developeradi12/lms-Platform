import Category from "@/models/Category"
import connectDb from "../db"
import { CategorySerialized } from "@/types/category"

export async function getAdminCategories({
  page = 1,
  limit = 10,
  search = "",
  sort = "latest",
}) {
  await connectDb()

  const skip = (page - 1) * limit

  const query: any = {}

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { slug: { $regex: search, $options: "i" } },
      { metaTitle: { $regex: search, $options: "i" } },
    ]
  }

  let sortQuery: any = { createdAt: -1 }

  if (sort === "oldest") sortQuery = { createdAt: 1 }
  if (sort === "name_asc") sortQuery = { name: 1 }
  if (sort === "name_desc") sortQuery = { name: -1 }

  const [categories, total] = await Promise.all([
    Category.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean<CategorySerialized[]>(),

    Category.countDocuments(query),
  ])

  return {
    categories, 
    total,
    totalPages: Math.ceil(total / limit),
  }
}