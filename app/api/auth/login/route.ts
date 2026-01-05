import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 })

    const client = await clientPromise
    if (!client) return NextResponse.json({ error: "Database not configured" }, { status: 500 })

    const db = client.db()
    const users = db.collection("users")

    const user = await users.findOne({ email: email.toLowerCase() })
    if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })

    if (!user.emailVerified) return NextResponse.json({ error: "Email not verified. Please verify your email before logging in." }, { status: 403 })

    const match = await bcrypt.compare(password, user.passwordHash || "")
    if (!match) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })

    const token = jwt.sign({ userId: String(user._id) }, JWT_SECRET, { expiresIn: "7d" })
    const safeUser = { ...(user as any) }
    delete (safeUser as any).passwordHash

    return NextResponse.json({ token, user: safeUser })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}