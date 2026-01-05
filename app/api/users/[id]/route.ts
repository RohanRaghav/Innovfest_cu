import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"
import { sendRolePromotionEmail } from "@/lib/email"
import { getZoneFromState, normalizeZoneName } from "@/lib/zone"

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret"

function generateReferralCode(emailLocal: string, phoneDigits: string | null) {
  const e = (emailLocal || "").replace(/[^a-z0-9]/gi, "").slice(0, 5)
  const p = (phoneDigits || "").slice(-5)
  let code = (e + p).toUpperCase()
  if (!code) code = Math.random().toString(36).slice(2, 8).toUpperCase()
  return code
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

    const requester = await users.findOne({ _id: new ObjectId(userId) })
    if (!requester || requester.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const body = await req.json()
    const update: any = {}
    if (body.role) update.role = body.role

    // Apply role update
    const before = await users.findOne({ _id: new ObjectId(params.id) })
    await users.updateOne({ _id: new ObjectId(params.id) }, { $set: { ...update, updatedAt: new Date() } })

    const updated = await users.findOne({ _id: new ObjectId(params.id) })

    // If promoted to ZONE_HEAD, ensure referral code and send congrats email
    if (body.role === "ZONE_HEAD" && updated) {
      if (!updated.referralCode) {
        const local = (updated.email || "").split("@")[0] || ""
        const phoneDigits = (updated.phone || null)
        let code = generateReferralCode(local, phoneDigits)
        let suffix = 0
        while (await users.findOne({ referralCode: code })) {
          suffix += 1
          code = (generateReferralCode(local, phoneDigits) + suffix).slice(0, 10)
        }
        await users.updateOne({ _id: updated._id }, { $set: { referralCode: code, updatedAt: new Date() } })
      }

      try {
        await sendRolePromotionEmail(updated, "ZONE_HEAD")
      } catch (e) {
        console.error("Failed to send promotion email", e)
      }

      // Register this user as ZONE_HEAD in zones and assign matching CAs
      try {
        // determine canonical zone name (prefer body.zone, then user's zone, then pin prefix, then state->zone)
        let zoneName: string | null = body.zone || updated.zone || null
        if (!zoneName && updated.pinCode) zoneName = String(updated.pinCode).slice(0, 3)
        if (!zoneName && (updated as any).state) zoneName = getZoneFromState((updated as any).state) || null
        zoneName = normalizeZoneName(zoneName) || zoneName

        // set user's zone to the canonical zone name if found
        if (zoneName) {
          await users.updateOne({ _id: updated._id }, { $set: { zone: zoneName, updatedAt: new Date() } })
        }

        const zonesColl = db.collection("zones")
        const headDisplay = updated.fullName || updated.email || ""
        const now2 = new Date()

        // upsert zone entry with headUserId and headName
        if (zoneName) {
          const existing = await zonesColl.findOne({ name: zoneName })
          if (existing) {
            await zonesColl.updateOne({ _id: existing._id }, { $set: { headUserId: String(updated._id), headName: headDisplay, updatedAt: now2 } })
          } else {
            const isPrefix = /^[0-9]{1,3}$/.test(zoneName)
            await zonesColl.insertOne({ name: zoneName, pinPrefixes: isPrefix ? [zoneName] : [], headUserId: String(updated._id), headName: headDisplay, createdAt: now2, updatedAt: now2 })
          }
          // Clear this user as head from any other zones with different name
          await zonesColl.updateMany({ headUserId: String(updated._id), name: { $ne: zoneName } }, { $unset: { headUserId: "", headName: "" }, $set: { updatedAt: now2 } })
        }

        // assign matching CAs to this zone head
        const zoneDoc = zoneName ? await zonesColl.findOne({ name: zoneName }) : null
        const orMatch: any[] = []
        if (zoneDoc && zoneDoc.pinPrefixes && zoneDoc.pinPrefixes.length) {
          for (const p of zoneDoc.pinPrefixes) orMatch.push({ pinCode: { $regex: `^${p}` } })
          orMatch.push({ zone: zoneName })
        } else {
          if (zoneName) orMatch.push({ zone: zoneName })
          if (updated.pinCode) {
            orMatch.push({ pinCode: updated.pinCode })
            orMatch.push({ pinCode: { $regex: `^${String(updated.pinCode).slice(0, 3)}` } })
          }
        }

        if (orMatch.length) {
          const now = new Date()
          await users.updateMany({ role: "CA", $or: orMatch }, { $set: { zoneHeadId: String(updated._id), zone: zoneName, zoneHeadName: headDisplay, updatedAt: now } })
        }
      } catch (e) {
        console.error("Failed to register zone head / link CAs", e)
      }
    }

    // If zone changed for a ZONE_HEAD, reassign their team
    if (body.zone && updated && updated.role === "ZONE_HEAD") {
      try {
        const zoneHeadId = String(updated!._id)
        const zone = body.zone
        const prefix = String(zone).slice(0, 3)
        const now = new Date()
        // Assign matching CAs to this zone head
        await users.updateMany({ role: "CA", $or: [{ zone }, { pinCode: zone }, { pinCode: { $regex: `^${prefix}` } }] }, { $set: { zoneHeadId, zone, updatedAt: now } })
        // Remove this zone head from CAs that are no longer in their zone
        await users.updateMany({ role: "CA", zoneHeadId: zoneHeadId, $and: [ { $nor: [{ zone }, { pinCode: zone }, { pinCode: { $regex: `^${prefix}` } }] } ] }, { $unset: { zoneHeadId: "" }, $set: { updatedAt: now } })

        // Update zones collection headUserId accordingly
        try {
          const zonesColl = db.collection('zones')
          const now2 = new Date()
          // set this user as head for new zone (create if missing)
          const existing = await zonesColl.findOne({ name: zone })
          if (existing) {
            await zonesColl.updateOne({ _id: existing._id }, { $set: { headUserId: zoneHeadId, updatedAt: now2 } })
          } else {
            await zonesColl.insertOne({ name: zone, pinPrefixes: [], headUserId: zoneHeadId, createdAt: now2, updatedAt: now2 })
          }
          // Remove headUserId from any other zone that pointed to this user but is not the new zone
          await zonesColl.updateMany({ headUserId: zoneHeadId, name: { $ne: zone } }, { $unset: { headUserId: "" }, $set: { updatedAt: now2 } })
        } catch (e) {
          console.error('Failed to update zones collection after zone change', e)
        }

      } catch (e) {
        console.error("Failed to reassign CAs after zone change", e)
      }
    }

    // If demoted from ZONE_HEAD, clear any linked CAs
    if (body.role && body.role !== "ZONE_HEAD" && before && before.role === "ZONE_HEAD") {
      try {
        const zoneHeadId = String(updated!._id)
        const now = new Date()
        await users.updateMany({ role: "CA", zoneHeadId }, { $unset: { zoneHeadId: "" }, $set: { updatedAt: now } })
        try {
          const zonesColl = db.collection('zones')
          const now2 = new Date()
          await zonesColl.updateMany({ headUserId: String(updated!._id) }, { $unset: { headUserId: "" }, $set: { updatedAt: now2 } })
        } catch (e) {
          console.error('Failed to clear zones after demotion', e)
        }
      } catch (e) {
        console.error("Failed to clear CAs after demotion", e)
      }
    }

    return NextResponse.json({ ok: true, user: await users.findOne({ _id: new ObjectId(params.id) }) })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
} 
