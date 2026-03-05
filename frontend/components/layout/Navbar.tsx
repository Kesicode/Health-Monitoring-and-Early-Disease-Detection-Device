"use client";
import { Bell, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface NavbarProps {
  title?: string;
  alertCount?: number;
  role: "admin" | "farmer";
  onMenuClick?: () => void;
}

export function Navbar({ title, alertCount = 0, role, onMenuClick }: NavbarProps) {
  const alertsHref = role === "admin" ? "/admin/alerts" : "/dashboard/alerts";
  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button onClick={onMenuClick} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
        )}
        {title && <h2 className="text-sm font-semibold text-gray-500">{title}</h2>}
      </div>
      <div className="flex items-center gap-3">
        <Link href={alertsHref} className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100">
          <Bell className="h-5 w-5" />
          {alertCount > 0 && (
            <span className={cn("absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white")}>
              {alertCount > 9 ? "9+" : alertCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
