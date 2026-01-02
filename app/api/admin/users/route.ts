import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

function getZoneFromPin(pin: string) {
  if (!pin || pin.length === 0) return "Unknown"
  const first = pin.trim()[0]
  if (/[12]/.test(first)) return "North"
  if (/[34]/.test(first)) return "South"
  if (/[56]/.test(first)) return "East"
  return "West"
}

/**
 * GET: Fetch all users (excluding passwordHash)
 */
export async function GET() {
  try {
    const client = await clientPromise
    if (!client)
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      )

    const db = client.db()
    const users = await db
      .collection("users")
      .find({}, { projection: { passwordHash: 0 } })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json(users)
  } catch (err: any) {
    console.error(err)
    return NextResponse.json(
      { error: err.message || String(err) },
      { status: 500 }
    )
  }
}

/**
 * PATCH: Update role / points / tasksDone
 */
export async function PATCH(req: Request) {
  try {
    const client = await clientPromise
    if (!client)
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      )

    const { userId, role, points, tasksDone } = await req.json()

    if (!userId)
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      )

    const updateData: any = {
      updatedAt: new Date(),
    }

    // normalize role values
    if (role) {
      const raw = String(role).toUpperCase().replace(/\s+/g, "_")
      const normalized = raw === "ZONE_HEAD" || raw === "ZONE-HEAD" ? "ZONE_HEAD" : raw
      updateData.role = normalized

      // if assigning zone head, determine zone from user's pinCode by consulting zones collection and ensure uniqueness
      if (normalized === "ZONE_HEAD") {
        const db = client.db()
        const usersColl = db.collection("users")
        const zonesColl = db.collection("zones")
        const target = await usersColl.findOne({ _id: new ObjectId(userId) })
        const pin = (target && target.pinCode) || ""

        // try to find a configured zone whose prefixes match the pin
        const allZones = await zonesColl.find().toArray()
        let matchedZone: string | null = null
        for (const z of allZones) {
          if (Array.isArray(z.pinPrefixes) && z.pinPrefixes.some((p: string) => pin.startsWith(String(p)))) {
            matchedZone = z.name
            break
          }
        }

        const zone = matchedZone || getZoneFromPin(pin)

        // check for existing zone head in same zone
        const existing = await usersColl.findOne({ role: "ZONE_HEAD", zone: zone, _id: { $ne: new ObjectId(userId) } })
        if (existing) {
          return NextResponse.json({ error: `Zone head already exists for zone ${zone}` }, { status: 400 })
        }

        updateData.zone = zone
      }
    }
    if (points !== undefined) updateData.points = Number(points)
    if (tasksDone !== undefined) updateData.tasksDone = Number(tasksDone)

    const db = client.db()
    const result = await db.collection("users").findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: updateData },
      {
        returnDocument: "after",
        projection: { passwordHash: 0 },
      }
    )

    if (!result.value)
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )

    return NextResponse.json(result.value)
  } catch (err: any) {
    console.error(err)
    return NextResponse.json(
      { error: err.message || String(err) },
      { status: 500 }
    )
  }
}
