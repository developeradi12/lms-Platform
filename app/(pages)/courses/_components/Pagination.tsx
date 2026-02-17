import Link from "next/link"

interface Props {
  page: number
  totalPages: number
  search?: string
  category?: string
  price?: string
}
export default function Pagination({
  page,
  totalPages,
  search,
  category,
  price
}: Props) {
  const createLink = (newPage: number) => {
    const params = new URLSearchParams()

    params.set("page", String(newPage))

    if (search) params.set("search", search)
    if (category && category !== "all")
      params.set("category", category)
    if (price) params.set("price", price)

    return `?${params.toString()}`
  }

  return (
    <div className="flex justify-center items-center gap-6 pt-10">

      {page > 1 && (
        <Link
          href={createLink(page - 1)}
          className="px-4 py-2 border rounded-lg"
        >
          Previous
        </Link>
      )}

      <span className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>

      {page < totalPages && (
        <Link
          href={createLink(page + 1)}
          className="px-4 py-2 border rounded-lg"
        >
          Next
        </Link>
      )}
    </div>
  )
}
