import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { resumeSchema } from "@/lib/resumeSchema";
import { ObjectId } from "mongodb";

type ResumeDoc = {
  _id: ObjectId;
  userId: string;
  title?: string;
  data?: unknown;
  createdAt?: Date;
  updatedAt?: Date;
};

function normalizeTitle(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, 120);
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const resumeId = searchParams.get("id");
  const db = await getDb();

  if (resumeId) {
    if (!ObjectId.isValid(resumeId)) {
      return NextResponse.json({ error: "Invalid resume id." }, { status: 400 });
    }

    const doc = await db.collection<ResumeDoc>("resumes").findOne({
      _id: new ObjectId(resumeId),
      userId: session.user.id,
    });

    if (!doc?.data) {
      return NextResponse.json({ error: "Resume not found." }, { status: 404 });
    }

    const parsed = resumeSchema.safeParse(doc.data);
    if (!parsed.success) {
      return NextResponse.json({ error: "Resume payload is invalid." }, { status: 400 });
    }

    return NextResponse.json({
      id: String(doc._id),
      title: normalizeTitle(doc.title) || "Untitled Resume",
      data: parsed.data,
      createdAt: doc.createdAt ?? null,
      updatedAt: doc.updatedAt ?? null,
    });
  }

  const docs = await db
    .collection<ResumeDoc>("resumes")
    .find({ userId: session.user.id })
    .sort({ updatedAt: -1, createdAt: -1 })
    .toArray();

  const resumes = docs.map((doc, index) => ({
    id: String(doc._id),
    title: normalizeTitle(doc.title) || `Resume ${index + 1}`,
    createdAt: doc.createdAt ?? null,
    updatedAt: doc.updatedAt ?? null,
  }));

  return NextResponse.json({ resumes });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const title = normalizeTitle(body?.title) || "Untitled Resume";
    const data = resumeSchema.parse(body?.data);

    const db = await getDb();
    const now = new Date();
    const created = await db.collection("resumes").insertOne({
      userId: session.user.id,
      title,
      data,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ id: String(created.insertedId), title }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid resume payload." }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const resumeId = searchParams.get("id");
  if (!resumeId || !ObjectId.isValid(resumeId)) {
    return NextResponse.json({ error: "Invalid resume id." }, { status: 400 });
  }

  try {
    const body = await req.json();
    const updates: Record<string, unknown> = { updatedAt: new Date() };

    if (body?.title !== undefined) {
      const title = normalizeTitle(body.title);
      if (!title) return NextResponse.json({ error: "Invalid title." }, { status: 400 });
      updates.title = title;
    }

    if (body?.data !== undefined) {
      updates.data = resumeSchema.parse(body.data);
    }

    const db = await getDb();
    const result = await db.collection("resumes").updateOne(
      { _id: new ObjectId(resumeId), userId: session.user.id },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Resume not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid update payload." }, { status: 400 });
  }
}
