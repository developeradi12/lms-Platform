export function getPaginationPages(
  currentPage: number,
  totalPages: number,
  maxButtons = 5
) {
  let start = Math.max(1, currentPage - Math.floor(maxButtons / 2))
  let end = start + maxButtons - 1

  if (end > totalPages) {
    end = totalPages
    start = Math.max(1, end - maxButtons + 1)
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}