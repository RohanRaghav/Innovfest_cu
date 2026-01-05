import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"
import { getZoneFromState, normalizeZoneName } from "@/lib/zone"

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret"

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const token = authHeader.split(" ")[1]

    const payload: any = jwt.verify(token, JWT_SECRET)
    const userId = payload?.userId
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()

    const client = await clientPromise
    if (!client) return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    const db = client.db()
    const users = db.collection("users")

    const now = new Date()
    const userDoc = {
      fullName: body.fullName || null,
      phone: body.phone || null,
      college: body.college || null,
      zone: body.zone || null,
      updatedAt: now,
    }

    await users.updateOne({ _id: new ObjectId(userId) }, { $set: userDoc }, { upsert: false })

    const updated = await users.findOne({ _id: new ObjectId(userId) }, { projection: { passwordHash: 0 } })

    return NextResponse.json({ ok: true, user: updated })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}

export async function GET(req: Request) {
  // Admin-only: return all users when called with Admin token
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

    const requester = await users.findOne({ _id: new ObjectId(userId) })

    // Admin can fetch all users
    if (requester && requester.role === "ADMIN") {
      const url = new URL(req.url)
      const zoneParam = url.searchParams.get("zone")
      const query: any = {}
      if (zoneParam) query.$or = [{ zone: zoneParam }, { pinCode: zoneParam }]
      const all = await users.find(query).sort({ createdAt: -1 }).toArray()
      return NextResponse.json({ users: all })
    }

    // Zone Heads can fetch CAs in their zone or those already linked to them
    if (requester && requester.role === "ZONE_HEAD") {
      const zoneRaw = requester.zone || requester.pinCode || null
      const zone = normalizeZoneName(zoneRaw) || zoneRaw || null
      if (!zone) return NextResponse.json({ users: [] })

      const zonesColl = db.collection('zones')
      const zoneDoc = await zonesColl.findOne({ $or: [{ name: zone }, { headUserId: String(requester._id) }] })

      const orMatch: any[] = []
      orMatch.push({ zone })
      orMatch.push({ zoneHeadId: String(requester._id) })

      // if zone is numeric (pin prefix), match pinCode startsWith
      if (zone && String(zone).match(/^\d+$/)) {
        orMatch.push({ pinCode: { $regex: `^${zone}` } })
      } else {
        // match pinCode equal or prefix match
        orMatch.push({ pinCode: zone })
        orMatch.push({ pinCode: { $regex: `^${String(zone).slice(0, 3)}` } })
      }

      if (zoneDoc && zoneDoc.pinPrefixes && zoneDoc.pinPrefixes.length) {
        for (const p of zoneDoc.pinPrefixes) orMatch.push({ pinCode: { $regex: `^${p}` } })
      }

      const results = await users
        .find({ role: "CA", $or: orMatch })
        .sort({ createdAt: -1 }).toArray()
      return NextResponse.json({ users: results })
    }

    // CA can fetch only their own record
    if (requester && requester.role === "CA") {
      const self = await users.findOne({ _id: new ObjectId(userId) }, { projection: { passwordHash: 0 } })
      return NextResponse.json({ users: [self] })
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
