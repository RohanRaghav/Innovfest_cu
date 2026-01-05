import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"

const EMAIL_SECRET = process.env.EMAIL_SECRET || process.env.JWT_SECRET || "email-secret"
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const token = url.searchParams.get("token")
    if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 })

    const payload: any = jwt.verify(token, EMAIL_SECRET)
    if (!payload || payload.action !== "verify" || !payload.userId) return NextResponse.json({ error: "Invalid token" }, { status: 400 })

    const client = await clientPromise
    if (!client) return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    const db = client.db()
    const users = db.collection("users")

    const user = await users.findOne({ _id: new ObjectId(payload.userId) })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    await users.updateOne({ _id: user._id }, { $set: { emailVerified: true, updatedAt: new Date() } })

    const tokenAuth = jwt.sign({ userId: String(user._id), role: user.role }, JWT_SECRET, { expiresIn: "7d" })

    return NextResponse.json({ ok: true, token: tokenAuth })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
