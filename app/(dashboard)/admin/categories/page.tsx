import { getAdminCategories } from "@/lib/service/category"
import AdminCategoriesClient from "./AdminCategoriesClient"
import { serializeCategories } from "@/lib/serializers"

export type AdminCategoryQuery = {
  page?: string
  search?: string
  sort?: "latest" | "oldest" | "name_asc" | "name_desc"
}

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<AdminCategoryQuery>
}) {
  const page = Number((await searchParams).page ?? "1")
  const search = (await searchParams).search ?? ""
  const sort = (await searchParams).sort ?? "latest"

  const { categories, total, totalPages } =
    await getAdminCategories({
      page,
      limit: 10,
      search,
      sort,
    })
const serializedCategories = serializeCategories(categories)  
return (
    <AdminCategoriesClient
      initialCategories={serializedCategories}
      total={total}
      totalPages={totalPages}
      page={page}
      search={search}
      sort={sort}
    />
  )
}