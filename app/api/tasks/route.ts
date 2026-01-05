import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret"

export async function POST(req: Request) {
  // Create task (admin only)
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
    const tasks = db.collection("tasks")

    const requester = await users.findOne({ _id: new ObjectId(userId) })
    if (!requester || (requester.role !== "ADMIN" && requester.role !== "ZONE_HEAD")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const body = await req.json()

    // If zone-head is creating a task, ensure the zone matches their zone (or is omitted)
    if (requester.role === "ZONE_HEAD" && body.zone && body.zone !== requester.zone) return NextResponse.json({ error: "Cannot create task outside your zone" }, { status: 403 })

    // Basic validation
    if (!body.title || typeof body.title !== "string") {
      return NextResponse.json({ error: "title is required" }, { status: 400 })
    }

    const now = new Date()
    const doc: any = {
      title: body.title,
      description: body.description || null,
      zone: body.zone || null,
      points: typeof body.points === "number" ? body.points : Number(body.points || 0),
      active: body.active === undefined ? true : !!body.active,
      deadline: body.deadline ? new Date(body.deadline) : null,
      createdBy: String(userId),
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
    const authHeader = req.headers.get("authorization")
    let userId: string | null = null
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1]
        const payload: any = jwt.verify(token, JWT_SECRET)
        userId = payload?.userId || null
      } catch (e) {
        // ignore invalid token and treat as unauthenticated
        userId = null
      }
    }

    const client = await clientPromise
    if (!client) return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    const db = client.db()
    const tasksColl = db.collection("tasks")
    const assignments = db.collection("assignments")
    const users = db.collection("users")

    // Unauthenticated: only expose global (zone=null) active tasks
    if (!userId) {
      const publicTasks = await tasksColl.find({ active: true, zone: null }).sort({ createdAt: -1 }).toArray()
      return NextResponse.json({ tasks: publicTasks })
    }

    const requester = await users.findOne({ _id: new ObjectId(userId) })
    if (!requester) return NextResponse.json({ error: "Profile not found" }, { status: 404 })

    if (requester.role === "ADMIN") {
      const all = await tasksColl.find().sort({ createdAt: -1 }).toArray()
      return NextResponse.json({ tasks: all })
    }

    if (requester.role === "ZONE_HEAD") {
      // Zone head sees global tasks, tasks for their zone, and tasks explicitly assigned to them
      const assigned = await assignments.find({ assigneeId: String(requester._id) }).toArray()
      const taskIds = assigned.map((a: any) => (a.taskId ? String(a.taskId) : null)).filter((x: any): x is string => !!x)
      const query: any = { active: true, $or: [{ zone: null }, { zone: requester.zone }] }
      if (taskIds.length) {
        query.$or.push({ _id: { $in: taskIds.map((id: string) => new ObjectId(id)) } })
      }
      const tasks = await tasksColl.find(query).sort({ createdAt: -1 }).toArray()
      return NextResponse.json({ tasks })
    }

    if (requester.role === "CA") {
      // CA only sees global tasks and tasks explicitly assigned to them (or assigned to them via assign-to-zone which creates per-CA assignments)
      const assigned = await assignments.find({ assigneeId: String(requester._id) }).toArray()
      const taskIds = assigned.map((a: any) => (a.taskId ? String(a.taskId) : null)).filter((x: any): x is string => !!x)
      if (!taskIds.length) {
        const publicTasks = await tasksColl.find({ active: true, zone: null }).sort({ createdAt: -1 }).toArray()
        return NextResponse.json({ tasks: publicTasks })
      }
      const tasks = await tasksColl.find({ active: true, $or: [{ zone: null }, { _id: { $in: taskIds.map((id: string) => new ObjectId(id)) } }] }).sort({ createdAt: -1 }).toArray()
      return NextResponse.json({ tasks })
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}