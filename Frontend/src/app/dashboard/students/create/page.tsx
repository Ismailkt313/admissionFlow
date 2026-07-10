"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Calendar, School, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/toast";
import { studentApi, ApiError, Gender, Grade } from "@/lib/api";
import { getToken } from "@/lib/auth-storage";
import { isValidStudentName, isValidDOB, isValidPreviousSchool, sanitizeString, isValidGrade, GRADE_OPTIONS } from "@/lib/validation";

export default function CreateStudentPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [form, setForm] = useState({
    studentName: "",
    dateOfBirth: "",
    gender: "" as Gender | "",
    previousSchool: "",
    applyingGrade: "",
  });

  const [touched, setTouched] = useState({
    studentName: false,
    dateOfBirth: false,
    gender: false,
    previousSchool: false,
    applyingGrade: false,
  });

  const [errors, setErrors] = useState({
    studentName: "",
    dateOfBirth: "",
    gender: "",
    previousSchool: "",
    applyingGrade: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const validateField = (name: string, value: string) => {
    switch (name) {
      case "studentName": {
        const trimmed = value.trim();
        if (!trimmed) {
          return "Student name is required.";
        }
        if (trimmed.length < 3) {
          return "Student name must be at least 3 characters long.";
        }
        if (trimmed.length > 60) {
          return "Student name cannot exceed 60 characters.";
        }
        if (!/^[a-zA-Z]+( [a-zA-Z]+)*$/.test(trimmed)) {
          return "Student name must contain only letters and single spaces, with no leading/trailing or consecutive spaces.";
        }
        return "";
      }
      case "dateOfBirth":
        if (!value) {
          return "Date of birth is required.";
        }
        if (!isValidDOB(value)) {
          return "Student age must be between 3 and 18 years.";
        }
        return "";
      case "gender":
        if (!value) {
          return "Gender is required.";
        }
        if (!["MALE", "FEMALE", "OTHER"].includes(value)) {
          return "Please select a valid gender option.";
        }
        return "";
      case "previousSchool": {
        const trimmedSchool = value.trim();
        if (!trimmedSchool) {
          return "Previous school is required.";
        }
        if (trimmedSchool.length < 3) {
          return "Previous school name must be at least 3 characters long.";
        }
        if (trimmedSchool.length > 100) {
          return "Previous school name cannot exceed 100 characters.";
        }
        if (/^[.\-\s]+$/.test(trimmedSchool)) {
          return "Previous school name cannot consist of only special characters.";
        }
        if (!/^[a-zA-Z0-9\s.\-]+$/.test(trimmedSchool)) {
          return "Previous school name must contain alphanumeric characters and only allowed special characters (spaces, hyphens, periods).";
        }
        return "";
      }
      case "applyingGrade":
        if (!value) {
          return "Applying grade is required.";
        }
        if (!isValidGrade(value)) {
          return "Please select a valid grade option.";
        }
        return "";
      default:
        return "";
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, form[field as keyof typeof form]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (touched[name as keyof typeof touched]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const isFormValid =
    isValidStudentName(form.studentName) &&
    form.dateOfBirth !== "" &&
    isValidDOB(form.dateOfBirth) &&
    form.gender !== "" &&
    isValidPreviousSchool(form.previousSchool) &&
    isValidGrade(form.applyingGrade) &&
    Object.values(errors).every((err) => !err);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    const newErrors = {
      studentName: validateField("studentName", form.studentName),
      dateOfBirth: validateField("dateOfBirth", form.dateOfBirth),
      gender: validateField("gender", form.gender),
      previousSchool: validateField("previousSchool", form.previousSchool),
      applyingGrade: validateField("applyingGrade", form.applyingGrade),
    };

    setErrors(newErrors);
    setTouched({
      studentName: true,
      dateOfBirth: true,
      gender: true,
      previousSchool: true,
      applyingGrade: true,
    });

    const hasErrors = Object.values(newErrors).some((err) => !!err);
    if (hasErrors) {
      return;
    }

    setIsSubmitting(true);

    try {
      const token = getToken();
      if (!token) throw new Error("No authorization token found.");

      await studentApi.create({
        studentName: sanitizeString(form.studentName),
        dateOfBirth: new Date(form.dateOfBirth).toISOString(),
        gender: form.gender as Gender,
        previousSchool: sanitizeString(form.previousSchool),
        applyingGrade: form.applyingGrade.trim(),
      });

      toast({
        title: "Student Registered",
        description: `${form.studentName} has been successfully registered.`,
        variant: "success",
      });

      router.push("/dashboard/students");
    } catch (err) {
      const error = err as ApiError;
      if (Array.isArray(error.message)) {
        setServerError(error.message[0]);
      } else if (error.message) {
        setServerError(error.message);
      } else {
        setServerError("Failed to register student record. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => router.push("/dashboard/students")}
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="text-[15px] font-semibold text-slate-900">Register Student</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Add a new student application under your account.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white border border-slate-200/80 rounded-lg overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100">
          <h3 className="text-[13px] font-semibold text-slate-900">Student Information</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">All fields are required.</p>
        </div>

        <div className="p-5">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {serverError && (
              <Alert variant="error" className="rounded-lg">
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="studentName">Full Name <span className="text-red-500">*</span></Label>
              <Input
                id="studentName"
                name="studentName"
                value={form.studentName}
                onChange={handleChange}
                onBlur={() => handleBlur("studentName")}
                error={touched.studentName && !!errors.studentName}
                aria-invalid={touched.studentName && !!errors.studentName ? "true" : "false"}
                aria-describedby={touched.studentName && errors.studentName ? "studentName-error" : undefined}
                disabled={isSubmitting}
                placeholder="e.g. John Doe"
                startIcon={<User className="h-4 w-4" />}
                required
              />
              {touched.studentName && errors.studentName && (
                <p id="studentName-error" role="alert" className="text-[11px] font-medium text-error mt-1">{errors.studentName}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="dateOfBirth">Date of Birth <span className="text-red-500">*</span></Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  onBlur={() => handleBlur("dateOfBirth")}
                  error={touched.dateOfBirth && !!errors.dateOfBirth}
                  aria-invalid={touched.dateOfBirth && !!errors.dateOfBirth ? "true" : "false"}
                  aria-describedby={touched.dateOfBirth && errors.dateOfBirth ? "dateOfBirth-error" : undefined}
                  disabled={isSubmitting}
                  startIcon={<Calendar className="h-4 w-4" />}
                  required
                />
                {touched.dateOfBirth && errors.dateOfBirth && (
                  <p id="dateOfBirth-error" role="alert" className="text-[11px] font-medium text-error mt-1">{errors.dateOfBirth}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="gender">Gender <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <select
                    id="gender"
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    onBlur={() => handleBlur("gender")}
                    disabled={isSubmitting}
                    aria-invalid={touched.gender && !!errors.gender ? "true" : "false"}
                    aria-describedby={touched.gender && errors.gender ? "gender-error" : undefined}
                    className={`flex h-11 w-full rounded-lg border bg-white px-3 py-2 text-sm text-foreground shadow-xs transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50 ${
                      touched.gender && errors.gender ? "border-error focus:ring-error/20 focus:border-error" : "border-slate-200"
                    }`}
                    required
                  >
                    <option value="" disabled>Select gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                {touched.gender && errors.gender && (
                  <p id="gender-error" role="alert" className="text-[11px] font-medium text-error mt-1">{errors.gender}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="previousSchool">Previous School <span className="text-red-500">*</span></Label>
                <Input
                  id="previousSchool"
                  name="previousSchool"
                  value={form.previousSchool}
                  onChange={handleChange}
                  onBlur={() => handleBlur("previousSchool")}
                  error={touched.previousSchool && !!errors.previousSchool}
                  aria-invalid={touched.previousSchool && !!errors.previousSchool ? "true" : "false"}
                  aria-describedby={touched.previousSchool && errors.previousSchool ? "previousSchool-error" : undefined}
                  disabled={isSubmitting}
                  placeholder="e.g. Greenvalley Elementary"
                  startIcon={<School className="h-4 w-4" />}
                  required
                />
                {touched.previousSchool && errors.previousSchool && (
                  <p id="previousSchool-error" role="alert" className="text-[11px] font-medium text-error mt-1">{errors.previousSchool}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="applyingGrade">Applying Grade <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <select
                    id="applyingGrade"
                    name="applyingGrade"
                    value={form.applyingGrade}
                    onChange={handleChange}
                    onBlur={() => handleBlur("applyingGrade")}
                    disabled={isSubmitting}
                    aria-invalid={touched.applyingGrade && !!errors.applyingGrade ? "true" : "false"}
                    aria-describedby={touched.applyingGrade && errors.applyingGrade ? "applyingGrade-error" : undefined}
                    className={`flex h-11 w-full rounded-lg border bg-white px-3 py-2 text-sm text-foreground shadow-xs transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50 ${
                      touched.applyingGrade && errors.applyingGrade ? "border-error focus:ring-error/20 focus:border-error" : "border-slate-200"
                    }`}
                    required
                  >
                    <option value="" disabled>Select grade</option>
                    {GRADE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                {touched.applyingGrade && errors.applyingGrade && (
                  <p id="applyingGrade-error" role="alert" className="text-[11px] font-medium text-error mt-1">{errors.applyingGrade}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/students")}
                disabled={isSubmitting}
                className="h-9 text-[12px] font-medium border-slate-200 hover:bg-slate-50 text-slate-600"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                disabled={!isFormValid || isSubmitting}
                className="h-9 text-[12px] font-medium bg-slate-900 hover:bg-slate-800 text-white"
              >
                Save Student
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
