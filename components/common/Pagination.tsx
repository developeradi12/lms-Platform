"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { getPaginationPages } from "@/lib/pagination"

type Props = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}
export default function Pagination({ page, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null

  const pages = getPaginationPages(page, totalPages, 5)

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4">
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </p>

      <div className="flex gap-2 flex-wrap">
        <Button
          variant="outline"
          className="rounded-xl"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Prev
        </Button>

        {pages.map((p) => (
          <Button
            key={p}
            variant={p === page ? "default" : "outline"}
            className="rounded-xl"
            onClick={() => onPageChange(p)}
          >
            {p}
          </Button>
        ))}

        <Button
          variant="outline"
          className="rounded-xl"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}