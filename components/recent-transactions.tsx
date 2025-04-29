"use client"

import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react'
import { useEffect, useState } from "react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function RecentTransactions() {
  const [transactions, setTransactions] = useState<any[]>([])

  useEffect(() => {
    async function fetchData() {
      const response = await fetch("http://localhost:3000/api/transactions?limit=5", { cache: "no-store" })
      const data = await response.json()
      setTransactions(data)
    }
    fetchData()
  }, [])

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow key={transaction._id || transaction.id}>
            <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
            <TableCell>{transaction.description}</TableCell>
            <TableCell>
              <Badge variant={transaction.amount > 0 ? "outline" : "secondary"}>
                {transaction.category}
              </Badge>
            </TableCell>
            <TableCell className={cn(
              "text-right font-medium",
              transaction.amount > 0 ? "text-green-600" : "text-red-600"
            )}>
              <div className="flex items-center justify-end">
                {transaction.amount > 0 ? (
                  <ArrowUpIcon className="mr-1 h-4 w-4 text-green-600" />
                ) : (
                  <ArrowDownIcon className="mr-1 h-4 w-4 text-red-600" />
                )}
                ${Math.abs(transaction.amount).toFixed(2)}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}