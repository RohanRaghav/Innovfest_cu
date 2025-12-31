import { NextResponse } from "next/server"
import admin from "@/lib/firebaseAdmin"
import clientPromise from "@/lib/mongodb"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const idToken = authHeader.split(" ")[1]

    const decoded = await admin.auth().verifyIdToken(idToken)
    const uid = decoded.uid

    const body = await req.json()
    if (!body.action || !["APPROVE", "REJECT"].includes(body.action)) return NextResponse.json({ error: "Invalid action" }, { status: 400 })

    const client = await clientPromise
    const db = client.db()
    const users = db.collection("users")
    const submissions = db.collection("submissions")

    const requester = await users.findOne({ uid })
    if (!requester) return NextResponse.json({ error: "Profile not found" }, { status: 404 })

    const submission = await submissions.findOne({ _id: new (require("mongodb").ObjectId)(params.id) })
    if (!submission) return NextResponse.json({ error: "Submission not found" }, { status: 404 })

    // Check permission: admin can approve any, zone-head only for same zone
    if (requester.role !== "ADMIN") {
      if (requester.role !== "ZONE_HEAD") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      if (submission.zone !== requester.zone) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const now = new Date()

    if (body.action === "APPROVE") {
      // award points
      const awarded = body.points !== undefined ? Number(body.points) : submission.points || 0
      await submissions.updateOne({ _id: submission._id }, { $set: { status: "APPROVED", updatedAt: now, awardedPoints: awarded, reviewerUid: uid, reviewNote: body.note || null } })

      // increment user's points and record to rewards/evaluations collection
      await users.updateOne({ uid: submission.uid }, { $inc: { points: awarded }, $set: { updatedAt: now } })

      const evaluations = db.collection("evaluations")
      await evaluations.insertOne({ uid: submission.uid, submissionId: submission._id, taskId: submission.taskId, awardedPoints: awarded, reviewer: uid, createdAt: now })

      return NextResponse.json({ ok: true })
    } else {
      await submissions.updateOne({ _id: submission._id }, { $set: { status: "REJECTED", updatedAt: now, reviewerUid: uid, reviewNote: body.note || null } })
      return NextResponse.json({ ok: true })
    }
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}