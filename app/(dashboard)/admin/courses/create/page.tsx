import { categoryService } from "../../../../../lib/service/category"
import CreateCourseForm from "./CreateCourseForm"

export default async function Page() {
  const categories = await categoryService.getAll();

  return <CreateCourseForm categories={categories} />
}

