import Link from "next/link"
import { ArrowUpRight, DollarSign, PiggyBank, TrendingDown, TrendingUp } from 'lucide-react'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/overview"
import { RecentTransactions } from "@/components/recent-transactions"
import { CategoryBreakdown } from "@/components/category-breakdown"

export default async function Home() {
  let transactions: any[] = [];
  let budgets: any[] = [];

  try {
    const transactionResponse = await fetch("http://localhost:3000/api/transactions", { cache: "no-store" })
    if (!transactionResponse.ok) throw new Error("Failed to fetch transactions")
    transactions = await transactionResponse.json()
  } catch (error) {
    console.error(error)
    transactions = []
  }

  try {
    const budgetResponse = await fetch("http://localhost:3000/api/budgets", { cache: "no-store" })
    if (!budgetResponse.ok) throw new Error("Failed to fetch budgets")
    budgets = await budgetResponse.json()
  } catch (error) {
    console.error(error)
    budgets = []
  }

  // Calculate real values
  const totalBalance = transactions.reduce((sum: number, t: any) => sum + (t.amount || 0), 0).toFixed(2)
  const totalIncome = transactions.filter((t: any) => t.amount > 0).reduce((sum: number, t: any) => sum + t.amount, 0).toFixed(2)
  const totalExpenses = Math.abs(transactions.filter((t: any) => t.amount < 0).reduce((sum: number, t: any) => sum + t.amount, 0)).toFixed(2)
  const totalSavings = budgets.reduce((sum: number, b: any) => sum + (b.amount - b.amountSpent || 0), 0).toFixed(2)

  // Dummy percentage changes (replace with real logic if historical data is available)
  const balanceChange = "+20.1%"
  const incomeChange = "+10.5%"
  const expenseChange = "+5.2%"
  const savingsChange = "+12.3%"

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <div className="flex items-center space-x-2">
            <Link href="/transactions/new">
              <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                Add Transaction
              </div>
            </Link>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalBalance}</div>
              <p className="text-xs text-muted-foreground">{balanceChange} from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalIncome}</div>
              <p className="text-xs text-muted-foreground">{incomeChange} from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalExpenses}</div>
              <p className="text-xs text-muted-foreground">{expenseChange} from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Savings</CardTitle>
              <PiggyBank className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalSavings}</div>
              <p className="text-xs text-muted-foreground">{savingsChange} from last month</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Monthly Overview</CardTitle>
              <CardDescription>
                Your monthly income and expenses for the past 6 months
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <Overview />
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>
                Your spending by category this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryBreakdown />
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Your most recent transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecentTransactions />
            </CardContent>
            <CardFooter>
              <Link href="/transactions" className="text-sm text-primary flex items-center">
                View all transactions
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}