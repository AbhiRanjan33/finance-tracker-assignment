"use client"

import { useEffect, useState } from "react"
import { Pencil, Trash2 } from 'lucide-react'
import Link from "next/link"
import { toast } from "sonner"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

export function BudgetList() {
  const [budgets, setBudgets] = useState<any[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBudgets() {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch('/api/budgets')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setBudgets(data)
      } catch (err) {
        setError("Failed to fetch budgets. Please try again later.")
        toast.error("Failed to fetch budgets")
      } finally {
        setLoading(false)
      }
    }
    fetchBudgets()
  }, [])

  const handleDelete = (id: string) => {
    setSelectedBudget(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    try {
      const response = await fetch(`/api/budgets/${selectedBudget}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      setBudgets(budgets.filter((budget) => budget._id !== selectedBudget))
      toast.success("Budget deleted", {
        description: "The budget has been successfully removed.",
      })
    } catch (err) {
      toast.error("Failed to delete budget")
    } finally {
      setDeleteDialogOpen(false)
      setSelectedBudget(null)
    }
  }

  if (loading) {
    return <div>Loading budgets...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Spent</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {budgets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No budgets found.
                </TableCell>
              </TableRow>
            ) : (
              budgets.map((budget) => {
                const amount = Number(budget.amount) || 0
                const amountSpent = Number(budget.amountSpent) || 0
                const percentage = Math.round((amountSpent / amount) * 100) || 0
                const isOverBudget = amountSpent > amount
                
                return (
                  <TableRow key={budget._id}>
                    <TableCell className="font-medium">{budget.category}</TableCell>
                    <TableCell>{budget.month} {budget.year}</TableCell>
                    <TableCell>${amount.toFixed(2)}</TableCell>
                    <TableCell>${amountSpent.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={percentage > 100 ? 100 : percentage} 
                          className={cn(
                            "h-4",
                            isOverBudget ? "bg-red-200 progress-over-budget" : "bg-gray-200 progress-normal"
                          )}
                        />
                        <span className={isOverBudget ? "text-red-500 font-medium" : ""}>
                          {percentage}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/budgets/edit/${budget._id}`}>
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(budget._id)}>
                            <Trash2 className="h-4 w-4 text-red-500 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the budget.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}