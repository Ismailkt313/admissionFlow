"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon, Mail, Shield, GraduationCap, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { api, User } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUserJson = localStorage.getItem("user");

    if (!token || !savedUserJson) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUserJson) as User;
      setUser(parsedUser);

      api.getProfile(token)
        .then((fetchedUser) => {
          const mergedUser = { ...parsedUser, ...fetchedUser };
          setUser(mergedUser);
          localStorage.setItem("user", JSON.stringify(mergedUser));
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

  if (loading || !user) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-2">
          <svg
            className="animate-spin h-8 w-8 text-primary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-sm font-medium text-muted-foreground">Verifying session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background">
      <header className="border-b border-border bg-white px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="font-bold text-lg text-foreground tracking-tight">AdmissionFlow</span>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </Button>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md animate-in fade-in duration-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold tracking-tight">Account Profile</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Your school portal registration details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-border/50">
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                {(user.name || "User").charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="font-bold text-foreground">{user.name || "User"}</h4>
                <p className="text-xs text-muted-foreground">Welcome to AdmissionFlow</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 text-muted-foreground shrink-0">
                  <UserIcon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <span className="block text-xs font-medium text-muted-foreground leading-none">Full Name</span>
                  <span className="text-sm font-semibold text-foreground leading-normal">{user.name || "User"}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 text-muted-foreground shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <span className="block text-xs font-medium text-muted-foreground leading-none">Email Address</span>
                  <span className="text-sm font-semibold text-foreground leading-normal">{user.email || ""}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 text-muted-foreground shrink-0">
                  <Shield className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <span className="block text-xs font-medium text-muted-foreground leading-none">Portal Role</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold mt-1 bg-primary/10 text-primary uppercase">
                    {user.role || "PARENT"}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-primary/[0.02] border border-primary/10 flex items-start gap-3">
              <div className="flex-1 space-y-1">
                <h5 className="text-xs font-bold text-primary">Authorized Session</h5>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  You are signed in as a {(user.role || "PARENT").toLowerCase()}. You can access school admissions forms and processes.
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
