import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"
import { getZoneFromState, normalizeZoneName } from "@/lib/zone"
import { assignZoneHeadToZone, assignZonesForAll } from "@/lib/assignZone"

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret"

export async function POST(req: Request) {
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
    if (!requester || requester.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    // allow targeted assignment by passing { zone: "ZONE_NAME" } in the request body
    try {
      const body = await req.json().catch(() => null)
      if (body && body.zone) {
        const res = await assignZoneHeadToZone(db, body.zone)
        return NextResponse.json({ ok: true, updated: res.updated, zoneHeadId: res.zoneHeadId, zoneHeadName: res.zoneHeadName })
      }
    } catch (e) {}

    // otherwise run the global backfill (existing logic kept for compatibility)
    const cursor = users.find({ role: "CA" })
    let updated = 0

    const zonesColl = db.collection('zones')

    while (await cursor.hasNext()) {
      const u: any = await cursor.next()
      if (!u) continue
      const zoneRaw = getZoneFromState(u.state || null) || (u.zone || null) || null
      const zone = normalizeZoneName(zoneRaw) || (zoneRaw || "INTERNATIONAL")

      let zoneHeadId = u.zoneHeadId || null
      let zoneHeadName = u.zoneHeadName || null

      // try zone document first
      try {
        const zdoc = await zonesColl.findOne({ name: zone })
        if (zdoc && zdoc.headUserId) {
          zoneHeadId = String(zdoc.headUserId)
          zoneHeadName = zdoc.headName || zoneHeadName
        }
      } catch (e) {}

      // fallback: find a zone head user whose canonical zone matches
      if (!zoneHeadId) {
        const zhs = await users.find({ role: "ZONE_HEAD" }).toArray()
        for (const zh of zhs) {
          const zhRaw = getZoneFromState(zh.state) || zh.zone || null
          const zhZone = zhRaw ? normalizeZoneName(zhRaw) : null
          if (zhZone === zone) {
            zoneHeadId = String(zh._id)
            zoneHeadName = zh.fullName || zh.email
            // ensure zone-head's zone is canonicalized in DB
            if (zh.zone !== zone) {
              await users.updateOne({ _id: zh._id }, { $set: { zone } })
            }
            break
          }
        }
      }

      const set: any = { zone, updatedAt: new Date() }
      if (zoneHeadId) {
        set.zoneHeadId = zoneHeadId
        if (zoneHeadName) set.zoneHeadName = zoneHeadName
      }
      await users.updateOne({ _id: u._id }, { $set: set })
      updated += 1
    }

    return NextResponse.json({ ok: true, updated })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}