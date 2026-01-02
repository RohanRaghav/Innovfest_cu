import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    if (!client) return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    const db = client.db()
    const users = db.collection("users")

    const cursor = users.find({}, { projection: { passwordHash: 0 } })
    const rows = await cursor.toArray()

    // build CSV: id,email,fullName,phone,city,state,zone
    const header = ["id", "email", "fullName", "phone", "city", "state", "zone"].join(",")
    const lines = rows.map((r: any) => {
      const cols = [
        r._id?.toString() || "",
        r.email || "",
        (r.fullName || "").replace(/"/g, '""'),
        r.phone || "",
        r.city || "",
        r.state || "",
        r.zone || "",
      ]
      return cols.map((c) => `"${String(c)}"`).join(",")
    })

    const csv = [header, ...lines].join("\n")

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="users_states.csv"`,
      },
    })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
