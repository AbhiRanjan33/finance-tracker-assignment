"use client"

import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { z } from "zod"
import { toast } from "sonner"

import { CategoryForm } from "@/components/category-form"

const categorySchema = z
  .object({
    _id: z.string().optional(), // MongoDB _id field
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    icon: z.string().min(1, "Icon is required"),
    customIcon: z.string().optional(),
    color: z.string().min(1, "Color is required"),
    updatedAt: z
      .string()
      .or(z.date())
      .optional()
      .transform((val) => (val ? new Date(val) : undefined)), // Optional updatedAt
  })
  .passthrough() // Allow unknown fields

export default function EditCategory() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [initialValues, setInitialValues] = useState<z.infer<typeof categorySchema> | null>(null)

  useEffect(() => {
    if (id) {
      async function fetchCategory() {
        try {
          const response = await fetch(`/api/categories/${id}`)
          const data = await response.json()
          if (response.ok) {
            // Log the raw API response for debugging
            console.log("API response:", JSON.stringify(data, null, 2))
            const parsedData = categorySchema.parse({
              ...data,
              customIcon: data.icon === "other" ? data.icon : undefined,
              icon: data.icon !== "other" ? data.icon : "other",
            })
            setInitialValues(parsedData)
          } else {
            toast.error(data.error || "Failed to load category")
            router.push("/categories")
          }
        } catch (error) {
          console.error("Error parsing category:", error)
          if (error instanceof z.ZodError) {
            console.error("Zod validation errors:", error.errors)
            toast.error("Invalid category data: " + error.errors.map((e) => e.message).join(", "))
          } else {
            toast.error("Failed to load category")
          }
          router.push("/categories")
        }
      }
      fetchCategory()
    }
  }, [id, router])

  const handleSubmit = async (values: z.infer<typeof categorySchema>) => {
    if (!id) return
    try {
      const finalIcon = values.icon === "other" ? values.customIcon : values.icon
      const response = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          description: values.description || "",
          icon: finalIcon || "",
          color: values.color,
        }),
      })

      const result = await response.json()
      if (response.ok) {
        toast.success("Category updated", {
          description: `Updated category ${values.name}`,
        })
        router.push("/categories")
      } else {
        toast.error(result.error || "Failed to update category")
      }
    } catch (error) {
      console.error("Error updating category:", error)
      toast.error("Failed to update category")
    }
  }

  if (!initialValues) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Category</h1>
      <CategoryForm onSubmit={handleSubmit} initialValues={initialValues} />
    </div>
  )
}