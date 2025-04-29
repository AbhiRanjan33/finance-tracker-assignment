import Link from "next/link"
import { PlusCircle } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { TransactionList } from "@/components/transaction-list"

export default function TransactionsPage() {
  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
          <Link href="/transactions/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Transaction
            </Button>
          </Link>
        </div>
        <TransactionList />
      </div>
    </div>
  )
}
