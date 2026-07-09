"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Eye, Edit2, AlertCircle, X, Award, BookOpen, Clock, Calendar, CheckCircle2, User, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/toast";
import { api, Student, ApiError, AssignedCourse, Grade } from "@/lib/api";
import { getCourseLabel, GRADE_OPTIONS } from "@/lib/validation";

export default function StudentListPage() {
  const { toast } = useToast();

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [role, setRole] = useState<string>("");

  // Detailed Modal Drawer
  const [viewStudent, setViewStudent] = useState<any | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Edit Modals
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [scoreValue, setScoreValue] = useState("");
  const [courseValue, setCourseValue] = useState("");
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const savedUserJson = localStorage.getItem("user");
    let userRole = "";
    if (savedUserJson) {
      const parsed = JSON.parse(savedUserJson);
      userRole = parsed.role || "";
      setRole(userRole);
    }

    setLoading(true);
    try {
      if (userRole === "ADMISSION_TEAM") {
        const data = await api.getApplications(token);
        setStudents(data);
      } else {
        const data = await api.getStudents(token);
        setStudents(data);
      }
    } catch (err) {
      // Silent error catch
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

  const getFeeBadge = (status: Student["paymentStatus"]) => {
    if (status === "PAID") {
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700">
          Paid
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700">
        Pending
      </span>
    );
  };

  const handleViewDetails = async (studentId: string) => {
    setViewLoading(true);
    setIsViewOpen(true);
    setModalError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No session");

      const data = await api.getStudentDetails(token, studentId);
      setViewStudent(data);
    } catch (err) {
      toast({
        title: "Load Failed",
        description: "Failed to fetch student profile details.",
        variant: "error",
      });
      setIsViewOpen(false);
    } finally {
      setViewLoading(false);
    }
  };

  const handleOpenScore = (student: Student) => {
    setSelectedStudent(student);
    setScoreValue(student.examScore !== null ? String(student.examScore) : "");
    setModalError("");
    setIsScoreModalOpen(true);
  };

  const handleOpenCourse = (student: Student) => {
    setSelectedStudent(student);
    setCourseValue(student.assignedCourse || student.applyingGrade || "");
    setModalError("");
    setIsCourseModalOpen(true);
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
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No session");

      await api.updateExamScore(token, selectedStudent.id, scoreNum);
      toast({
        title: "Score Updated",
        description: `Successfully updated exam score for ${selectedStudent.studentName}.`,
        variant: "success",
      });
      setIsScoreModalOpen(false);
      // Close view modal if open
      if (isViewOpen && viewStudent?.student?.id === selectedStudent.id) {
        handleViewDetails(selectedStudent.id);
      }
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
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No session");

      await api.assignCourse(token, selectedStudent.id, courseValue as Grade);
      toast({
        title: "Course Assigned",
        description: `Successfully enrolled ${selectedStudent.studentName} in ${getCourseLabel(courseValue)}.`,
        variant: "success",
      });
      setIsCourseModalOpen(false);
      // Close view modal if open
      if (isViewOpen && viewStudent?.student?.id === selectedStudent.id) {
        handleViewDetails(selectedStudent.id);
      }
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

  const filteredStudents = students.filter((s) =>
    s.studentName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTimelineSteps = (student: Student) => {
    const steps = [
      { label: "Application Submitted", done: true, current: false },
      {
        label: "Registration Fee",
        done: student.paymentStatus === "PAID",
        current: student.status === "APPLICATION_CREATED",
      },
      {
        label: "Exam Scheduling",
        done: ["SLOT_BOOKED", "EXAM_COMPLETED", "ADMISSION_COMPLETED"].includes(student.status),
        current: student.status === "REGISTRATION_FEE_PAID",
      },
      {
        label: "Entrance Evaluation",
        done: ["EXAM_COMPLETED", "ADMISSION_COMPLETED"].includes(student.status),
        current: student.status === "SLOT_BOOKED",
      },
      {
        label: "Final Enrollment",
        done: student.status === "ADMISSION_COMPLETED",
        current: student.status === "EXAM_COMPLETED",
      },
    ];
    return steps;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-9 bg-slate-100 rounded-md w-56 animate-pulse" />
          <div className="h-9 bg-slate-100 rounded-md w-32 animate-pulse" />
        </div>
        <div className="bg-white border border-slate-200/80 rounded-lg overflow-hidden">
          <div className="h-10 border-b border-slate-100 bg-slate-50/50" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 border-b border-slate-100 animate-pulse bg-slate-50/30" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="relative w-full sm:max-w-[260px]">
          <Input
            placeholder="Search students…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startIcon={<Search className="h-3.5 w-3.5" />}
            className="h-9 text-[13px]"
          />
        </div>
        {role !== "ADMISSION_TEAM" && (
          <Link href="/dashboard/students/create" className="w-full sm:w-auto shrink-0">
            <Button className="w-full sm:w-auto gap-2 h-9 text-[12px] font-medium bg-slate-900 text-white hover:bg-slate-800">
              <Plus className="h-3.5 w-3.5" />
              <span>Register Student</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Main Content Layout */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-lg flex flex-col items-center justify-center py-14 px-6 text-center">
          <AlertCircle className="h-6 w-6 text-slate-300 mb-2.5" />
          <p className="text-[13px] font-medium text-slate-900">
            {searchQuery ? "No matching profiles" : "No applications registered"}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 max-w-[280px]">
            {searchQuery
              ? "Try adjusting your search query."
              : role === "ADMISSION_TEAM"
              ? "Awaiting student applications from parents."
              : "Click register button above to configure your student."}
          </p>
        </div>
      ) : (
        <>
          {/* PARENT TABLE VIEW */}
          {role !== "ADMISSION_TEAM" && (
            <div className="bg-white border border-slate-200/80 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200/80 bg-slate-50/60 select-none">
                      <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Grade</th>
                      <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Fee</th>
                      <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Created</th>
                      <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-4 py-3 text-[13px] font-medium text-slate-900">{student.studentName}</td>
                        <td className="px-4 py-3 text-[12px] text-slate-600">Grade {student.applyingGrade}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${getStatusColor(student.status)}`}>
                            {getStatusLabel(student.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3">{getFeeBadge(student.paymentStatus)}</td>
                        <td className="px-4 py-3 text-[11px] text-slate-400">
                          {new Date(student.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link href={`/dashboard/students/${student.id}`}>
                              <Button variant="outline" size="sm" className="h-7 w-7 p-0 border-slate-200 text-slate-500 hover:text-slate-900">
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                            {student.paymentStatus !== "PAID" && (
                              <Link href={`/dashboard/students/${student.id}/edit`}>
                                <Button variant="outline" size="sm" className="h-7 w-7 p-0 border-slate-200 text-slate-500 hover:text-slate-900">
                                  <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ADMISSION TEAM TABLE VIEW */}
          {role === "ADMISSION_TEAM" && (
            <div className="bg-white border border-slate-200/80 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200/80 bg-slate-50/60 select-none">
                      <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Student</th>
                      <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Parent</th>
                      <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Applied Grade</th>
                      <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Assigned Course</th>
                      <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Exam Score</th>
                      <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-4 py-3 text-[13px] font-medium text-slate-900">{student.studentName}</td>
                        <td className="px-4 py-3 text-[12px] text-slate-600">{student.parentName || "Parent"}</td>
                        <td className="px-4 py-3 text-[12px] text-slate-600">Grade {student.applyingGrade}</td>
                        <td className="px-4 py-3 text-[12px] text-slate-600 font-medium">
                          {getCourseLabel(student.assignedCourse)}
                        </td>
                        <td className="px-4 py-3 text-[12px] text-slate-600">
                          {student.examScore !== null ? `${student.examScore}/100` : "-"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${getStatusColor(student.status)}`}>
                            {getStatusLabel(student.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              onClick={() => handleViewDetails(student.id)}
                              variant="outline"
                              size="sm"
                              className="h-7 text-[11px] font-medium border-slate-200 text-slate-600 hover:text-slate-900"
                            >
                              View
                            </Button>
                            {student.status === "SLOT_BOOKED" && (
                              <Button
                                onClick={() => handleOpenScore(student)}
                                variant="outline"
                                size="sm"
                                className="h-7 text-[11px] font-medium border-slate-200 text-blue-600 hover:text-blue-700"
                              >
                                Update Score
                              </Button>
                            )}
                            {student.status === "EXAM_COMPLETED" && (
                              <Button
                                onClick={() => handleOpenCourse(student)}
                                variant="outline"
                                size="sm"
                                className="h-7 text-[11px] font-medium border-slate-200 text-emerald-600 hover:text-emerald-700"
                              >
                                Assign Course
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Slide-over Application Details Modal */}
      {isViewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          <div className="fixed inset-0 bg-black/20 backdrop-blur-[1px]" onClick={() => !viewLoading && setIsViewOpen(false)} />
          <div className="relative bg-white border-l border-slate-200 shadow-2xl w-full max-w-md h-full flex flex-col z-10 animate-in slide-in-from-right duration-200">
            {viewLoading ? (
              <div className="flex-grow flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            ) : viewStudent && (
              <>
                {/* Header */}
                <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                  <div>
                    <h3 className="text-[14px] font-semibold text-slate-900">Application File</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">ID: {viewStudent.student.id.slice(-8).toUpperCase()}</p>
                  </div>
                  <button
                    onClick={() => setIsViewOpen(false)}
                    className="p-1 rounded text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Body Content */}
                <div className="flex-grow overflow-y-auto p-5 space-y-6">
                  {/* Student profile details */}
                  <div className="space-y-3">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Student Profile</h4>
                    <div className="bg-slate-50 border border-slate-150 rounded-lg p-3 space-y-2 text-[12px]">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Name</span>
                        <span className="font-medium text-slate-900">{viewStudent.student.studentName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Date of Birth</span>
                        <span className="font-medium text-slate-900">
                          {new Date(viewStudent.student.dateOfBirth).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Gender</span>
                        <span className="font-medium text-slate-900">{viewStudent.student.gender}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Applying Grade</span>
                        <span className="font-medium text-slate-900">Grade {viewStudent.student.applyingGrade}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Previous School</span>
                        <span className="font-medium text-slate-900 truncate max-w-[180px]">{viewStudent.student.previousSchool || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Parent profile details */}
                  <div className="space-y-3">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Parent / Guardian</h4>
                    <div className="bg-slate-50 border border-slate-150 rounded-lg p-3 space-y-2 text-[12px]">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Full Name</span>
                        <span className="font-medium text-slate-900">{viewStudent.parent.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Email Address</span>
                        <span className="font-medium text-slate-900">{viewStudent.parent.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Admission evaluation details */}
                  <div className="space-y-3">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Status & Evaluation</h4>
                    <div className="bg-slate-50 border border-slate-150 rounded-lg p-3 space-y-2 text-[12px]">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Application State</span>
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${getStatusColor(viewStudent.student.status)}`}>
                          {getStatusLabel(viewStudent.student.status)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Registration Fee</span>
                        <span>{getFeeBadge(viewStudent.student.paymentStatus)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Entrance Score</span>
                        <span className="font-semibold text-slate-900">
                          {viewStudent.student.examScore !== null ? `${viewStudent.student.examScore} / 100` : "Not Available"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Assigned Course</span>
                        <span className="font-semibold text-slate-900">{getCourseLabel(viewStudent.student.assignedCourse)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Timeline stepper */}
                  <div className="space-y-3">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Workflow Timeline</h4>
                    <div className="relative pl-5 space-y-4 text-[12px] border-l border-slate-200 ml-1.5 pt-1">
                      {getTimelineSteps(viewStudent.student).map((step, idx) => (
                        <div key={idx} className="relative">
                          <div className={`absolute -left-[25px] top-1 h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center bg-white ${
                            step.done ? "border-emerald-500 bg-emerald-50" : step.current ? "border-blue-500" : "border-slate-200"
                          }`}>
                            {step.done && <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                          </div>
                          <div>
                            <p className={`font-medium ${step.done ? "text-slate-900" : step.current ? "text-blue-600 font-semibold" : "text-slate-400"}`}>
                              {step.label}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer contextual actions */}
                <div className="px-5 py-4.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2.5 shrink-0">
                  <Button
                    variant="outline"
                    onClick={() => setIsViewOpen(false)}
                    className="h-9 text-[12px] font-medium text-slate-600"
                  >
                    Close File
                  </Button>
                  {viewStudent.student.status === "SLOT_BOOKED" && (
                    <Button
                      onClick={() => handleOpenScore(viewStudent.student)}
                      className="h-9 text-[12px] font-medium bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Record Score
                    </Button>
                  )}
                  {viewStudent.student.status === "EXAM_COMPLETED" && (
                    <Button
                      onClick={() => handleOpenCourse(viewStudent.student)}
                      className="h-9 text-[12px] font-medium bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Assign Course
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Score Modal */}
      {isScoreModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px]" onClick={() => !isSubmitting && setIsScoreModalOpen(false)} />
          <div className="relative bg-white rounded-lg border border-slate-200 shadow-lg max-w-sm w-full p-5 z-10 animate-in zoom-in-95 duration-150">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-[15px] font-semibold text-slate-900">Update Entrance Exam Score</h3>
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
                    Save Score
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
