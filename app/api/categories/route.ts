import { NextResponse } from "next/server"
import clientPromise from "@/lib/db"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("finance_tracker")
    
    const categories = await db
      .collection("categories")
      .find({})
      .sort({ createdAt: -1 })
      .toArray()
    
    return NextResponse.json(categories)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db("finance_tracker")
    
    const data = await request.json()
    
    // Validate the data
    if (!data.name || !data.icon || !data.color) {
      return NextResponse.json(
        { error: "Missing required fields: name, icon, and color are required" },
        { status: 400 }
      )
    }
    
    const result = await db.collection("categories").insertOne({
      name: data.name,
      description: data.description || "",
      icon: data.icon,
      color: data.color,
      createdAt: new Date(),
    })
    
    return NextResponse.json({ 
      message: "Category created successfully",
      id: result.insertedId 
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    )
  }
}