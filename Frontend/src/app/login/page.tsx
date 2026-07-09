"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, GraduationCap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/toast";
import { api, ApiError } from "@/lib/api";

import { sanitizeString } from "@/lib/validation";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [form, setForm] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUserJson = localStorage.getItem("user");
    if (token && savedUserJson) {
      router.replace("/dashboard");
      return;
    }

    const savedEmail = localStorage.getItem("remembered_email");
    if (savedEmail) {
      setForm((prev) => ({ ...prev, email: savedEmail, rememberMe: true }));
    }
    setCheckingSession(false);
  }, [router]);

  const validateField = (name: string, value: string) => {
    switch (name) {
      case "email": {
        const trimmedEmail = value.trim();
        if (!trimmedEmail) {
          return "Email is required.";
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
          return "Please provide a valid email address.";
        }
        return "";
      }
      case "password":
        if (!value) {
          return "Password is required.";
        }
        return "";
      default:
        return "";
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, form[field as keyof typeof form] as string);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (touched[name as keyof typeof touched]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setForm((prev) => ({ ...prev, rememberMe: checked }));
  };

  const isFormValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
    form.password.length > 0 &&
    Object.values(errors).every((err) => !err);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    const newErrors = {
      email: validateField("email", form.email),
      password: validateField("password", form.password),
    };

    setErrors(newErrors);
    setTouched({ email: true, password: true });

    const hasErrors = Object.values(newErrors).some((err) => !!err);
    if (hasErrors) {
      return;
    }

    setIsSubmitting(true);

    try {
      const sanitizedEmail = form.email.toLowerCase().trim();
      const data = await api.login(sanitizedEmail, form.password);

      if (form.rememberMe) {
        localStorage.setItem("remembered_email", sanitizedEmail);
      } else {
        localStorage.removeItem("remembered_email");
      }

      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast({
        title: "Successfully Authenticated",
        description: `Welcome back, ${data.user.name}.`,
        variant: "success",
      });

      router.push("/dashboard");
    } catch (err) {
      const error = err as ApiError;
      if (Array.isArray(error.message)) {
        setServerError(error.message[0]);
      } else if (error.message) {
        setServerError(error.message);
      } else {
        setServerError("Invalid email or password.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans" />
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 font-sans">
      <div className="hidden md:flex md:w-[42%] bg-slate-900 text-slate-100 flex-col justify-between p-10 lg:p-12 relative overflow-hidden border-r border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
        
        <div className="flex items-center gap-2.5 relative z-10">
          <div className="p-1 rounded-md bg-blue-500/10 text-blue-400">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">AdmissionFlow</span>
        </div>

        <div className="my-auto relative z-10 space-y-8">
          <div className="space-y-3">
            <span className="text-xs font-semibold tracking-wider text-blue-400 uppercase">
              School Admission Management
            </span>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
              Streamline your student registration workflow.
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Manage admissions, entrance exams and enrollment through one streamlined workflow.
            </p>
          </div>

          <div className="relative w-full h-44 border border-slate-800/80 rounded-lg bg-slate-950/30 p-4 flex items-center justify-center">
            <svg className="w-full h-full text-slate-800" viewBox="0 0 300 120" fill="none">
              <line x1="20" y1="20" x2="280" y2="20" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="20" y1="60" x2="280" y2="60" stroke="currentColor" strokeWidth="1" />
              <line x1="20" y1="100" x2="280" y2="100" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="60" y1="10" x2="60" y2="110" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="150" y1="10" x2="150" y2="110" stroke="currentColor" strokeWidth="1" />
              <line x1="240" y1="10" x2="240" y2="110" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
              
              <rect x="35" y="45" width="50" height="30" rx="4" fill="#0f172a" stroke="#3b82f6" strokeWidth="1.5" />
              <rect x="125" y="45" width="50" height="30" rx="4" fill="#0f172a" stroke="#3b82f6" strokeWidth="1.5" />
              <rect x="215" y="45" width="50" height="30" rx="4" fill="#0f172a" stroke="#3b82f6" strokeWidth="1.5" />

              <path d="M 85 60 L 125 60" stroke="#3b82f6" strokeWidth="1.5" />
              <path d="M 175 60 L 215 60" stroke="#3b82f6" strokeWidth="1.5" />
              
              <circle cx="85" cy="60" r="3" fill="#3b82f6" />
              <circle cx="175" cy="60" r="3" fill="#3b82f6" />
            </svg>
          </div>
        </div>

        <div className="text-xs text-slate-500 relative z-10">
          &copy; {new Date().getFullYear()} AdmissionFlow. All rights reserved.
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 md:p-16 lg:p-20">
        <div className="w-full max-w-[380px] space-y-6">
          <div className="flex flex-col space-y-2 md:hidden">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1 rounded-md bg-blue-500/10 text-blue-600">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="font-bold text-lg text-foreground tracking-tight">AdmissionFlow</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Sign in to your account</h2>
            <p className="text-sm text-muted-foreground">School Admission Management System</p>
          </div>

          <div className="hidden md:flex flex-col space-y-1.5">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Sign in to your account</h2>
            <p className="text-sm text-muted-foreground">Enter your credentials below to log in</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-lg p-5 sm:p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {serverError && (
                <Alert variant="error" className="rounded-lg">
                  <AlertDescription>{serverError}</AlertDescription>
                </Alert>
              )}

               <div className="space-y-1.5">
                <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@school.com"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur("email")}
                  error={touched.email && !!errors.email}
                  aria-invalid={touched.email && !!errors.email ? "true" : "false"}
                  aria-describedby={touched.email && errors.email ? "email-error" : undefined}
                  disabled={isSubmitting}
                  startIcon={<Mail className="h-4 w-4" />}
                  required
                />
                {touched.email && errors.email && (
                  <p id="email-error" role="alert" className="text-xs font-medium text-error leading-none mt-1 animate-in fade-in duration-150">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                  <span className="text-xs font-medium text-muted-foreground/60 cursor-not-allowed select-none">
                    Forgot Password?
                  </span>
                </div>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur("password")}
                  error={touched.password && !!errors.password}
                  aria-invalid={touched.password && !!errors.password ? "true" : "false"}
                  aria-describedby={touched.password && errors.password ? "password-error" : undefined}
                  disabled={isSubmitting}
                  startIcon={<Lock className="h-4 w-4" />}
                  endIcon={
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword(!showPassword)}
                      className="hover:text-foreground text-muted-foreground transition-colors p-0.5 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  required
                />
                {touched.password && errors.password && (
                  <p id="password-error" role="alert" className="text-xs font-medium text-error leading-none mt-1 animate-in fade-in duration-150">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <Checkbox
                  id="rememberMe"
                  checked={form.rememberMe}
                  onCheckedChange={handleCheckboxChange}
                  disabled={isSubmitting}
                />
                <Label
                  htmlFor="rememberMe"
                  className="text-xs font-medium text-muted-foreground cursor-pointer select-none"
                >
                  Remember me
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full mt-4"
                isLoading={isSubmitting}
                disabled={!isFormValid || isSubmitting}
              >
                Sign In
              </Button>

              <div className="text-center text-sm text-muted-foreground pt-3 border-t border-slate-100 mt-4">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="font-medium text-blue-600 hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/20 rounded-md"
                >
                  Create Account
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
