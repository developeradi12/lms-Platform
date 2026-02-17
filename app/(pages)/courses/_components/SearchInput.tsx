"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function SearchInput() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [value, setValue] = useState(searchParams.get("search") || "")

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())

      if (value) {
        params.set("search", value)
      } else {
        params.delete("search")
      }

      // 🔥 THIS IS WHERE PAGE RESET HAPPENS
      params.set("page", "1")

      router.push(`/courses?${params.toString()}`)
    }, 500) // debounce 500ms

    return () => clearTimeout(timeout)
  }, [value])

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Search courses..."
      className="border px-4 py-2 rounded-lg w-full"
    />
  )
}
