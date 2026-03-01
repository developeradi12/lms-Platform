export interface BaseCategory {
  _id: string
  name: string
  slug: string
  description?: string
  image?: string

  metaTitle?: string
  metaDescription?: string

  createdAt: Date
  updatedAt: Date
}
export interface CreateCategoryForm {
  name: string
  description: string
  metaTitle?: string
  metaDescription?: string
  image: File
}

export interface UpdateCategoryForm {
  name?: string
  description?: string
  imageUrl?: string   // existing image
  imageFile?: File    // new upload
  metaTitle?: string
  metaDescription?: string
}

export type LeanCategory = BaseCategory

export interface PublicCategory {
  _id: string
  name: string
  slug: string
  description?: string
  image?: string
  createdAt: string
  updatedAt: string
}

export type AdminCategory = LeanCategory

export type CategoryPreview = Pick<LeanCategory,
  "_id" | "name" | "slug"
>

export type CategoryCard = Pick<LeanCategory,
  "_id" | "name" | "slug" | "image"
>
export type CategorySlug = Pick<LeanCategory, "slug">
export type CategorySEO = Pick<LeanCategory,
  "metaTitle" | "metaDescription"
>

export type CreateCategoryDTO = Omit<BaseCategory,
  "_id" | "createdAt" | "updatedAt" | "slug"
>

export type UpdateCategoryDTO = Partial<CreateCategoryDTO>