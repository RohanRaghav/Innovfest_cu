import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"
import { getZoneFromState, normalizeZoneName } from "@/lib/zone"

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret"

function parseCSV(text: string) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  if (!lines.length) return []
  const header = lines[0].split(",").map(h => h.trim())
  const rows = lines.slice(1).map(line => {
    const parts = line.split(",").map(p => p.trim())
    const obj: any = {}
    for (let i=0;i<header.length;i++) obj[header[i]] = parts[i] || ""
    return obj
  })
  return rows
}

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

    const text = await req.text()
    const rows = parseCSV(text)
    const results: any[] = []
    for (const r of rows) {
      try {
        const email = (r.Email || r.email || "").toLowerCase()
        const phone = (r.Phone || r.phone || "").replace(/[^0-9]/g, "")
        if (!email) { results.push({ row: r, error: "Missing email" }); continue }
        // Skip existing
        const existing = await users.findOne({ email })
        if (existing) { results.push({ row: r, ok: false, reason: "Already exists" }); continue }
        const now = new Date()
        // determine zone from provided state or zone field
        const inferredZoneRaw = getZoneFromState(r.State || r.state || null) || (r.Zone || r.zone || null) || null
        const inferredZone = normalizeZoneName(inferredZoneRaw) || (inferredZoneRaw || "INTERNATIONAL")

        const doc: any = {
          email,
          passwordHash: null,
          fullName: r.Name || r.name || null,
          phone: phone || null,
          college: r.College || r.college || null,
          uid: r.UID || r.uid || null,
          referralCode: r.ReferralCode || r.referralCode || null,
          zone: inferredZone,
          points: Number(r.Points || r.points || 0),
          tasksDone: Number(r.TasksCompleted || r.tasksCompleted || 0),
          createdAt: now,
          updatedAt: now,
          emailVerified: true,
          role: "CA",
        }

        // auto-link to a zone head if present (by zone name or pin prefixes)
        try {
          const zonesColl = db.collection('zones')
          let zdoc = null
          const pinPrefix = doc.pinCode ? String(doc.pinCode).slice(0, 3) : null
          if (pinPrefix) {
            zdoc = await zonesColl.findOne({ pinPrefixes: { $in: [pinPrefix, pinPrefix.slice(0,2)] } })
          }
          if (!zdoc && inferredZone) zdoc = await zonesColl.findOne({ name: inferredZone })
          if (zdoc && zdoc.headUserId) {
            doc.zoneHeadId = String(zdoc.headUserId)
            doc.zone = zdoc.name
            try {
              const zh = await users.findOne({ _id: new ObjectId(zdoc.headUserId) })
              if (zh) doc.zoneHeadName = zh.fullName || zh.email
            } catch (e) {}
          } else {
            // fallback: find a ZONE_HEAD whose canonical zone matches
            const zhs = await users.find({ role: "ZONE_HEAD" }).toArray()
            for (const zh of zhs) {
              const zhRaw = getZoneFromState(zh.state) || zh.zone || null
              const zhZone = zhRaw ? normalizeZoneName(zhRaw) : null
              if (zhZone === inferredZone) {
                doc.zoneHeadId = String(zh._id)
                doc.zoneHeadName = zh.fullName || zh.email
                // canonicalize ZONE_HEAD's zone
                if (zh.zone !== inferredZone) await users.updateOne({ _id: zh._id }, { $set: { zone: inferredZone } })
                break
              }
            }
          }
        } catch (e) {}

        await users.insertOne(doc)
        results.push({ row: r, ok: true })
      } catch (e: any) {
        results.push({ row: r, error: e.message || String(e) })
      }
    }

    return NextResponse.json({ ok: true, results })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}