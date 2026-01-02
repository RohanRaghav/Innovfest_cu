import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

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

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, pinPrefixes, headUserId } = body
    if (!name || !pinPrefixes || !Array.isArray(pinPrefixes))
      return NextResponse.json({ error: 'name and pinPrefixes[] required' }, { status: 400 })

    const client = await clientPromise
    if (!client) return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    const db = client.db()

    const zonesColl = db.collection('zones')
    const users = db.collection('users')

    // ensure unique zone name
    const exists = await zonesColl.findOne({ name })
    if (exists) return NextResponse.json({ error: 'Zone name already exists' }, { status: 400 })

    const doc: any = { name, pinPrefixes: pinPrefixes.map(String), createdAt: new Date(), updatedAt: new Date() }
    const r = await zonesColl.insertOne(doc)
    doc._id = r.insertedId

    // if headUserId provided, set that user as ZONE_HEAD and assign zone for matching users
    if (headUserId) {
      try {
        await users.updateOne({ _id: new ObjectId(headUserId) }, { $set: { role: 'ZONE_HEAD', zone: name, updatedAt: new Date() } })
      } catch (e) {
        // ignore individual update errors
      }

      // assign zone to users whose pinCode starts with any of the provided prefixes
      for (const p of pinPrefixes) {
        const regex = new RegExp('^' + String(p))
        await users.updateMany({ pinCode: { $regex: regex } }, { $set: { zone: name, updatedAt: new Date() } })
      }
    }

    return NextResponse.json({ ok: true, zone: doc })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
