"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { UserPlus, Users, ArrowRight, Clock, CreditCard, CheckCircle2, Calendar, Award, BookOpen, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/toast";
import { studentApi, Student, ApiError, AssignedCourse, Grade } from "@/lib/api";
import { getToken, getUser } from "@/lib/auth-storage";
import { getCourseLabel, GRADE_OPTIONS } from "@/lib/validation";

export default function DashboardPage() {
  const { toast } = useToast();

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string>("");

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [scoreValue, setScoreValue] = useState("");
  const [courseValue, setCourseValue] = useState("");
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  const fetchData = async () => {
    const token = getToken();
    if (!token) return;

    const user = getUser();
    let userRole = "";
    if (user) {
      userRole = user.role || "";
      setRole(userRole);
    }

    setLoading(true);
    try {
      if (userRole === "ADMISSION_TEAM") {
        const data = await studentApi.applications();
        setStudents(data);
      } else {
        const data = await studentApi.get();
        setStudents(data);
      }
    } catch (err) {
      // Silent error handling
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusLabel = (status: Student["status"]) => {
    switch (status) {
      case "APPLICATION_CREATED":
        return "Created";
      case "REGISTRATION_FEE_PAID":
        return "Fee Paid";
      case "SLOT_BOOKED":
        return "Slot Booked";
      case "EXAM_COMPLETED":
        return "Exam Done";
      case "ADMISSION_COMPLETED":
        return "Enrolled";
      default:
        return status;
    }
  };

  const getStatusColor = (status: Student["status"]) => {
    switch (status) {
      case "APPLICATION_CREATED":
        return "bg-slate-100 text-slate-600";
      case "REGISTRATION_FEE_PAID":
        return "bg-blue-50 text-blue-700";
      case "SLOT_BOOKED":
        return "bg-amber-50 text-amber-700";
      case "EXAM_COMPLETED":
        return "bg-purple-50 text-purple-700";
      case "ADMISSION_COMPLETED":
        return "bg-emerald-50 text-emerald-700";
      default:
        return "bg-slate-50 text-slate-500";
    }
  };

  const getNextAction = (student: Student) => {
    switch (student.status) {
      case "APPLICATION_CREATED":
        return { text: "Waiting for Registration Fee", interactive: false };
      case "REGISTRATION_FEE_PAID":
        return { text: "Waiting for Exam Slot Booking", interactive: false };
      case "SLOT_BOOKED":
        return { text: "Update Exam Score", interactive: true, action: "score" };
      case "EXAM_COMPLETED":
        return { text: "Assign Course", interactive: true, action: "course" };
      case "ADMISSION_COMPLETED":
        return { text: "Completed", interactive: false };
      default:
        return { text: "None", interactive: false };
    }
  };

  const handleActionClick = (student: Student, action: string) => {
    setSelectedStudent(student);
    setModalError("");
    if (action === "score") {
      setScoreValue(student.examScore !== null ? String(student.examScore) : "");
      setIsScoreModalOpen(true);
    } else if (action === "course") {
      setCourseValue(student.assignedCourse || student.applyingGrade || "");
      setIsCourseModalOpen(true);
    }
  };

  const handleScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setModalError("");

    const scoreNum = Number(scoreValue);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100 || !Number.isInteger(scoreNum)) {
      setModalError("Exam score must be an integer between 0 and 100");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = getToken();
      if (!token) throw new Error("No session");

      await studentApi.updateExamScore(selectedStudent.id, scoreNum);
      toast({
        title: "Score Updated",
        description: `Successfully updated exam score for ${selectedStudent.studentName}.`,
        variant: "success",
      });
      setIsScoreModalOpen(false);
      fetchData();
    } catch (err) {
      const apiErr = err as ApiError;
      if (Array.isArray(apiErr.message)) {
        setModalError(apiErr.message[0]);
      } else if (apiErr.message) {
        setModalError(apiErr.message);
      } else {
        setModalError("Failed to update score.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setModalError("");

    if (!courseValue) {
      setModalError("Please select a grade to assign.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = getToken();
      if (!token) throw new Error("No session");

      await studentApi.assignCourse(selectedStudent.id, courseValue as Grade);
      toast({
        title: "Course Assigned",
        description: `Successfully enrolled ${selectedStudent.studentName} in ${getCourseLabel(courseValue)}.`,
        variant: "success",
      });
      setIsCourseModalOpen(false);
      fetchData();
    } catch (err) {
      const apiErr = err as ApiError;
      if (Array.isArray(apiErr.message)) {
        setModalError(apiErr.message[0]);
      } else if (apiErr.message) {
        setModalError(apiErr.message);
      } else {
        setModalError("Failed to assign course.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-slate-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  // Parent Dashboard
  if (role !== "ADMISSION_TEAM") {
    const recentStudents = [...students]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    const pendingPayments = students.filter((s) => s.paymentStatus === "PENDING").length;
    const completedAdmissions = students.filter((s) => s.status === "ADMISSION_COMPLETED").length;

    return (
      <div className="space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-3 p-4 bg-white border border-slate-200/80 rounded-lg">
            <div className="p-2 rounded-md bg-blue-50 text-blue-600 shrink-0">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider leading-none">Students</p>
              <p className="text-lg font-semibold text-slate-900 mt-1 leading-none">{students.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-white border border-slate-200/80 rounded-lg">
            <div className="p-2 rounded-md bg-amber-50 text-amber-600 shrink-0">
              <CreditCard className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider leading-none">Pending Fees</p>
              <p className="text-lg font-semibold text-slate-900 mt-1 leading-none">{pendingPayments}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-white border border-slate-200/80 rounded-lg">
            <div className="p-2 rounded-md bg-emerald-50 text-emerald-600 shrink-0">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider leading-none">Enrolled</p>
              <p className="text-lg font-semibold text-slate-900 mt-1 leading-none">{completedAdmissions}</p>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
              <div>
                <h3 className="text-[13px] font-semibold text-slate-900">Recent Applications</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Latest registered student profiles</p>
              </div>
              {students.length > 0 && (
                <Link href="/dashboard/students" className="text-[12px] font-medium text-slate-400 hover:text-slate-700 transition-colors">
                  View all
                </Link>
              )}
            </div>

            {recentStudents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <Clock className="h-6 w-6 text-slate-300 mb-2.5" />
                <p className="text-[13px] font-medium text-slate-900">No applications yet</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-[240px]">
                  Register a student to begin the admission process.
                </p>
                <Link href="/dashboard/students/create" className="mt-3">
                  <Button size="sm" className="h-8 text-[12px] font-medium bg-slate-900 text-white hover:bg-slate-800">
                    Register Student
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentStudents.map((student) => (
                  <Link
                    key={student.id}
                    href={`/dashboard/students/${student.id}`}
                    className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/60 transition-colors group"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-slate-900 truncate">
                        {student.studentName}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-slate-400">Grade {student.applyingGrade}</span>
                        <span className="text-slate-200">·</span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(student.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${getStatusColor(student.status)}`}>
                        {getStatusLabel(student.status)}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-slate-200/80 rounded-lg overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100">
              <h3 className="text-[13px] font-semibold text-slate-900">Quick Actions</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Common tasks and shortcuts</p>
            </div>
            <div className="p-4 space-y-2">
              <Link href="/dashboard/students/create" className="block">
                <Button className="w-full justify-start gap-2.5 h-9 bg-slate-900 text-white hover:bg-slate-800 text-[12px] font-medium">
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Register a Student</span>
                </Button>
              </Link>
              <Link href="/dashboard/students" className="block">
                <Button variant="outline" className="w-full justify-start gap-2.5 h-9 border-slate-200 hover:bg-slate-50 text-slate-600 text-[12px] font-medium">
                  <Users className="h-3.5 w-3.5" />
                  <span>View All Students</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admission Team Dashboard
  const pendingCount = students.filter((s) => s.status === "APPLICATION_CREATED").length;
  const paidCount = students.filter((s) => s.status === "REGISTRATION_FEE_PAID").length;
  const scheduledCount = students.filter((s) => s.status === "SLOT_BOOKED").length;
  const completedCount = students.filter((s) => s.status === "ADMISSION_COMPLETED").length;

  const recentApps = [...students]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  return (
    <div className="space-y-5">
      {/* Counters Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="flex items-center gap-3.5 p-4 bg-white border border-slate-200/80 rounded-lg">
          <div className="p-2 rounded-md bg-slate-50 text-slate-500 shrink-0">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider leading-none">Pending Apps</p>
            <p className="text-lg font-bold text-slate-950 mt-1 leading-none">{pendingCount}</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-4 bg-white border border-slate-200/80 rounded-lg">
          <div className="p-2 rounded-md bg-blue-50 text-blue-600 shrink-0">
            <CreditCard className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider leading-none">Fee Paid</p>
            <p className="text-lg font-bold text-slate-950 mt-1 leading-none">{paidCount}</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-4 bg-white border border-slate-200/80 rounded-lg">
          <div className="p-2 rounded-md bg-amber-50 text-amber-600 shrink-0">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider leading-none">Exam Scheduled</p>
            <p className="text-lg font-bold text-slate-950 mt-1 leading-none">{scheduledCount}</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-4 bg-white border border-slate-200/80 rounded-lg">
          <div className="p-2 rounded-md bg-emerald-50 text-emerald-600 shrink-0">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider leading-none">Admissions Done</p>
            <p className="text-lg font-bold text-slate-950 mt-1 leading-none">{completedCount}</p>
          </div>
        </div>
      </div>

      {/* Operational List */}
      <div className="bg-white border border-slate-200/80 rounded-lg overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-[13px] font-semibold text-slate-900">Recent Applications</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Real-time application intake and operations queue</p>
          </div>
          <Link href="/dashboard/students" className="text-[12px] font-medium text-slate-400 hover:text-slate-700 transition-colors">
            View all applications
          </Link>
        </div>

        {recentApps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
            <AlertCircle className="h-6 w-6 text-slate-300 mb-2.5" />
            <p className="text-[13px] font-medium text-slate-900">No applications registered</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/60 select-none">
                  <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Student</th>
                  <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Parent</th>
                  <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Current Status</th>
                  <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Next Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentApps.map((student) => {
                  const nextAct = getNextAction(student);
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-4 py-3 text-[13px] font-medium text-slate-900">
                        {student.studentName}
                        <span className="block sm:hidden text-[10px] text-slate-400 mt-0.5">
                          Parent: {student.parentName || "Parent"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-slate-600 hidden sm:table-cell">
                        {student.parentName || "Parent"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${getStatusColor(student.status)}`}>
                          {getStatusLabel(student.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {nextAct.interactive ? (
                          <button
                            onClick={() => handleActionClick(student, nextAct.action!)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <span>{nextAct.text}</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">{nextAct.text}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Score Modal */}
      {isScoreModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px]" onClick={() => !isSubmitting && setIsScoreModalOpen(false)} />
          <div className="relative bg-white rounded-lg border border-slate-200 shadow-lg max-w-sm w-full p-5 z-10 animate-in zoom-in-95 duration-150">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-[15px] font-semibold text-slate-900">Update Exam Score</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Assign entrance score for {selectedStudent.studentName}.</p>
                </div>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsScoreModalOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 space-y-2 text-[12px] select-none">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student Name</span>
                  <span className="font-medium text-slate-900">{selectedStudent.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Parent Name</span>
                  <span className="font-medium text-slate-900">{selectedStudent.parentName || "Parent"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Exam Date</span>
                  <span className="font-medium text-slate-900">
                    {selectedStudent.examSlot ? new Date((selectedStudent.examSlot as any).date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "Not Scheduled"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Exam Time</span>
                  <span className="font-medium text-slate-900">
                    {selectedStudent.examSlot ? `${(selectedStudent.examSlot as any).startTime} - ${(selectedStudent.examSlot as any).endTime}` : "Not Scheduled"}
                  </span>
                </div>
              </div>

              <form onSubmit={handleScoreSubmit} className="space-y-3" noValidate>
                {modalError && (
                  <Alert variant="error" className="rounded-lg">
                    <AlertDescription className="text-[11px]">{modalError}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="examScore">Exam Score (0 - 100)</Label>
                  <Input
                    id="examScore"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="e.g. 85"
                    value={scoreValue}
                    onChange={(e) => setScoreValue(e.target.value)}
                    disabled={isSubmitting}
                    startIcon={<Award className="h-4 w-4" />}
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    onClick={() => setIsScoreModalOpen(false)}
                    className="h-9 text-[12px] font-medium text-slate-600"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                    className="h-9 text-[12px] font-medium bg-slate-900 hover:bg-slate-800 text-white"
                  >
                    Update Score
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Course Modal */}
      {isCourseModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px]" onClick={() => !isSubmitting && setIsCourseModalOpen(false)} />
          <div className="relative bg-white rounded-lg border border-slate-200 shadow-lg max-w-sm w-full p-5 z-10 animate-in zoom-in-95 duration-150">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-[15px] font-semibold text-slate-900">Assign Final Grade</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Review and finalize the student's admitted grade.</p>
                </div>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsCourseModalOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 space-y-2 text-[12px] select-none">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student Name</span>
                  <span className="font-medium text-slate-900">{selectedStudent.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Parent Name</span>
                  <span className="font-medium text-slate-900">{selectedStudent.parentName || "Parent"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Applied Grade</span>
                  <span className="font-medium text-slate-900">{getCourseLabel(selectedStudent.applyingGrade)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Exam Score</span>
                  <span className="font-semibold text-slate-900">
                    {selectedStudent.examScore !== null ? `${selectedStudent.examScore} / 100` : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Status</span>
                  <span className="font-medium text-slate-900">Exam Completed</span>
                </div>
              </div>

              <form onSubmit={handleCourseSubmit} className="space-y-3" noValidate>
                {modalError && (
                  <Alert variant="error" className="rounded-lg">
                    <AlertDescription className="text-[11px]">{modalError}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="assignedCourse">Assign Final Grade</Label>
                  <select
                    id="assignedCourse"
                    value={courseValue}
                    onChange={(e) => setCourseValue(e.target.value)}
                    disabled={isSubmitting}
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="">Select Grade Level...</option>
                    {GRADE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400 leading-normal mt-1.5 select-none">
                    The parent's requested grade has been selected by default. You may assign a different grade based on the student's entrance examination result.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    onClick={() => setIsCourseModalOpen(false)}
                    className="h-9 text-[12px] font-medium text-slate-600"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                    className="h-9 text-[12px] font-medium bg-slate-900 hover:bg-slate-800 text-white"
                  >
                    Assign Final Grade
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
