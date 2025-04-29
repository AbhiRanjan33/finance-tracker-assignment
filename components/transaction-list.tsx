"use client"

import { useEffect, useState } from "react"
import { ArrowDownIcon, ArrowUpIcon, Pencil, Trash2 } from 'lucide-react'
import Link from "next/link"
import { toast } from "sonner"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
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

export function TransactionList() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTransactions() {
      const response = await fetch('/api/transactions')
      const data = await response.json()
      if (response.ok) {
        setTransactions(data)
      } else {
        toast.error("Failed to fetch transactions")
      }
    }
    fetchTransactions()
  }, [])

  const handleDelete = (id: string) => {
    setSelectedTransaction(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    const response = await fetch(`/api/transactions/${selectedTransaction}`, {
      method: 'DELETE',
    })

    if (response.ok) {
      setTransactions(transactions.filter((transaction) => transaction._id !== selectedTransaction))
      toast.success("Transaction deleted", {
        description: "The transaction has been successfully removed.",
      })
    } else {
      toast.error("Failed to delete transaction")
    }

    setDeleteDialogOpen(false)
    setSelectedTransaction(null)
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction._id}>
                <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>
                  <Badge variant={transaction.category === "Income" ? "outline" : "secondary"}>
                    {transaction.category}
                  </Badge>
                </TableCell>
                <TableCell className={cn(
                  "text-right font-medium",
                  transaction.category === "Income" ? "text-green-600" : "text-red-600"
                )}>
                  <div className="flex items-center justify-end">
                    {transaction.category === "Income" ? (
                      <ArrowUpIcon className="mr-1 h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowDownIcon className="mr-1 h-4 w-4 text-red-600" />
                    )}
                    ${Math.abs(transaction.amount).toFixed(2)}
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
                        <Link href={`/transactions/edit/${transaction._id}`}>
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(transaction._id)}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => handleDelete(transaction._id)}>
                    <span className="sr-only">Delete</span>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the transaction.
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