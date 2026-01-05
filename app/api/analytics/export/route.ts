import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret"

function escapeCSV(val: any) {
  if (val === null || val === undefined) return ""
  const s = String(val)
  if (s.includes(",") || s.includes("\n") || s.includes('"')) return `"${s.replace(/"/g, '""')}"`
  return s
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const token = authHeader.split(" ")[1]
    const payload: any = jwt.verify(token, JWT_SECRET)
    const userId = payload?.userId
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const url = new URL(req.url)
    const zoneQuery = url.searchParams.get("zone")

    const client = await clientPromise
    if (!client) return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    const db = client.db()
    const users = db.collection("users")
    const assignments = db.collection("assignments")

    const requester = await users.findOne({ _id: new ObjectId(userId) })
    if (!requester) return NextResponse.json({ error: "Profile not found" }, { status: 404 })

    let zone = zoneQuery || null
    if (requester.role === "ZONE_HEAD") {
      zone = requester.zone
    }

    if (requester.role !== "ADMIN" && requester.role !== "ZONE_HEAD") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const match: any = { role: "CA" }
    if (zone) match.zone = zone

    const cas = await users.find(match).toArray()

    const rows = []
    for (const c of cas) {
      const totalAllocated = await assignments.countDocuments({ assigneeId: String(c._id) })
      const completed = await assignments.countDocuments({ assigneeId: String(c._id), status: "COMPLETED" })
      rows.push([
        escapeCSV(c.fullName || c.email),
        escapeCSV(c.uid || ""),
        escapeCSV(c.college || ""),
        escapeCSV(c.phone || ""),
        escapeCSV(c.email || ""),
        escapeCSV(totalAllocated),
        escapeCSV(completed),
        escapeCSV(c.referralCode || ""),
        escapeCSV(c.points || 0)
      ])
    }

    const header = ["Name","UID","College","Phone","Email","Tasks Allocated","Tasks Completed","Referral Code","Points"]
    const csv = [header.join(","), ...rows.map(r => r.join(","))].join("\n")

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="analytics-${zone || 'all'}.csv"`,
      },
    })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}