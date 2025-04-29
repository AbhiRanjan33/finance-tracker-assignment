import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise
    const db = client.db("finance_tracker")
    
    const budget = await db
      .collection("budgets")
      .findOne({ _id: new ObjectId(params.id) })
    
    if (!budget) {
      return NextResponse.json(
        { error: "Budget not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(budget)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch budget" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    
    const result = await db.collection("budgets").updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          category: data.category,
          amount: Number(data.amount),
          amountSpent: Number(data.amountSpent),
          month: data.month,
          year: Number(data.year),
          updatedAt: new Date(),
        },
      }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Budget not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ message: "Budget updated successfully" })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update budget" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise
    const db = client.db("finance_tracker")
    
    const result = await db
      .collection("budgets")
      .deleteOne({ _id: new ObjectId(params.id) })
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Budget not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ message: "Budget deleted successfully" })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete budget" },
      { status: 500 }
    )
  }
}