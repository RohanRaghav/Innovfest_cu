import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret"

export async function POST(req: Request) {
  // Assign tasks to users (admin can assign any, zone-head only within their zone)
  try {
    const authHeader = req.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const token = authHeader.split(" ")[1]
    const payload: any = jwt.verify(token, JWT_SECRET)
    const userId = payload?.userId
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { taskId, task, assigneeIds, assignToZone } = body
    // Accept either an existing taskId or an inline `task` object to create-and-assign
    if (!taskId && !task) return NextResponse.json({ error: "taskId or task object required" }, { status: 400 })

    const client = await clientPromise
    if (!client) return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    const db = client.db()
    const users = db.collection("users")
    const tasks = db.collection("tasks")
    const assignments = db.collection("assignments")

    const requester = await users.findOne({ _id: new ObjectId(userId) })
    if (!requester) return NextResponse.json({ error: "Profile not found" }, { status: 404 })

    let taskDoc: any = null
    if (task) {
      // create an ad-hoc task (created by requester) and then assign
      if (requester.role !== "ADMIN" && requester.role !== "ZONE_HEAD") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      // zone-heads cannot create tasks outside their zone
      if (requester.role === "ZONE_HEAD" && task.zone && task.zone !== requester.zone) return NextResponse.json({ error: "Cannot create task outside your zone" }, { status: 403 })
      const now = new Date()
      const newTask: any = {
        title: task.title,
        description: task.description || null,
        zone: task.zone || (requester.role === "ZONE_HEAD" ? requester.zone : null),
        points: typeof task.points === "number" ? task.points : Number(task.points || 0),
        active: task.active === undefined ? true : !!task.active,
        deadline: task.deadline ? new Date(task.deadline) : null,
        createdBy: String(requester._id),
        createdAt: now,
        updatedAt: now,
      }
      const rt = await tasks.insertOne(newTask)
      newTask._id = rt.insertedId
      taskDoc = newTask
    } else {
      taskDoc = await tasks.findOne({ _id: new ObjectId(taskId) })
      if (!taskDoc) return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    let targets: any[] = []

    if (assignToZone) {
      // assign to all CAs in a zone
      if (requester.role !== "ADMIN" && requester.role !== "ZONE_HEAD") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      const zone = assignToZone === true ? (requester.role === "ZONE_HEAD" ? requester.zone : body.zone) : body.zone
      if (!zone) return NextResponse.json({ error: "zone required" }, { status: 400 })
      // zone-heads can only assign in their own zone
      if (requester.role === "ZONE_HEAD" && requester.zone !== zone) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      // Find CAs whose zone OR pinCode matches the requested zone
      targets = await users.find({ role: "CA", $or: [{ zone: zone }, { pinCode: zone }] }).toArray()
    } else if (Array.isArray(assigneeIds) && assigneeIds.length) {
      // assign to selected users (CA or ZONE_HEAD)
      targets = await users.find({ _id: { $in: assigneeIds.map((id: string) => new ObjectId(id)) } }).toArray()
      // zone-head cannot assign CA outside their zone
      if (requester.role === "ZONE_HEAD") {
        const outside = targets.find((t: any) => t.role === "CA" && !(t.zone === requester.zone || t.pinCode === requester.zone || t.pinCode === requester.pinCode))
        if (outside) return NextResponse.json({ error: "Cannot assign CA outside your zone" }, { status: 403 })
      }
    } else {
      return NextResponse.json({ error: "No assignees specified" }, { status: 400 })
    }

    const now = new Date()
    const docs = targets.map((t: any) => ({
      taskId: taskDoc._id,
      assigneeId: String(t._id),
      assignedBy: String(requester._id),
      zone: t.zone || t.pinCode || null,
      status: "PENDING",
      createdAt: now,
      updatedAt: now,
      points: taskDoc.points || 0,
    }))

    if (!docs.length) return NextResponse.json({ ok: true, assigned: 0 })

    const r = await assignments.insertMany(docs)
    return NextResponse.json({ ok: true, assigned: r.insertedCount })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}

export async function GET(req: Request) {
  // List assignments (admin all, zone-head limited to their zone, CA just their own)
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
    const assignments = db.collection("assignments")

    const requester = await users.findOne({ _id: new ObjectId(userId) })
    if (!requester) return NextResponse.json({ error: "Profile not found" }, { status: 404 })

    if (requester.role === "ADMIN") {
      const all = await assignments.find().sort({ createdAt: -1 }).toArray()
      return NextResponse.json({ assignments: all })
    } else if (requester.role === "ZONE_HEAD") {
      const all = await assignments.find({ zone: requester.zone }).sort({ createdAt: -1 }).toArray()
      return NextResponse.json({ assignments: all })
    } else if (requester.role === "CA") {
      const all = await assignments.find({ assigneeId: String(requester._id) }).sort({ createdAt: -1 }).toArray()
      return NextResponse.json({ assignments: all })
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}