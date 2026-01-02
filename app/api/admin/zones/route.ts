import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    if (!client) return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    const db = client.db()

    const users = db.collection("users")

    // aggregate zones: head (role ZONE_HEAD), count of ambassadors
    const zones = await users.aggregate([
      {
        $match: { zone: { $exists: true, $ne: null } },
      },
      {
        $group: {
          _id: "$zone",
          ambassadors: { $sum: { $cond: [{ $eq: ["$role", "CA"] }, 1, 0] } },
          heads: { $push: { role: "$role", name: "$fullName", id: "$_id" } },
        },
      },
      { $sort: { _id: 1 } },
    ]).toArray()

    const formatted = zones.map((z: any) => {
      const head = (z.heads || []).find((h: any) => h.role === "ZONE_HEAD")
      return { zone: z._id, ambassadors: z.ambassadors || 0, head: head ? head.name : null }
    })

    return NextResponse.json({ zones: formatted })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
