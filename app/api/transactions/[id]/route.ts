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
    
    const transaction = await db
      .collection("transactions")
      .findOne({ _id: new ObjectId(params.id) })
    
    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(transaction)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch transaction" },
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
    if (!data.description || !data.amount || !data.date || !data.category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }
    
    const result = await db.collection("transactions").updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          description: data.description,
          amount: Number(data.amount),
          date: new Date(data.date),
          category: data.category,
          updatedAt: new Date(),
        },
      }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ message: "Transaction updated successfully" })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update transaction" },
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
      .collection("transactions")
      .deleteOne({ _id: new ObjectId(params.id) })
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ message: "Transaction deleted successfully" })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete transaction" },
      { status: 500 }
    )
  }
}
