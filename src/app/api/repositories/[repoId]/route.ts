import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/auth";
import { getDb } from "@/lib/db";

function normalizeName(value: unknown) {
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
  const repo = await db.collection("resume_repositories").findOne({
    _id: new ObjectId(repoId),
    userId: session.user.id,
  });

  if (!repo) {
    return NextResponse.json({ error: "Repository not found." }, { status: 404 });
  }

  return NextResponse.json({
    repository: {
      id: String(repo._id),
      name: normalizeName(repo.name) || "Untitled Repository",
      latestVersionId: repo.latestVersionId ? String(repo.latestVersionId) : null,
      createdAt: repo.createdAt ?? null,
      updatedAt: repo.updatedAt ?? null,
    },
  });
}

export async function PUT(req: Request, context: { params: Promise<{ repoId: string }> }) {
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
    const name = normalizeName(body?.name);
    if (!name) {
      return NextResponse.json({ error: "Invalid repository name." }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection("resume_repositories").updateOne(
      { _id: new ObjectId(repoId), userId: session.user.id },
      {
        $set: {
          name,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Repository not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid repository payload." }, { status: 400 });
  }
}

export async function DELETE(_req: Request, context: { params: Promise<{ repoId: string }> }) {
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

  const repo = await db.collection("resume_repositories").findOne({
    _id: repoObjectId,
    userId: session.user.id,
  });
  if (!repo) {
    return NextResponse.json({ error: "Repository not found." }, { status: 404 });
  }

  await db.collection("resume_versions").deleteMany({
    repositoryId: repoObjectId,
    userId: session.user.id,
  });
  await db.collection("resume_repositories").deleteOne({
    _id: repoObjectId,
    userId: session.user.id,
  });

  return NextResponse.json({ ok: true });
}
