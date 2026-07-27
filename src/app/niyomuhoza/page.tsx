import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SystemUsersConsole from "@/components/Admin/SystemUsersConsole";

export const metadata: Metadata = {
  title: "System Console",
  robots: { index: false, follow: false },
};

export default async function NiyomuhozaPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/signin?callbackUrl=/niyomuhoza");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return <SystemUsersConsole />;
}
