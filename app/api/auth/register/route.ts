import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, fullName, phone, pinCode, city, state } = body

    if (!email || !password)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })

    const client = await clientPromise
    if (!client)
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })

    const db = client.db()
    const users = db.collection("users")

    const existing = await users.findOne({ email: email.toLowerCase() })
    if (existing)
      return NextResponse.json({ error: "User already exists" }, { status: 409 })

    // First user becomes ADMIN
    const total = await users.countDocuments()
    const role = total === 0 ? "ADMIN" : "CA"

    const passwordHash = await bcrypt.hash(password, 10)
    const now = new Date()

    const result = await users.insertOne({
      email: email.toLowerCase(),
      passwordHash,
      fullName: fullName || null,
      phone: phone || null,
      pinCode: pinCode || null,
      city: city || null,
      state: state || null,

      role,

      // ✅ DEFAULT METRICS
      points: 0,
      tasksDone: 0,

      createdAt: now,
      updatedAt: now,
    })

    const user = await users.findOne(
      { _id: result.insertedId },
      { projection: { passwordHash: 0 } }
    )

    const token = jwt.sign(
      { userId: String(result.insertedId), role },
      JWT_SECRET,
      { expiresIn: "7d" }
    )

    return NextResponse.json({ token, user })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json(
      { error: err.message || String(err) },
      { status: 500 }
    )
  }
}
