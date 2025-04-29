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
    
    const category = await db
      .collection("categories")
      .findOne({ _id: new ObjectId(params.id) })
    
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(category)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch category" },
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
    if (!data.name || !data.icon || !data.color) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }
    
    const result = await db.collection("categories").updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          name: data.name,
          description: data.description || "",
          icon: data.icon,
          color: data.color,
          updatedAt: new Date(),
        },
      }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ message: "Category updated successfully" })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update category" },
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
      .collection("categories")
      .deleteOne({ _id: new ObjectId(params.id) })
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ message: "Category deleted successfully" })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    )
  }
}