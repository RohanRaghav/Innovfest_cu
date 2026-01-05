import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string | Promise<string> } }
) {
  try {
    // params itself can be a Promise (Next.js async params). await it first.
    const realParams = (typeof params === "object" && typeof (params as any).then === "function") ? await params : params
    const id = typeof realParams.id === "string" ? realParams.id : await realParams.id

    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer "))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    const payload: any = jwt.verify(token, JWT_SECRET);
    const userId = payload?.userId;

    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    if (!body.action || !["APPROVE", "REJECT"].includes(body.action))
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    const client = await clientPromise;
    if (!client)
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });

    const db = client.db();
    const users = db.collection("users");
    const submissions = db.collection("submissions");

    const requester = await users.findOne({ _id: new ObjectId(userId) });
    if (!requester)
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const submission = await submissions.findOne({ _id: new ObjectId(id) });
    if (!submission)
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });

    // Permission check
    if (requester.role !== "ADMIN") {
      if (requester.role !== "ZONE_HEAD")
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      if (submission.zone !== requester.zone)
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = new Date();

    if (body.action === "APPROVE") {
      if (submission.status === "APPROVED") return NextResponse.json({ error: "Already approved" }, { status: 400 })
      const awarded = body.points !== undefined ? Number(body.points) : submission.points || 0;

      await submissions.updateOne(
        { _id: submission._id },
        { $set: { status: "APPROVED", updatedAt: now, awardedPoints: awarded, reviewerId: String(userId), reviewNote: body.note || null } }
      );

      await users.updateOne(
        { _id: new ObjectId(submission.userId) },
        { $inc: { points: awarded, tasksDone: 1 }, $set: { updatedAt: now } }
      );

      const evaluations = db.collection("evaluations");
      await evaluations.insertOne({
        userId: submission.userId,
        submissionId: submission._id,
        taskId: submission.taskId,
        awardedPoints: awarded,
        reviewer: String(userId),
        createdAt: now
      });

      // If there is an assignment for this task and user, mark it completed
      const assignments = db.collection("assignments");
      await assignments.updateOne(
        { taskId: submission.taskId, assigneeId: submission.userId, status: "PENDING" },
        { $set: { status: "COMPLETED", completedAt: now, awardedPoints: awarded } }
      );

      return NextResponse.json({ ok: true });
    } else {
      await submissions.updateOne(
        { _id: submission._id },
        { $set: { status: "REJECTED", updatedAt: now, reviewerId: String(userId), reviewNote: body.note || null } }
      );

      return NextResponse.json({ ok: true });
    }
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
