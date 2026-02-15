import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { resumeSchema } from "@/lib/resumeSchema";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const doc = await db.collection("resumes").findOne<{ data?: unknown }>({
    userId: session.user.id,
  });

  if (!doc?.data) {
    return NextResponse.json({ data: null });
  }

  const parsed = resumeSchema.safeParse(doc.data);
  if (!parsed.success) {
    return NextResponse.json({ data: null });
  }

  return NextResponse.json({ data: parsed.data });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = resumeSchema.parse(body);

    const db = await getDb();
    await db.collection("resumes").updateOne(
      { userId: session.user.id },
      {
        $set: {
          userId: session.user.id,
          data,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid resume payload." }, { status: 400 });
  }
}
