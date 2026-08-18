"use client";

import { signOut } from "next-auth/react";

/**
 * Sign out without using NEXTAUTH_URL for the redirect.
 * NextAuth otherwise prepends NEXTAUTH_URL, which can still point at an old domain.
 */
export async function signOutOnThisSite(path = "/") {
  await signOut({ redirect: false });
  if (typeof window !== "undefined") {
    window.location.assign(path);
  }
}
