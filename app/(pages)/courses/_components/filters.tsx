"use client"

import { useRouter, useSearchParams } from "next/navigation"


interface Category {
  _id: string
  name: string
  slug: string
}
interface Props {
  categories?: Category[]
}

export default function Filters({ categories }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    // Always reset page
    params.set("page", "1")

    router.push(`/courses?${params.toString()}`)
  }

  return (
    <div className="flex gap-4 flex-wrap">

      {/* Category Filter */}
      <select
        onChange={(e) => updateFilter("categories", e.target.value)}
        defaultValue={searchParams.get("categories") || ""}
        className="border px-4 py-2 rounded-lg"
      >
        <option value="">All Categories</option>
        {categories?.map((cat) => (
          <option key={cat._id} value={cat.slug}>
            {cat.name}
          </option>
        ))}
      </select>

      {/* Price Filter */}
      <select
        onChange={(e) => updateFilter("price", e.target.value)}
        defaultValue={searchParams.get("price") || ""}
        className="border px-4 py-2 rounded-lg"
      >
        <option value="">All Prices</option>
        <option value="free">Free</option>
        <option value="paid">Paid</option>
      </select>

    </div>
  )
}
