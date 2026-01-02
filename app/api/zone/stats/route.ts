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
    const submissions = db.collection("submissions")

    const requester = await users.findOne({ _id: new ObjectId(userId) })
    if (!requester) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const zone = requester.zone || "Unknown"

    const activeAmbassadors = await users.countDocuments({ role: "CA", zone })
    const pendingReviews = await submissions.countDocuments({ zone, status: "PENDING" })
    const topMembers = await users
      .find({ zone }, { projection: { passwordHash: 0 } })
      .sort({ points: -1 })
      .limit(10)
      .toArray()

    return NextResponse.json({ zone, activeAmbassadors, pendingReviews, topMembers, zoneHead: requester })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
