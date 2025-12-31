import { NextResponse } from "next/server"
import admin from "@/lib/firebaseAdmin"
import clientPromise from "@/lib/mongodb"

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const idToken = authHeader.split(" ")[1]

    const decoded = await admin.auth().verifyIdToken(idToken)
    const uid = decoded.uid

    const client = await clientPromise
    if (!client) return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    const db = client.db()
    const submissions = db.collection("submissions")

    const mine = await submissions.find({ uid }).sort({ createdAt: -1 }).toArray()
    return NextResponse.json({ submissions: mine })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}