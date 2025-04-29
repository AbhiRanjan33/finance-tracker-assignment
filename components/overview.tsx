"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useEffect, useState } from "react"

import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export function Overview() {
  const [data, setData] = useState<any[]>([])
  const [hoveredBar, setHoveredBar] = useState<{ dataKey: string, index: number } | null>(null)

  useEffect(() => {
    async function fetchData() {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - 6)
      startDate.setDate(1)

      const response = await fetch(
        `http://localhost:3000/api/transactions?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        { cache: "no-store" }
      )
      const transactions = await response.json()

      const monthlyData: { [key: string]: { name: string, income: number, expenses: number } } = {}
      transactions.forEach((t: any) => {
        const date = new Date(t.date)
        const month = date.toLocaleString('default', { month: 'short' })
        const year = date.getFullYear()
        const key = `${month} ${year}`
        if (!monthlyData[key]) {
          monthlyData[key] = { name: key, income: 0, expenses: 0 }
        }
        if (t.amount > 0) {
          monthlyData[key].income += t.amount
        } else {
          monthlyData[key].expenses += Math.abs(t.amount)
        }
      })

      const sortedData = Object.values(monthlyData)
        .sort((a: any, b: any) => new Date(a.name) - new Date(b.name))
        .slice(-6)

      setData(sortedData)
    }
    fetchData()
  }, [])

  const chartConfig = {
    income: {
      label: "Income",
      color: "hsl(var(--chart-1))",
    },
    expenses: {
      label: "Expenses",
      color: "hsl(var(--chart-3))",
    },
  } satisfies ChartConfig

  const handleMouseEnter = (dataKey: string, index: number) => {
    setHoveredBar({ dataKey, index })
  }

  const handleMouseLeave = () => {
    setHoveredBar(null)
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <BarChart data={data}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="name" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
        <ChartTooltip content={<ChartTooltipContent formatter={(value) => `$${value}`} />} />
        <Bar
          dataKey="income"
          fill="hsl(var(--chart-1))"
          radius={[4, 4, 0, 0]}
          onMouseEnter={(data, index) => handleMouseEnter("income", index)}
          onMouseLeave={handleMouseLeave}
          style={{
            fillOpacity: hoveredBar?.dataKey === "income" ? 1 : 0.8,
            stroke: hoveredBar?.dataKey === "income" ? "#000" : "none",
            strokeWidth: hoveredBar?.dataKey === "income" ? 2 : 0,
          }}
        />
        <Bar
          dataKey="expenses"
          fill="hsl(var(--chart-3))"
          radius={[4, 4, 0, 0]}
          onMouseEnter={(data, index) => handleMouseEnter("expenses", index)}
          onMouseLeave={handleMouseLeave}
          style={{
            fillOpacity: hoveredBar?.dataKey === "expenses" ? 1 : 0.8,
            stroke: hoveredBar?.dataKey === "expenses" ? "#000" : "none",
            strokeWidth: hoveredBar?.dataKey === "expenses" ? 2 : 0,
          }}
        />
      </BarChart>
    </ChartContainer>
  )
}