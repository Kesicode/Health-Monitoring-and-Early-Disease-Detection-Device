"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Dog, Cpu, Bell, BarChart2,
  Settings, Activity, LogOut, ChevronLeft, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { clearTokens } from "@/lib/auth";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const farmerNav: NavItem[] = [
  { label: "Dashboard",  href: "/dashboard",           icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: "Animals",    href: "/dashboard/animals",   icon: <Dog className="h-5 w-5" /> },
  { label: "Devices",    href: "/dashboard/devices",   icon: <Cpu className="h-5 w-5" /> },
  { label: "Explore",    href: "/dashboard/explore",   icon: <BarChart2 className="h-5 w-5" /> },
  { label: "Alerts",     href: "/dashboard/alerts",    icon: <Bell className="h-5 w-5" /> },
];

const adminNav: NavItem[] = [
  { label: "Dashboard",    href: "/admin/dashboard",    icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: "Users",        href: "/admin/users",        icon: <Users className="h-5 w-5" /> },
  { label: "Animals",      href: "/admin/animals",      icon: <Dog className="h-5 w-5" /> },
  { label: "Devices",      href: "/admin/devices",      icon: <Cpu className="h-5 w-5" /> },
  { label: "Alerts",       href: "/admin/alerts",       icon: <Bell className="h-5 w-5" /> },
  { label: "Health Data",  href: "/admin/health-data",  icon: <BarChart2 className="h-5 w-5" /> },
  { label: "Settings",     href: "/admin/settings",     icon: <Settings className="h-5 w-5" /> },
];

interface SidebarProps {
  role: "admin" | "farmer";
  userName?: string;
  alertCount?: number;
}

export function Sidebar({ role, userName, alertCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const nav = role === "admin" ? adminNav : farmerNav;

  return (
    <aside
      className={cn(
        "relative flex h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300",
        collapsed ? "w-16" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center gap-3 border-b border-gray-100 px-4 py-4", collapsed && "justify-center")}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-600 text-white font-bold text-sm">AG</div>
        {!collapsed && <span className="font-semibold text-gray-800 truncate">Agri Guard</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4">
        {nav.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "relative flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-green-50 text-green-700 before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:rounded-r before:bg-green-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && item.label === "Alerts" && alertCount > 0 && (
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {alertCount > 99 ? "99+" : alertCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      {!collapsed && userName && (
        <div className="border-t border-gray-100 px-4 py-3">
          <p className="truncate text-xs font-medium text-gray-700">{userName}</p>
          <p className="text-[11px] capitalize text-gray-400">{role}</p>
        </div>
      )}
      <button
        onClick={() => { clearTokens(); window.location.href = "/login"; }}
        title="Logout"
        className={cn("flex items-center gap-3 border-t border-gray-100 px-4 py-3 text-sm text-gray-500 hover:bg-red-50 hover:text-red-600", collapsed && "justify-center")}
      >
        <LogOut className="h-4 w-4 shrink-0" />
        {!collapsed && "Logout"}
      </button>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="absolute -right-3 top-12 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </aside>
  );
}
