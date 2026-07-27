"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import NextTopLoader from "nextjs-toploader";
import IdleLogout from "@/components/Auth/IdleLogout";

export default function DashboardProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <IdleLogout />
      <NextTopLoader color="#02AAA4" crawlSpeed={300} showSpinner={false} shadow="none" />
      <Toaster position="top-center" reverseOrder={false} />
      {children}
    </SessionProvider>
  );
}
