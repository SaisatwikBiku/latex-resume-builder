import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { resumeSchema } from "@/lib/resumeSchema";

function normalizeTitle(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, 120);
}

export async function GET(_req: Request, context: { params: Promise<{ repoId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { repoId } = await context.params;
  if (!ObjectId.isValid(repoId)) {
    return NextResponse.json({ error: "Invalid repository id." }, { status: 400 });
  }

  const db = await getDb();
  const repoObjectId = new ObjectId(repoId);

  const repository = await db.collection("resume_repositories").findOne({
    _id: repoObjectId,
    userId: session.user.id,
  });
  if (!repository) {
    return NextResponse.json({ error: "Repository not found." }, { status: 404 });
  }

  const versions = await db
    .collection("resume_versions")
    .find({ userId: session.user.id, repositoryId: repoObjectId })
    .sort({ versionNumber: -1, updatedAt: -1 })
    .toArray();

  return NextResponse.json({
    versions: versions.map((version) => ({
      id: String(version._id),
      title: normalizeTitle(version.title) || `Version ${version.versionNumber ?? 1}`,
      versionNumber: version.versionNumber ?? 1,
      createdAt: version.createdAt ?? null,
      updatedAt: version.updatedAt ?? null,
    })),
  });
}

export async function POST(req: Request, context: { params: Promise<{ repoId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { repoId } = await context.params;
  if (!ObjectId.isValid(repoId)) {
    return NextResponse.json({ error: "Invalid repository id." }, { status: 400 });
  }

  try {
    const body = await req.json();
    const title = normalizeTitle(body?.title) || "New Version";
    const data = resumeSchema.parse(body?.data);

    const db = await getDb();
    const repoObjectId = new ObjectId(repoId);
    const repository = await db.collection("resume_repositories").findOne({
      _id: repoObjectId,
      userId: session.user.id,
    });
    if (!repository) {
      return NextResponse.json({ error: "Repository not found." }, { status: 404 });
    }

    const latest = await db
      .collection("resume_versions")
      .find({ userId: session.user.id, repositoryId: repoObjectId })
      .sort({ versionNumber: -1 })
      .limit(1)
      .toArray();

    const nextVersionNumber = (latest[0]?.versionNumber ?? 0) + 1;
    const now = new Date();
    const inserted = await db.collection("resume_versions").insertOne({
      userId: session.user.id,
      repositoryId: repoObjectId,
      title,
      versionNumber: nextVersionNumber,
      data,
      createdAt: now,
      updatedAt: now,
    });

    await db.collection("resume_repositories").updateOne(
      { _id: repoObjectId, userId: session.user.id },
      {
        $set: {
          latestVersionId: inserted.insertedId,
          updatedAt: now,
        },
      }
    );

    return NextResponse.json(
      {
        version: {
          id: String(inserted.insertedId),
          title,
          versionNumber: nextVersionNumber,
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Invalid version payload." }, { status: 400 });
  }
}
