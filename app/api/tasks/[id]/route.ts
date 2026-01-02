import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    if (!client) return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    const db = client.db()
    const tasks = db.collection("tasks")

    const task = await tasks.findOne({ _id: new ObjectId(params.id) })
    if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json({ task })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
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
    if (!requester || requester.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const body = await req.json()
    const update: any = {}
    if (body.title) update.title = body.title
    if (body.description !== undefined) update.description = body.description
    if (body.zone !== undefined) update.zone = body.zone
    if (body.points !== undefined) update.points = Number(body.points)
    if (body.active !== undefined) update.active = !!body.active
    update.updatedAt = new Date()

    await tasks.updateOne({ _id: new ObjectId(params.id) }, { $set: update })

    const updated = await tasks.findOne({ _id: new ObjectId(params.id) })

    return NextResponse.json({ ok: true, task: updated })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
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
    if (!requester || requester.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    await tasks.deleteOne({ _id: new ObjectId(params.id) })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
} 
