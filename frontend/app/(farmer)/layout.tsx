import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { AlertBannerWrapper } from "@/components/layout/AlertBannerWrapper";

export default function FarmerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar role="farmer" />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar role="farmer" />
        <AlertBannerWrapper />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
