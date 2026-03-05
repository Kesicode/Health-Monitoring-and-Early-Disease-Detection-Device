import { cookies } from "next/headers";
import { decodeJwt } from "jose";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { AlertBannerWrapper } from "@/components/layout/AlertBannerWrapper";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("ag_access")?.value;
  let userName: string | undefined;
  if (token) {
    try { userName = (decodeJwt(token) as { full_name?: string }).full_name; } catch {}
  }
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar role="admin" userName={userName} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar role="admin" />
        <AlertBannerWrapper />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
