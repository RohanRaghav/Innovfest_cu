import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { sendVerificationEmail } from "@/lib/email"
import { getZoneFromState, normalizeZoneName } from "@/lib/zone"
import { ObjectId } from "mongodb"

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret"
const EMAIL_SECRET = process.env.EMAIL_SECRET || process.env.JWT_SECRET || "email-secret"

function normalizePhone(p?: string) {
  if (!p) return null
  return p.replace(/[^0-9]/g, "")
}

function generateReferralCode(emailLocal: string, phoneDigits: string | null) {
  const e = (emailLocal || "").replace(/[^a-z0-9]/gi, "").slice(0, 5)
  const p = (phoneDigits || "").slice(-5)
  let code = (e + p).toUpperCase()
  if (!code) code = Math.random().toString(36).slice(2, 8).toUpperCase()
  return code
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, fullName, phone, pinCode, city, state, college, uid, referralCode } = body

    if (!email || !password)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })

    const client = await clientPromise
    if (!client)
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })

    const db = client.db()
    const users = db.collection("users")

    const existingEmail = await users.findOne({ email: email.toLowerCase() })
    if (existingEmail)
      return NextResponse.json({ error: "User already exists" }, { status: 409 })

    if (phone) {
      const normalized = normalizePhone(phone)
      const existingPhone = await users.findOne({ phone: normalized })
      if (existingPhone) return NextResponse.json({ error: "Phone already registered" }, { status: 409 })
    }

    if (uid) {
      const existingUid = await users.findOne({ uid })
      if (existingUid) return NextResponse.json({ error: "UID already registered" }, { status: 409 })
    }

    // First user becomes ADMIN
    const total = await users.countDocuments()
    const role = total === 0 ? "ADMIN" : "CA"

    const passwordHash = await bcrypt.hash(password, 10)
    const now = new Date()

    // Generate referral code and ensure uniqueness
    const local = email.split("@")[0] || ""
    const phoneDigits = phone ? normalizePhone(phone) : null
    let code = generateReferralCode(local, phoneDigits)
    // ensure unique
    let suffix = 0
    while (await users.findOne({ referralCode: code })) {
      suffix += 1
      code = (generateReferralCode(local, phoneDigits) + suffix).slice(0, 10)
    }

    // If referralCode provided in body, try to find referred user
    let referredBy = null
    if (referralCode) {
      const ref = await users.findOne({ referralCode: (referralCode || "").toUpperCase() })
      if (ref) referredBy = String(ref._id)
    }

    // Determine zone from state (or mark international)
    let zone = getZoneFromState(state) || null
    if (!zone && state) zone = normalizeZoneName(state) || null
    // if user provided zone string, normalize
    const providedZone = (body.zone || body.zoneName || null)
    if (providedZone) zone = normalizeZoneName(providedZone) || zone
    if (!zone) zone = "INTERNATIONAL"

    const insertDoc: any = {
      email: email.toLowerCase(),
      passwordHash,
      fullName: fullName || null,
      phone: phone ? normalizePhone(phone) : null,
      pinCode: pinCode || null,
      city: city || null,
      state: state || null,
      zone,
      college: college || null,
      uid: uid || null,
      referralCode: code,
      referredBy,

      role,

      // ✅ DEFAULT METRICS
      points: 0,
      tasksDone: 0,

      emailVerified: false,

      createdAt: now,
      updatedAt: now,
    }

    // Auto-assign to a zone head if one exists for the zone
    try {
      const zonesColl = db.collection('zones')
      let zoneDoc = null
      const pinPrefix = insertDoc.pinCode ? String(insertDoc.pinCode).slice(0, 3) : null
      if (pinPrefix) {
        zoneDoc = await zonesColl.findOne({ pinPrefixes: { $in: [pinPrefix, pinPrefix.slice(0,2)] } })
      }
      if (!zoneDoc && zone) zoneDoc = await zonesColl.findOne({ name: zone })
      if (zoneDoc && zoneDoc.headUserId) {
        insertDoc.zoneHeadId = String(zoneDoc.headUserId)
        // ensure user's zone is normalized to zoneDoc.name
        insertDoc.zone = zoneDoc.name
      } else {
        // fallback: find a ZONE_HEAD whose canonical zone matches
        const zhs = await users.find({ role: "ZONE_HEAD" }).toArray()
        for (const zh of zhs) {
          const zhRaw = getZoneFromState(zh.state) || zh.zone || null
          const zhZone = zhRaw ? normalizeZoneName(zhRaw) : null
          if (zhZone === zone) {
            insertDoc.zoneHeadId = String(zh._id)
            // ensure zone-head's zone is canonical in DB
            if (zh.zone !== zone) {
              await users.updateOne({ _id: zh._id }, { $set: { zone } })
            }
            break
          }
        }
      }
    } catch (e) {
      // ignore
    }

    const result = await users.insertOne(insertDoc)

    const user = await users.findOne({ _id: result.insertedId }, { projection: { passwordHash: 0 } })

    // Link to a zone head if possible and save head name
    try {
      const zonesColl = db.collection('zones')
      let zoneHeadId = insertDoc.zoneHeadId || null
      // try zone doc by pin prefix first
      const pinPrefix = insertDoc.pinCode ? String(insertDoc.pinCode).slice(0, 3) : null
      let zdoc = null
      if (!zoneHeadId && pinPrefix) {
        zdoc = await zonesColl.findOne({ pinPrefixes: { $in: [pinPrefix, pinPrefix.slice(0, 2)] } })
        if (zdoc && zdoc.headUserId) zoneHeadId = String(zdoc.headUserId)
      }
      if (!zoneHeadId && insertDoc.zone) {
        zdoc = zdoc || await zonesColl.findOne({ name: insertDoc.zone })
        if (zdoc && zdoc.headUserId) zoneHeadId = String(zdoc.headUserId)
      }

      if (zoneHeadId) {
        const zh = await users.findOne({ _id: new ObjectId(zoneHeadId) })
        if (zh) {
          await users.updateOne({ _id: result.insertedId }, { $set: { zoneHeadId: String(zh._id), zoneHeadName: zh.fullName || zh.email, zone: zh.zone || insertDoc.zone || insertDoc.pinCode, updatedAt: new Date() } })
        } else {
          await users.updateOne({ _id: result.insertedId }, { $set: { zoneHeadId, updatedAt: new Date() } })
        }
      }
    } catch (e) {
      console.error('Failed to link zone head for new user', e)
    }

    // send verification email
    try {
      await sendVerificationEmail(user)
    } catch (e) {
      console.error("Failed to send verification email", e)
    }



    return NextResponse.json({ ok: true, message: "Verification email sent. Please verify your email to activate your account." })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json(
      { error: err.message || String(err) },
      { status: 500 }
    )
  }
}
