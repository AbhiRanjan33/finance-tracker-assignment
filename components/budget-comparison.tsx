"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { toast } from "sonner"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const chartConfig = {
  budget: {
    label: "Budget",
    color: "hsl(var(--chart-1))",
  },
  actual: {
    label: "Actual",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

export function BudgetComparison() {
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hoveredBar, setHoveredBar] = useState<{ dataKey: string, index: number } | null>(null)

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
        const transformedData = data.map((budget: any) => ({
          name: budget.category,
          budget: budget.amount,
          actual: budget.amountSpent,
        }))
        setChartData(transformedData)
      } catch (err) {
        setError("Failed to fetch budgets for comparison. Please try again later.")
        toast.error("Failed to fetch budgets for comparison")
      } finally {
        setLoading(false)
      }
    }
    fetchBudgets()
  }, [])

  const handleMouseEnter = (dataKey: string, index: number) => {
    setHoveredBar({ dataKey, index })
  }

  const handleMouseLeave = () => {
    setHoveredBar(null)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget vs. Actual Spending</CardTitle>
          <CardDescription>
            Compare your budgeted amounts with actual spending for the current month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>Loading chart...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget vs. Actual Spending</CardTitle>
          <CardDescription>
            Compare your budgeted amounts with actual spending for the current month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>{error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget vs. Actual Spending</CardTitle>
        <CardDescription>
          Compare your budgeted amounts with actual spending for the current month
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div>No budget data available for comparison.</div>
        ) : (
          <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
              <ChartTooltip content={<ChartTooltipContent formatter={(value) => `$${value}`} />} />
              <Legend />
              <Bar
                dataKey="budget"
                fill="hsl(var(--chart-1))"
                radius={[4, 4, 0, 0]}
                onMouseEnter={(data, index) => handleMouseEnter("budget", index)}
                onMouseLeave={handleMouseLeave}
                style={{
                  fillOpacity: hoveredBar?.dataKey === "budget" ? 1 : 0.8,
                  stroke: hoveredBar?.dataKey === "budget" ? "#000" : "none",
                  strokeWidth: hoveredBar?.dataKey === "budget" ? 2 : 0,
                }}
              />
              <Bar
                dataKey="actual"
                fill="hsl(var(--chart-3))"
                radius={[4, 4, 0, 0]}
                onMouseEnter={(data, index) => handleMouseEnter("actual", index)}
                onMouseLeave={handleMouseLeave}
                style={{
                  fillOpacity: hoveredBar?.dataKey === "actual" ? 1 : 0.8,
                  stroke: hoveredBar?.dataKey === "actual" ? "#000" : "none",
                  strokeWidth: hoveredBar?.dataKey === "actual" ? 2 : 0,
                }}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}