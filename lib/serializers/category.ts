import type { Category } from "@/schemas/categorySchema"

export function serializeCategory(doc: any): Category {
  return {
    _id: String(doc._id),
    name: doc.name,
    slug: doc.slug,
    description: doc.description || "",
    image: doc.image || "",
    metaTitle: doc.metaTitle || "",
    metaDescription: doc.metaDescription || "",
    createdAt: doc.createdAt?.toISOString?.() || String(doc.createdAt),
    updatedAt: doc.updatedAt?.toISOString?.() || String(doc.updatedAt),
  }
}