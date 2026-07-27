"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import NextTopLoader from "nextjs-toploader";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <NextTopLoader color="#02AAA4" crawlSpeed={300} showSpinner={false} shadow="none" />
      <Toaster position="top-center" reverseOrder={false} />
      {children}
    </SessionProvider>
  );
}
