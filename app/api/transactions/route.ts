import { NextResponse } from "next/server"
import clientPromise from "@/lib/db"

export async function GET(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db("finance_tracker")

    const { searchParams } = new URL(request.url)
    const limit = Number(searchParams.get("limit")) || 0
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const query: any = {}
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    const transactionsQuery = db
      .collection("transactions")
      .find(query)
      .sort({ date: -1 });

    if (limit > 0) {
      transactionsQuery.limit(limit)
    }

    const transactions = await transactionsQuery.toArray()

    return NextResponse.json(transactions)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db("finance_tracker")
    
    const data = await request.json()
    
    // Validate the data
    if (!data.description || !data.amount || !data.date || !data.category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }
    
    const result = await db.collection("transactions").insertOne({
      description: data.description,
      amount: Number(data.amount),
      date: new Date(data.date),
      category: data.category,
      createdAt: new Date(),
    })
    
    return NextResponse.json({ 
      message: "Transaction created successfully",
      id: result.insertedId 
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    )
  }
}