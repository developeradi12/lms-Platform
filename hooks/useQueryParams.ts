"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

type QueryValue = string | number | boolean | null | undefined

export function useQueryParams() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const setParams = (
    updates: Record<string, QueryValue>,
    options?: { replace?: boolean }
  ) => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        params.delete(key)
      } else {
        params.set(key, String(value))
      }
    })

    const nextUrl = `${pathname}?${params.toString()}`

    // prevent pushing same url again
    const currentUrl = `${pathname}?${searchParams.toString()}`
    if (nextUrl === currentUrl) return

    if (options?.replace) router.replace(nextUrl)
    else router.push(nextUrl)
  }

  return { setParams }
}