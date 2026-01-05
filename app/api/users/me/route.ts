import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret"

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const token = authHeader.split(" ")[1]

    const payload: any = jwt.verify(token, JWT_SECRET)
    const userId = payload?.userId
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const client = await clientPromise
    if (!client) return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    const db = client.db()
    const users = db.collection("users")

    const user = await users.findOne({ _id: new ObjectId(userId) }, { projection: { passwordHash: 0 } })
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })

    // If user has zoneHeadId, include brief zoneHead info
    let zoneHead = null
    if (user.zoneHeadId) {
      const zh = await users.findOne({ _id: new ObjectId(user.zoneHeadId) }, { projection: { passwordHash: 0 } })
      if (zh) zoneHead = { _id: String(zh._id), fullName: zh.fullName, email: zh.email, zone: zh.zone }
    }

    return NextResponse.json({ user: { ...user, zoneHead } })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
