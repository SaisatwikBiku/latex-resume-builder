import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { resumeSchema } from "@/lib/resumeSchema";

function normalizeTitle(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, 120);
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ repoId: string; versionId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { repoId, versionId } = await context.params;
  if (!ObjectId.isValid(repoId) || !ObjectId.isValid(versionId)) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }

  const db = await getDb();
  const version = await db.collection("resume_versions").findOne({
    _id: new ObjectId(versionId),
    repositoryId: new ObjectId(repoId),
    userId: session.user.id,
  });

  if (!version?.data) {
    return NextResponse.json({ error: "Version not found." }, { status: 404 });
  }

  const parsed = resumeSchema.safeParse(version.data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Version payload is invalid." }, { status: 400 });
  }

  return NextResponse.json({
    id: String(version._id),
    title: normalizeTitle(version.title) || `Version ${version.versionNumber ?? 1}`,
    versionNumber: version.versionNumber ?? 1,
    data: parsed.data,
    createdAt: version.createdAt ?? null,
    updatedAt: version.updatedAt ?? null,
  });
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ repoId: string; versionId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { repoId, versionId } = await context.params;
  if (!ObjectId.isValid(repoId) || !ObjectId.isValid(versionId)) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }

  try {
    const body = await req.json();
    const updates: Record<string, unknown> = { updatedAt: new Date() };

    if (body?.title !== undefined) {
      const title = normalizeTitle(body.title);
      if (!title) {
        return NextResponse.json({ error: "Invalid version title." }, { status: 400 });
      }
      updates.title = title;
    }

    if (body?.data !== undefined) {
      updates.data = resumeSchema.parse(body.data);
    }

    const db = await getDb();
    const repoObjectId = new ObjectId(repoId);
    const versionObjectId = new ObjectId(versionId);

    const result = await db.collection("resume_versions").updateOne(
      {
        _id: versionObjectId,
        repositoryId: repoObjectId,
        userId: session.user.id,
      },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Version not found." }, { status: 404 });
    }

    await db.collection("resume_repositories").updateOne(
      { _id: repoObjectId, userId: session.user.id },
      { $set: { latestVersionId: versionObjectId, updatedAt: new Date() } }
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid version update payload." }, { status: 400 });
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ repoId: string; versionId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { repoId, versionId } = await context.params;
  if (!ObjectId.isValid(repoId) || !ObjectId.isValid(versionId)) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }

  const db = await getDb();
  const repoObjectId = new ObjectId(repoId);
  const versionObjectId = new ObjectId(versionId);

  const existing = await db.collection("resume_versions").findOne({
    _id: versionObjectId,
    repositoryId: repoObjectId,
    userId: session.user.id,
  });
  if (!existing) {
    return NextResponse.json({ error: "Version not found." }, { status: 404 });
  }

  await db.collection("resume_versions").deleteOne({
    _id: versionObjectId,
    repositoryId: repoObjectId,
    userId: session.user.id,
  });

  const latestRemaining = await db
    .collection("resume_versions")
    .find({ repositoryId: repoObjectId, userId: session.user.id })
    .sort({ versionNumber: -1, updatedAt: -1 })
    .limit(1)
    .toArray();

  await db.collection("resume_repositories").updateOne(
    { _id: repoObjectId, userId: session.user.id },
    {
      $set: {
        latestVersionId: latestRemaining[0]?._id ?? null,
        updatedAt: new Date(),
      },
    }
  );

  return NextResponse.json({ ok: true });
}
