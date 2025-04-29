"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { useEffect, useState } from "react"

import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const chartConfig = {
  category: {
    label: "Category",
    color: "#000",
  },
} satisfies ChartConfig

export function CategoryBreakdown() {
  const [data, setData] = useState<any[]>([])
  const [categoryColors, setCategoryColors] = useState<{ [key: string]: string }>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        // Fetch categories to get their colors
        const categoriesResponse = await fetch("http://localhost:3000/api/categories", { cache: "no-store" })
        if (!categoriesResponse.ok) throw new Error("Failed to fetch categories")
        const categories = await categoriesResponse.json()
        console.log("Fetched categories:", categories)

        const colorsMap: { [key: string]: string } = {}
        categories.forEach((cat: any) => {
          colorsMap[cat.name] = cat.color || "hsl(var(--chart-1))" // Fallback color
        })
        setCategoryColors(colorsMap)

        // Fetch transactions for the current month (April 2025)
        const currentMonth = new Date().toLocaleString('default', { month: 'long' })
        const currentYear = new Date().getFullYear()
        const startDate = new Date(currentYear, 3, 1).toISOString() // April 1st, 2025
        const endDate = new Date(currentYear, 3, 30).toISOString()   // April 30th, 2025
        const transactionsResponse = await fetch(
          `http://localhost:3000/api/transactions?startDate=${startDate}&endDate=${endDate}`,
          { cache: "no-store" }
        )
        if (!transactionsResponse.ok) throw new Error("Failed to fetch transactions")
        const transactions = await transactionsResponse.json()
        console.log("Fetched transactions:", transactions)

        // Aggregate spending by category (absolute value of negative amounts)
        const categoryData: { [key: string]: number } = {}
        transactions.forEach((t: any) => {
          if (t.amount < 0) { // Only consider expenses
            const category = t.category
            if (!categoryData[category]) {
              categoryData[category] = 0
            }
            categoryData[category] += Math.abs(t.amount)
          }
        })

        const formattedData = Object.keys(categoryData)
          .filter((name) => categoryData[name] > 0) // Only include categories with spending
          .map((name) => ({
            name,
            value: categoryData[name],
            color: colorsMap[name] || "hsl(var(--chart-1))", // Fallback color
          }))

        console.log("Formatted data for pie chart:", formattedData)
        if (formattedData.length === 0) {
          console.warn("No spending data available for this month")
        }
        setData(formattedData)
      } catch (err: any) {
        console.error("Error in fetchData:", err.message)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (data.length === 0) return <div>No spending data available for this month.</div>

  return (
    <div className="flex flex-col items-center">
      <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <ChartTooltip content={<ChartTooltipContent formatter={(value) => `$${value}`} />} />
        </PieChart>
      </ChartContainer>
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {data.map((entry, index) => (
          <div key={`legend-${index}`} className="flex items-center">
            <div
              className="w-3 h-3 mr-2 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm">{entry.name}: ${entry.value.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}