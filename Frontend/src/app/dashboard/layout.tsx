"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, LogOut, Menu, X, GraduationCap, ChevronRight, Calendar, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { api, User as UserType } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname(); 
  const { toast } = useToast();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUserJson = localStorage.getItem("user");

    if (!token || !savedUserJson) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUserJson) as UserType;
      setUser(parsedUser);

      api.getProfile(token)
        .then((fetchedUser) => {
          const merged = { ...parsedUser, ...fetchedUser };
          setUser(merged);
          localStorage.setItem("user", JSON.stringify(merged));
        })
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/login");
        });
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast({
      title: "Signed Out Successfully",
      description: "You have been logged out of your session.",
      variant: "default",
    });
    router.push("/login");
  };

  const getBreadcrumbs = (): { label: string; href?: string }[] => {
    const crumbs: { label: string; href?: string }[] = [];

    if (pathname === "/dashboard") {
      crumbs.push({ label: user?.role === "ADMISSION_TEAM" ? "Dashboard" : "Overview" });
    } else if (pathname === "/dashboard/students") {
      crumbs.push({ label: user?.role === "ADMISSION_TEAM" ? "Student Applications" : "Students" });
    } else if (pathname === "/dashboard/students/create") {
      crumbs.push({ label: user?.role === "ADMISSION_TEAM" ? "Student Applications" : "Students", href: "/dashboard/students" });
      crumbs.push({ label: "Register" });
    } else if (pathname.match(/^\/dashboard\/students\/[a-zA-Z0-9_-]+\/edit$/)) {
      crumbs.push({ label: user?.role === "ADMISSION_TEAM" ? "Student Applications" : "Students", href: "/dashboard/students" });
      crumbs.push({ label: "Edit" });
    } else if (pathname.match(/^\/dashboard\/students\/[a-zA-Z0-9_-]+$/)) {
      crumbs.push({ label: user?.role === "ADMISSION_TEAM" ? "Student Applications" : "Students", href: "/dashboard/students" });
      crumbs.push({ label: "Details" });
    } else if (pathname === "/dashboard/exam-slots") {
      crumbs.push({ label: "Exam Slots" });
    } else if (pathname === "/dashboard/completed-admissions") {
      crumbs.push({ label: "Completed Admissions" });
    } else {
      crumbs.push({ label: "Portal" });
    }

    return crumbs;
  };

  const navLinks = user?.role === "ADMISSION_TEAM"
    ? [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/dashboard/students", label: "Student Applications", icon: Users },
        { href: "/dashboard/exam-slots", label: "Exam Slots", icon: Calendar },
        { href: "/dashboard/completed-admissions", label: "Completed Admissions", icon: CheckCircle2 },
      ]
    : [
        { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
        { href: "/dashboard/students", label: "Students", icon: Users },
      ];

  if (loading || !user) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-2">
          <svg
            className="animate-spin h-5 w-5 text-slate-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-xs text-muted-foreground">Verifying session…</span>
        </div>
      </div>
    );
  }

  const breadcrumbs = getBreadcrumbs();

  const sidebarContent = (
    <>
      <div className="h-14 flex items-center gap-2 px-5 border-b border-slate-200/80 shrink-0">
        <div className="p-1 rounded bg-slate-900 text-white">
          <GraduationCap className="h-4 w-4" />
        </div>
        <span className="font-semibold text-[13px] text-slate-900 tracking-tight">AdmissionFlow</span>
      </div>

      <nav className="flex-grow px-3 py-3 space-y-0.5 overflow-y-auto">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive =
            link.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileNavOpen(false)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-colors",
                isActive
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-3 border-t border-slate-200/80 shrink-0">
        <div className="flex items-center gap-2.5 px-3 py-2 mb-2">
          <div className="h-7 w-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px] font-semibold uppercase shrink-0 select-none">
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-slate-900 truncate">{user.name}</p>
            <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors w-full"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Sign out</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-background font-sans overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-[240px] md:flex-col shrink-0 border-r border-slate-200/80 bg-white">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px]" onClick={() => setIsMobileNavOpen(false)} />
          <aside className="relative flex w-[240px] max-w-[80vw] flex-col bg-white border-r border-slate-200/80 animate-in slide-in-from-left duration-150">
            <div className="absolute right-3 top-3.5 z-10">
              <button
                onClick={() => setIsMobileNavOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-grow flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 flex items-center justify-between px-4 sm:px-6 border-b border-slate-200/80 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="md:hidden p-1.5 -ml-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            >
              <Menu className="h-4.5 w-4.5" />
            </button>

            <nav className="flex items-center text-[13px]">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <ChevronRight className="h-3 w-3 text-slate-300 mx-1.5" />}
                  {crumb.href ? (
                    <Link href={crumb.href} className="text-slate-400 hover:text-slate-700 transition-colors font-medium">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="font-semibold text-slate-900">{crumb.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2.5 md:hidden">
            <div className="h-7 w-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px] font-semibold uppercase shrink-0 select-none">
              {user.name.charAt(0)}
            </div>
          </div>
        </header>

        <main className="flex-grow overflow-y-auto">
          <div className="px-4 sm:px-6 py-5 sm:py-6 mx-auto max-w-[1120px] w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
