import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import { prismaClientInstance } from "@/lib/prismaDB";
import { logActivity } from "@/lib/activity-log";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prismaClientInstance),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email.trim().toLowerCase();
        const password = credentials.password;

        const user = await prismaClientInstance.user.findUnique({
          where: { email },
        });

        if (!user) {
          await logActivity({
            userName: email,
            action: "LOGIN_FAILED",
            module: "AUTH",
            description: "Failed login attempt - user not found",
          });
          return null;
        }

        if (user.status === "FROZEN") {
          await logActivity({
            userId: user.id,
            userName: user.name || user.email,
            userRole: user.role,
            action: "LOGIN_FAILED",
            module: "AUTH",
            description: "Login blocked - account frozen",
          });
          throw new Error("Account has been disabled. Contact administrator.");
        }

        const isValid = await compare(password, user.password);
        if (!isValid) {
          await logActivity({
            userId: user.id,
            userName: user.name || user.email,
            userRole: user.role,
            action: "LOGIN_FAILED",
            module: "AUTH",
            description: "Failed login attempt - invalid password",
          });
          return null;
        }

        await logActivity({
          userId: user.id,
          userName: user.name || user.email,
          userRole: user.role,
          action: "LOGIN",
          module: "AUTH",
          description: `${user.name || user.email} logged in successfully`,
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        } as const;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        if (user.name) token.name = user.name;
        if (user.email) token.email = user.email;
      }
      if (trigger === "update" && session?.user) {
        if (session.user.name !== undefined) token.name = session.user.name;
        if (session.user.email !== undefined) token.email = session.user.email;
      }
      // Re-fetch role from DB if missing (e.g. old sessions)
      if (token.sub && !token.role) {
        const dbUser = await prismaClientInstance.user.findUnique({
          where: { id: token.sub },
          select: { role: true, name: true, email: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          if (!token.name) token.name = dbUser.name;
          if (!token.email) token.email = dbUser.email;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string;
        session.user.name = (token.name as string | null) ?? session.user.name;
        session.user.email = (token.email as string | null) ?? session.user.email;
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
};
