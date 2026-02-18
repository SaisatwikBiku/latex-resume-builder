import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { resumeSchema } from "@/lib/resumeSchema";

function normalizeName(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, 120);
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const repositories = await db
    .collection("resume_repositories")
    .find({ userId: session.user.id })
    .sort({ updatedAt: -1, createdAt: -1 })
    .toArray();

  return NextResponse.json({
    repositories: repositories.map((repo, index) => ({
      id: String(repo._id),
      name: normalizeName(repo.name) || `Repository ${index + 1}`,
      createdAt: repo.createdAt ?? null,
      updatedAt: repo.updatedAt ?? null,
      latestVersionId: repo.latestVersionId ? String(repo.latestVersionId) : null,
    })),
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const name = normalizeName(body?.name) || "New Resume Repository";
    const initialData = resumeSchema.parse(body?.initialData);

    const db = await getDb();
    const now = new Date();

    const repositoryInsert = await db.collection("resume_repositories").insertOne({
      userId: session.user.id,
      name,
      createdAt: now,
      updatedAt: now,
      latestVersionId: null,
    });

    const repositoryId = repositoryInsert.insertedId;
    const versionInsert = await db.collection("resume_versions").insertOne({
      userId: session.user.id,
      repositoryId,
      title: "Version 1",
      versionNumber: 1,
      data: initialData,
      createdAt: now,
      updatedAt: now,
    });

    await db.collection("resume_repositories").updateOne(
      { _id: repositoryId, userId: session.user.id },
      {
        $set: {
          latestVersionId: versionInsert.insertedId,
          updatedAt: now,
        },
      }
    );

    return NextResponse.json(
      {
        repository: {
          id: String(repositoryId),
          name,
          latestVersionId: String(versionInsert.insertedId),
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Invalid repository payload." }, { status: 400 });
  }
}
