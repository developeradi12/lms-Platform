export interface SearchCategory {
  searchParams: Promise<{
    page?: string
    search?: string
    category?: string
    price?: string
  }>
}