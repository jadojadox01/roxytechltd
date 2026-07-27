"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import IdleLogout from "@/components/Auth/IdleLogout";

export default function NiyomuhozaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <IdleLogout />
      <Toaster position="top-center" reverseOrder={false} />
      {children}
    </SessionProvider>
  );
}
