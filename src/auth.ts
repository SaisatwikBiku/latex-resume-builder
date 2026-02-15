import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { compare } from "bcryptjs";
import { z } from "zod";
import { mongoClient } from "@/lib/mongodb";
import { getDb } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/security";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(mongoClient),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw, request) {
        const ip = getClientIp(request?.headers);
        const ipLimit = checkRateLimit(`login:ip:${ip}`, 20, 10 * 60 * 1000);
        if (!ipLimit.allowed) return null;

        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const normalizedEmail = email.toLowerCase();
        const emailLimit = checkRateLimit(`login:email:${normalizedEmail}`, 10, 10 * 60 * 1000);
        if (!emailLimit.allowed) return null;

        const db = await getDb();

        const user = await db.collection("users").findOne<{ _id: unknown; email: string; password?: string }>({
          email: normalizedEmail,
        });

        if (!user?.password) return null;

        const valid = await compare(password, user.password);
        if (!valid) return null;

        return {
          id: String(user._id),
          email: user.email,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.userId = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token?.userId) {
        session.user = {
          ...session.user,
          id: String(token.userId),
        };
      }
      return session;
    },
  },
});
