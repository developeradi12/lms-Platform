export function createUserSlug(name: string, id: string) {
  return `${name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")}-${id}`
}