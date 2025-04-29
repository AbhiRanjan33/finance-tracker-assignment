import { NextResponse } from "next/server"
import clientPromise from "@/lib/db"

export async function GET(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db("finance_tracker")

    const { searchParams } = new URL(request.url)
    const month = searchParams.get("month")
    const year = searchParams.get("year")

    const query: any = {}
    if (month) query.month = month
    if (year) query.year = Number(year)

    const budgets = await db
      .collection("budgets")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray()

    // Ensure amount and amountSpent are numbers, defaulting to 0 if undefined
    const sanitizedBudgets = budgets.map(budget => ({
      ...budget,
      amount: Number(budget.amount) || 0,
      amountSpent: Number(budget.amountSpent) || 0
    }))

    return NextResponse.json(sanitizedBudgets)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch budgets" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db("finance_tracker")
    
    const data = await request.json()
    
    // Validate the data
    if (!data.category || !data.amount || !data.amountSpent || !data.month || !data.year) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }
    
    const result = await db.collection("budgets").insertOne({
      category: data.category,
      amount: Number(data.amount),
      amountSpent: Number(data.amountSpent),
      month: data.month,
      year: Number(data.year),
      createdAt: new Date(),
    })
    
    return NextResponse.json({ 
      message: "Budget created successfully",
      id: result.insertedId 
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create budget" },
      { status: 500 }
    )
  }
}