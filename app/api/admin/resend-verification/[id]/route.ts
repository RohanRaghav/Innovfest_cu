import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"
import { sendVerificationEmail } from "@/lib/email"

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret"

export async function POST(req: Request, { params }: { params: { id: string } }) {
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

    const requester = await users.findOne({ _id: new ObjectId(userId) })
    if (!requester || requester.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const target = await users.findOne({ _id: new ObjectId(params.id) })
    if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 })

    await sendVerificationEmail(target)

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
