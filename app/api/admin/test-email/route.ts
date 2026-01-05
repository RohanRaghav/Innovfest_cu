import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import jwt from "jsonwebtoken"
import { smtpStatus, sendEmail } from "@/lib/email"
import { ObjectId } from "mongodb"

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

    const body = await req.json().catch(() => ({}))
    const to = body?.to || process.env.FROM_EMAIL
    if (!to) return NextResponse.json({ error: "No recipient configured" }, { status: 400 })

    const status = smtpStatus()

    if (!status.configured) {
      return NextResponse.json({ ok: false, message: "SMTP not configured", status })
    }

    const check = await checkSmtp()
    if (!check.verified) {
      return NextResponse.json({ ok: false, message: "SMTP connection failed", status, check })
    }

    try {
      const info = await sendEmail(to, "Test Email from Techfest CA", `<p>This is a test email from your application.</p><p>host=${status.host} user=${status.user}</p>`)
      return NextResponse.json({ ok: true, info })
    } catch (e: any) {
      console.error(e)
      return NextResponse.json({ ok: false, error: e.message || String(e), status, check })
    }
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}