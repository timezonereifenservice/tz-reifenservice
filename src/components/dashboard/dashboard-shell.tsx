"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Wrench, X } from "lucide-react";
import { siteConfig } from "@/config/site";
import { DASHBOARD_PATH } from "@/lib/dashboard-constants";
import {
  dashboardLogoutItem,
  dashboardNavItems,
  getDashboardPageTitle,
  getUserDisplayName,
} from "@/lib/dashboard-nav";
import { cn } from "@/lib/utils";

type DashboardShellProps = {
  user: { email: string; name?: string };
  children: React.ReactNode;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);

  const pageTitle = getDashboardPageTitle(pathname);
  const displayName = user.name?.trim() || getUserDisplayName(user.email);
  const initials = getInitials(displayName);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  async function logout() {
    setLogoutPending(true);
    try {
      await fetch("/api/dashboard/logout", { method: "POST" });
      router.replace(DASHBOARD_PATH);
      router.refresh();
    } finally {
      setLogoutPending(false);
    }
  }

  const sidebarContent = (
    <>
      <div className="flex h-16 items-center border-b border-white/10 px-5">
        <Link href="/dashboard/overview" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-accent text-brand-dark">
            <Wrench className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">Time Zone</p>
            <p className="truncate text-[10px] text-white/50">Dashboard</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {dashboardNavItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                active
                  ? "bg-brand-accent text-brand-dark shadow-sm"
                  : "text-white/75 hover:bg-white/10 hover:text-white",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <button
          type="button"
          onClick={logout}
          disabled={logoutPending}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/75 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-60"
        >
          <dashboardLogoutItem.icon className="h-5 w-5 shrink-0" aria-hidden />
          <span>{logoutPending ? "Abmelden…" : dashboardLogoutItem.label}</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-dvh bg-[#f4f5f7]">
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Menü schließen"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(18rem,88vw)] flex-col bg-brand-dark transition-transform duration-300 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <button
          type="button"
          aria-label="Sidebar schließen"
          className="absolute right-3 top-4 rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <X className="h-5 w-5" aria-hidden />
        </button>
        {sidebarContent}
      </aside>

      <div className="flex min-h-dvh flex-col lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-brand-dark px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Menü öffnen"
              className="rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" aria-hidden />
            </button>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-accent/80">
                {siteConfig.name}
              </p>
              <h1 className="truncate text-lg font-extrabold text-white sm:text-xl">
                {pageTitle}
              </h1>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3 px-2 py-1.5 sm:gap-3 sm:px-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold leading-tight text-white">
                {displayName}
              </p>
              <p className="max-w-[180px] truncate text-xs text-white/60">
                {user.email}
              </p>
            </div>
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-accent text-sm font-extrabold text-brand-dark"
              aria-hidden
            >
              {initials}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
