"use client"

import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { z } from "zod"
import { toast } from "sonner"

import { BudgetForm } from "@/components/budget-form"

const budgetSchema = z
  .object({
    _id: z.string().optional(), // Handle _id as a string (from ObjectId.toString())
    category: z.string().min(1, "Category is required"),
    amount: z
      .number()
      .or(z.string().transform((val) => parseFloat(val)))
      .or(z.any().transform(() => 0))
      .transform((val) => val.toString()), // Convert number or string to string
    amountSpent: z
      .number()
      .or(z.string().transform((val) => parseFloat(val)))
      .or(z.any().transform(() => 0))
      .transform((val) => val.toString()), // Convert number or string to string
    month: z.string().min(1, "Month is required"),
    year: z
      .number()
      .or(z.string().transform((val) => parseInt(val)))
      .transform((val) => val.toString()), // Convert number or string to string
    updatedAt: z
      .string()
      .or(z.date())
      .optional()
      .transform((val) => (val ? new Date(val).toISOString() : undefined)), // Normalize to ISO string
    createdAt: z
      .string()
      .or(z.date())
      .optional()
      .transform((val) => (val ? new Date(val).toISOString() : undefined)), // Normalize to ISO string
  })
  .passthrough() // Allow unknown fields

export default function EditBudget() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [initialValues, setInitialValues] = useState<z.infer<typeof budgetSchema> | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("/api/categories")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setCategories(data.map((cat: any) => cat.name))
        setLoading(false)
      } catch (err) {
        console.error("Error fetching categories:", err)
        toast.error("Failed to fetch categories")
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    if (id) {
      async function fetchBudget() {
        try {
          const response = await fetch(`/api/budgets/${id}`)
          const data = await response.json()
          if (response.ok) {
            // Log the raw API response for debugging
            console.log("API response:", JSON.stringify(data, null, 2))
            const parsedData = budgetSchema.parse(data)
            setInitialValues(parsedData)
          } else {
            toast.error(data.error || "Failed to load budget")
            router.push("/budgets")
          }
        } catch (error) {
          console.error("Error parsing budget:", error)
          if (error instanceof z.ZodError) {
            console.error("Zod validation errors:", JSON.stringify(error.errors, null, 2))
            toast.error("Invalid budget data: " + error.errors.map((e) => e.message).join(", "))
          } else {
            toast.error("Failed to load budget")
          }
          router.push("/budgets")
        }
      }
      fetchBudget()
    }
  }, [id, router])

  const handleSubmit = async (values: z.infer<typeof budgetSchema>) => {
    if (!id) return
    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: values.category,
          amount: values.amount,
          amountSpent: values.amountSpent,
          month: values.month,
          year: values.year,
        }),
      })

      const result = await response.json()
      if (response.ok) {
        toast.success("Budget updated", {
          description: `Updated budget for ${values.category} in ${values.month} ${values.year}`,
        })
        router.push("/budgets")
      } else {
        toast.error(result.error || "Failed to update budget")
      }
    } catch (error) {
      console.error("Error updating budget:", error)
      toast.error("Failed to update budget")
    }
  }

  if (!initialValues || categories.length === 0 || loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Budget</h1>
      <BudgetForm onSubmit={handleSubmit} initialValues={initialValues} categories={categories} />
    </div>
  )
}