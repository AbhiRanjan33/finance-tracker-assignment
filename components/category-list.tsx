"use client"

import { useEffect, useState } from "react"
import { Pencil, Trash2 } from 'lucide-react'
import Link from "next/link"
import { toast } from "sonner"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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

export function CategoryList() {
  const [categories, setCategories] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        // Fetch categories
        const categoriesResponse = await fetch('/api/categories')
        if (!categoriesResponse.ok) {
          throw new Error(`HTTP error! status: ${categoriesResponse.status}`)
        }
        const categoriesData = await categoriesResponse.json()

        // Fetch transactions for the current month (April 2025)
        const currentMonth = new Date().toLocaleString('default', { month: 'long' })
        const currentYear = new Date().getFullYear()
        const startDate = new Date(currentYear, 3, 1).toISOString() // April 1st, 2025
        const endDate = new Date(currentYear, 3, 30).toISOString()   // April 30th, 2025
        const transactionsResponse = await fetch(
          `/api/transactions?startDate=${startDate}&endDate=${endDate}`
        )
        if (!transactionsResponse.ok) {
          throw new Error(`HTTP error! status: ${transactionsResponse.status}`)
        }
        const transactionsData = await transactionsResponse.json()

        // Calculate transaction count per category
        const transactionCounts = transactionsData.reduce((acc: { [key: string]: number }, transaction: any) => {
          const categoryName = transaction.category
          acc[categoryName] = (acc[categoryName] || 0) + 1
          return acc
        }, {})

        // Update categories with transaction counts
        const updatedCategories = categoriesData.map((category: any) => ({
          ...category,
          transactionCount: transactionCounts[category.name] || 0,
        }))

        setCategories(updatedCategories)
        setTransactions(transactionsData)
      } catch (err) {
        setError("Failed to fetch data. Please try again later.")
        toast.error("Failed to fetch data")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleDelete = (id: string) => {
    setSelectedCategory(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    try {
      const response = await fetch(`/api/categories/${selectedCategory}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      setCategories(categories.filter((category) => category._id !== selectedCategory))
      toast.success("Category deleted", {
        description: "The category has been successfully removed.",
      })
    } catch (err) {
      toast.error("Failed to delete category")
    } finally {
      setDeleteDialogOpen(false)
      setSelectedCategory(null)
    }
  }

  if (loading) {
    return <div>Loading categories...</div>
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
              <TableHead>Icon</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Transactions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No categories found.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category._id}>
                  <TableCell>
                    <div className="text-2xl">{category.icon}</div>
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-4 w-4 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      {category.color}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{category.transactionCount || 0}</Badge>
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
                          <Link href={`/categories/edit/${category._id}`}>
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(category._id)}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => handleDelete(category._id)}>
                      <span className="sr-only">Delete</span>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the category and may affect transactions using this category.
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