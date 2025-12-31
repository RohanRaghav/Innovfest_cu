import { NextResponse } from "next/server"
import admin from "@/lib/firebaseAdmin"
import clientPromise from "@/lib/mongodb"

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const idToken = authHeader.split(" ")[1]

    const decoded = await admin.auth().verifyIdToken(idToken)
    const uid = decoded.uid

    const body = await req.json()

    const client = await clientPromise
    if (!client) return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    const db = client.db()
    const users = db.collection("users")

    // If no users exist, make this first user ADMIN
    const total = await users.countDocuments()
    const role = total === 0 ? "ADMIN" : body.role || "CA"

    const now = new Date()
    const userDoc = {
      uid,
      email: decoded.email,
      fullName: body.fullName || null,
      phone: body.phone || null,
      college: body.college || null,
      zone: body.zone || null,
      role,
      createdAt: now,
      updatedAt: now,
    }

    await users.updateOne({ uid }, { $set: userDoc }, { upsert: true })

    return NextResponse.json({ ok: true, user: userDoc })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}

export async function GET(req: Request) {
  // Admin-only: return all users when called with Admin token
  try {
    const authHeader = req.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const idToken = authHeader.split(" ")[1]

    const decoded = await admin.auth().verifyIdToken(idToken)
    const uid = decoded.uid

    const client = await clientPromise
    if (!client) return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    const db = client.db()
    const users = db.collection("users")

    const requester = await users.findOne({ uid })
    if (!requester || requester.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const all = await users.find().sort({ createdAt: -1 }).toArray()
    return NextResponse.json({ users: all })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
