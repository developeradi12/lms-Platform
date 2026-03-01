import { AdminCategory, CategorySlug, CreateCategoryDTO } from "@/types"
import api from "../api"

export const categoryService = {
  getAll:async():Promise<AdminCategory[]>=>{
    const res  = await api.get<{data:AdminCategory[]}>("/api/admin/categories")
     return res.data.data || []
  },
  deleteBySlug: async (slug: CategorySlug["slug"]) => {
    await api.delete(`/api/admin/categories/${slug}`)
  },
 
  createCategory: async (formData: FormData): Promise<CreateCategoryDTO> => {
    const res = await api.post<{ Categories: CreateCategoryDTO}>("/api/admin/categories",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return  res.data.Categories;
  }
}

//sending entire schema only send required data is overcame
/*❌ Sending unnecessary data
❌ Bigger payload
❌ Security risk (internal fields exposed)
❌ Bad API design*/
/* {{{{      This Is Called: DTO Pattern (Data Transfer Object)          }}}}*/