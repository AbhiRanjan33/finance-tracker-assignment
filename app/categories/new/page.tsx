import { CategoryForm } from "@/components/category-form"

export default function CategoriesNewPage() {
  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Add Category</h2>
        </div>
        <div className="grid gap-4">
          <CategoryForm />
        </div>
      </div>
    </div>
  )
}