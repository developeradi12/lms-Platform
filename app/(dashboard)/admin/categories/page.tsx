import AdminCategoriesClient from "./AdminCategoriesClient"
export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; sort?: string }>
}) {
  const params = await searchParams

  const page = Number(params.page || "1")
  const search = params.search || ""
  const sort = params.sort || "latest"

  return <AdminCategoriesClient page={page} search={search} sort={sort} />
}