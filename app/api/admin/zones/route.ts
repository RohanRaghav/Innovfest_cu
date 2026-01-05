import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { normalizeZoneName } from "@/lib/zone"

export async function GET() {
  try {
    const client = await clientPromise
    if (!client) return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    const db = client.db()

    const users = db.collection("users")
    const zonesColl = db.collection('zones')

    // return zones stored in zones collection, include headName and count of CAs in that zone
    const zones = await zonesColl.find().sort({ name: 1 }).toArray()
    const formatted: any[] = []
    for (const z of zones) {
      const orMatch: any[] = [{ zone: z.name }]
      if (z.pinPrefixes && z.pinPrefixes.length) {
        for (const p of z.pinPrefixes) orMatch.push({ pinCode: { $regex: `^${p}` } })
      }
      const ambassadors = await users.countDocuments({ role: 'CA', $or: orMatch })
      formatted.push({ zone: z.name, pinPrefixes: z.pinPrefixes || [], ambassadors, head: z.headName || null })
    }

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

    // normalize zone name when storing
    const canonical = normalizeZoneName(name) || name
    const doc: any = { name: canonical, displayName: name, pinPrefixes: pinPrefixes.map(String), createdAt: new Date(), updatedAt: new Date() }
    const r = await zonesColl.insertOne(doc)
    doc._id = r.insertedId

    // if headUserId provided, set that user as ZONE_HEAD and assign zone for matching users
    if (headUserId) {
      try {
        await users.updateOne({ _id: new ObjectId(headUserId) }, { $set: { role: 'ZONE_HEAD', zone: canonical, updatedAt: new Date() } })
      } catch (e) {
        // ignore individual update errors
      }

      // set headName in the zone doc
      try {
        const head = await users.findOne({ _id: new ObjectId(headUserId) })
        const headName = head ? head.fullName || head.email : null
        await zonesColl.updateOne({ _id: r.insertedId }, { $set: { headUserId: headUserId, headName, updatedAt: new Date() } })
      } catch (e) {}

      // assign zone to users whose pinCode starts with any of the provided prefixes and link them to the head
      try {
        const head = await users.findOne({ _id: new ObjectId(headUserId) })
        const headName = head ? head.fullName || head.email : null
        for (const p of pinPrefixes) {
          const regex = new RegExp('^' + String(p))
          await users.updateMany({ pinCode: { $regex: regex } }, { $set: { zone: canonical, zoneHeadId: headUserId, zoneHeadName: headName, updatedAt: new Date() } })
        }

        // also ensure any existing users already in the zone are linked to this head
        await users.updateMany({ role: 'CA', zone: canonical }, { $set: { zoneHeadId: headUserId, zoneHeadName: headName, updatedAt: new Date() } })

        // trigger targeted canonical assignment for this zone to catch state-based matches
        try {
          const { assignZoneHeadToZone } = await import('@/lib/assignZone')
          await assignZoneHeadToZone(db, canonical)
        } catch (e) {
          console.error('Failed to run targeted zone assignment after zone creation', e)
        }
      } catch (e) {
        // ignore
      }
    }

    return NextResponse.json({ ok: true, zone: doc })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
