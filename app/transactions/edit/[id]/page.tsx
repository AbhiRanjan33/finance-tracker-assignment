"use client"

import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { z } from "zod"
import { toast } from "sonner"

import { TransactionForm } from "@/components/transaction-form"

const transactionSchema = z
  .object({
    _id: z.string().optional(), // MongoDB _id field
    description: z.string().min(1, "Description is required"),
    amount: z
      .number()
      .or(z.string().transform((val) => parseFloat(val)))
      .transform((val) => val.toString()), // Handle number or string, convert to string
    date: z
      .string()
      .or(z.date())
      .transform((val) => (typeof val === "string" ? new Date(val) : val)), // Handle string or Date
    category: z.string().min(1, "Category is required"),
    type: z
      .string()
      .refine((val) => ["income", "expense"].includes(val), {
        message: "Type must be 'income' or 'expense'",
      })
      .default("expense"), // Handle type, default to expense
    updatedAt: z
      .string()
      .or(z.date())
      .optional()
      .transform((val) => (val ? new Date(val) : undefined)), // Optional updatedAt
  })
  .passthrough() // Allow unknown fields to pass through

export default function EditTransaction() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [initialValues, setInitialValues] = useState<z.infer<typeof transactionSchema> | null>(null)

  useEffect(() => {
    if (id) {
      async function fetchTransaction() {
        try {
          const response = await fetch(`/api/transactions/${id}`)
          const data = await response.json()
          if (response.ok) {
            // Log the raw API response for debugging
            console.log("API response:", JSON.stringify(data, null, 2))
            const parsedData = transactionSchema.parse(data)
            setInitialValues(parsedData)
          } else {
            toast.error(data.error || "Failed to load transaction")
            router.push("/transactions")
          }
        } catch (error) {
          console.error("Error parsing transaction:", error)
          if (error instanceof z.ZodError) {
            console.error("Zod validation errors:", error.errors)
            toast.error("Invalid transaction data: " + error.errors.map((e) => e.message).join(", "))
          } else {
            toast.error("Failed to load transaction")
          }
          router.push("/transactions")
        }
      }
      fetchTransaction()
    }
  }, [id, router])

  const handleSubmit = async (values: z.infer<typeof transactionSchema>) => {
    if (!id) return
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: values.description,
          amount: values.amount,
          date: values.date.toISOString(),
          category: values.category,
          type: values.type,
        }),
      })

      const result = await response.json()
      if (response.ok) {
        toast.success("Transaction updated", {
          description: `Updated ${values.description} for $${Math.abs(Number(values.amount))}`,
        })
        router.push("/transactions")
      } else {
        toast.error(result.error || "Failed to update transaction")
      }
    } catch (error) {
      console.error("Error updating transaction:", error)
      toast.error("Failed to update transaction")
    }
  }

  if (!initialValues) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Transaction</h1>
      <TransactionForm onSubmit={handleSubmit} initialValues={initialValues} />
    </div>
  )
}