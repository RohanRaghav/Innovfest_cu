import { NextResponse } from "next/server"
import admin from "@/lib/firebaseAdmin"
import clientPromise from "@/lib/mongodb"

export async function POST(req: Request) {
  // Create submission (any authenticated CA/ZONE_HEAD/ADMIN)
  try {
    const authHeader = req.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const idToken = authHeader.split(" ")[1]

    const decoded = await admin.auth().verifyIdToken(idToken)
    const uid = decoded.uid

    const body = await req.json()
    if (!body.taskId || !body.mediaUrl) return NextResponse.json({ error: "taskId and mediaUrl are required" }, { status: 400 })

    const client = await clientPromise
    const db = client.db()
    const users = db.collection("users")
    const tasks = db.collection("tasks")
    const submissions = db.collection("submissions")

    const user = await users.findOne({ uid })
    if (!user) return NextResponse.json({ error: "User profile not found" }, { status: 404 })

    const task = await tasks.findOne({ _id: new (require("mongodb").ObjectId)(body.taskId) })
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 })

    const now = new Date()
    const doc: any = {
      uid,
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
    const idToken = authHeader.split(" ")[1]

    const decoded = await admin.auth().verifyIdToken(idToken)
    const uid = decoded.uid

    const client = await clientPromise
    const db = client.db()
    const users = db.collection("users")
    const submissions = db.collection("submissions")

    const requester = await users.findOne({ uid })
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