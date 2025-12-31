import { NextResponse } from "next/server"
import admin from "@/lib/firebaseAdmin"
import clientPromise from "@/lib/mongodb"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db()
    const tasks = db.collection("tasks")

    const task = await tasks.findOne({ _id: new (require("mongodb").ObjectId)(params.id) })
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
    const update: any = {}
    if (body.title) update.title = body.title
    if (body.description !== undefined) update.description = body.description
    if (body.zone !== undefined) update.zone = body.zone
    if (body.points !== undefined) update.points = Number(body.points)
    if (body.active !== undefined) update.active = !!body.active
    update.updatedAt = new Date()

    await tasks.updateOne({ _id: new (require("mongodb").ObjectId)(params.id) }, { $set: update })

    const updated = await tasks.findOne({ _id: new (require("mongodb").ObjectId)(params.id) })

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
    const idToken = authHeader.split(" ")[1]

    const decoded = await admin.auth().verifyIdToken(idToken)
    const uid = decoded.uid

    const client = await clientPromise
    const db = client.db()
    const users = db.collection("users")
    const tasks = db.collection("tasks")

    const requester = await users.findOne({ uid })
    if (!requester || requester.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    await tasks.deleteOne({ _id: new (require("mongodb").ObjectId)(params.id) })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
