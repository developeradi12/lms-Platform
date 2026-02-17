"use client"

import { useRouter, useSearchParams } from "next/navigation"

interface Props {
  categories: any[]
}

export default function Filters({ categories }: Props) {
  console.log("Rendering Filters with categories:", categories)
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
        onChange={(e) => updateFilter("category", e.target.value)}
        defaultValue={searchParams.get("category") || ""}
        className="border px-4 py-2 rounded-lg"
      >
        <option value="">All Categories</option>
        {categories?.map((cat) => (
          <option key={cat._id} value={cat._id}>
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
