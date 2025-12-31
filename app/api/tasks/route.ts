import { NextResponse } from "next/server"
import admin from "@/lib/firebaseAdmin"
import clientPromise from "@/lib/mongodb"

export async function POST(req: Request) {
  // Create task (admin only)
  try {
    const authHeader = req.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const idToken = authHeader.split(" ")[1]

    const decoded = await admin.auth().verifyIdToken(idToken)
    const uid = decoded.uid

    const client = await clientPromise
    const db = client.db()
    const users = db.collection("users")
    const tasks = db.collection("tasks")

    const requester = await users.findOne({ uid })
    if (!requester || requester.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const body = await req.json()

    // Basic validation
    if (!body.title || typeof body.title !== "string") {
      return NextResponse.json({ error: "title is required" }, { status: 400 })
    }

    const now = new Date()
    const doc = {
      title: body.title,
      description: body.description || null,
      zone: body.zone || null,
      points: typeof body.points === "number" ? body.points : Number(body.points || 0),
      active: body.active === undefined ? true : !!body.active,
      createdBy: uid,
      createdAt: now,
      updatedAt: now,
    }

    const r = await tasks.insertOne(doc)
    doc._id = r.insertedId

    return NextResponse.json({ ok: true, task: doc })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const client = await clientPromise
    const db = client.db()
    const tasks = db.collection("tasks")

    const all = await tasks.find().sort({ createdAt: -1 }).toArray()
    return NextResponse.json({ tasks: all })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}