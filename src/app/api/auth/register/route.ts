import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/security";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(100).optional(),
});

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req.headers);
    const ipLimit = checkRateLimit(`register:ip:${ip}`, 10, 10 * 60 * 1000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Try again later." },
        { status: 429, headers: { "Retry-After": String(ipLimit.retryAfterSeconds) } }
      );
    }

    const json = await req.json();
    const parsed = registerSchema.parse(json);

    const email = parsed.email.toLowerCase().trim();
    const emailLimit = checkRateLimit(`register:email:${email}`, 5, 10 * 60 * 1000);
    if (!emailLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Try again later." },
        { status: 429, headers: { "Retry-After": String(emailLimit.retryAfterSeconds) } }
      );
    }

    const passwordHash = await hash(parsed.password, 12);

    const db = await getDb();
    const users = db.collection("users");

    const exists = await users.findOne({ email });
    if (exists) {
      return NextResponse.json({ error: "Unable to create account." }, { status: 400 });
    }

    await users.insertOne({
      email,
      name: parsed.name?.trim() || "",
      password: passwordHash,
      emailVerified: null,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid registration input." }, { status: 400 });
    }
    return NextResponse.json({ error: "Unable to create account." }, { status: 400 });
  }
}
