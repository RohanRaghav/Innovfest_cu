import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret"

export async function POST(req: Request) {
  // Create submission (any authenticated CA/ZONE_HEAD/ADMIN)
  try {
    const authHeader = req.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const token = authHeader.split(" ")[1]

    const payload: any = jwt.verify(token, JWT_SECRET)
    const userId = payload?.userId
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    if (!body.taskId || !body.mediaUrl) return NextResponse.json({ error: "taskId and mediaUrl are required" }, { status: 400 })

    const client = await clientPromise
    if (!client) return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    const db = client.db()
    const users = db.collection("users")
    const tasks = db.collection("tasks")
    const submissions = db.collection("submissions")

    const user = await users.findOne({ _id: new ObjectId(userId) })
    if (!user) return NextResponse.json({ error: "User profile not found" }, { status: 404 })

    const task = await tasks.findOne({ _id: new ObjectId(body.taskId) })
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 })

    const now = new Date()
    const doc: any = {
      userId: String(user._id),
      userEmail: user.email || null,
      taskId: task._id,
      mediaUrl: body.mediaUrl,
      note: body.note || null,
      status: "PENDING",
      zone: user.zone || null,
      points: task.points || 0,
      createdAt: now,
      updatedAt: now,
    }

    const r = await submissions.insertOne(doc)
    doc._id = r.insertedId

    return NextResponse.json({ ok: true, submission: doc })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}

export async function GET(req: Request) {
  // Admin and zone-head: list submissions (zone-head sees only their zone). Others forbidden.
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
    if (!requester) return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    if (requester.role === "ADMIN") {
      const all = await submissions.find().sort({ createdAt: -1 }).toArray()
      return NextResponse.json({ submissions: all })
    } else if (requester.role === "ZONE_HEAD") {
      const all = await submissions.find({ zone: requester.zone }).sort({ createdAt: -1 }).toArray()
      return NextResponse.json({ submissions: all })
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
} 