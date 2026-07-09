"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit2, User, Calendar, School, Layers, Clock, CreditCard, Award, BookOpen, AlertTriangle, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/toast";
import { api, Student, ApiError, ExamSlot } from "@/lib/api";

export default function StudentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();

  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

  const [availableSlots, setAvailableSlots] = useState<ExamSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");
  const [bookedSlot, setBookedSlot] = useState<ExamSlot | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  const fetchAvailableSlots = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoadingSlots(true);
    try {
      const slots = await api.getAvailableSlots(token);
      setAvailableSlots(slots);
    } catch (err) {
      console.error("Failed to fetch slots", err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const fetchBookedSlot = async (slotId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const slot = await api.getSlotDetails(token, slotId);
      setBookedSlot(slot);
    } catch (err) {
      console.error("Failed to fetch booked slot details", err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !id) return;

    api.getStudentDetails(token, id)
      .then((data) => {
        setStudent(data);
        if (data.paymentStatus === "PAID" && !data.examSlotId) {
          fetchAvailableSlots();
        }
        if (data.examSlotId) {
          fetchBookedSlot(data.examSlotId);
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to fetch student details.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const getStatusLabel = (status: Student["status"]) => {
    switch (status) {
      case "APPLICATION_CREATED":
        return "Application Created";
      case "REGISTRATION_FEE_PAID":
        return "Fee Paid";
      case "SLOT_BOOKED":
        return "Slot Booked";
      case "EXAM_COMPLETED":
        return "Exam Completed";
      case "ADMISSION_COMPLETED":
        return "Admission Completed";
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

  const getGenderLabel = (gender: Student["gender"]) => {
    switch (gender) {
      case "MALE":
        return "Male";
      case "FEMALE":
        return "Female";
      case "OTHER":
        return "Other";
      default:
        return gender;
    }
  };

  const handleConfirmPayment = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setIsSubmittingPayment(true);
    try {
      const updatedStudent = await api.payRegistration(token, id);
      setStudent(updatedStudent);
      setIsConfirmDialogOpen(false);
      toast({
        title: "Registration Fee Paid Successfully",
        description: `Payment for ${updatedStudent.studentName} has been processed.`,
        variant: "success",
      });
      fetchAvailableSlots();
    } catch (err) {
      const error = err as ApiError;
      let errMsg = "Failed to process payment.";
      if (Array.isArray(error.message)) errMsg = error.message[0];
      else if (error.message) errMsg = error.message;

      toast({
        title: "Payment Failed",
        description: errMsg,
        variant: "error",
      });
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const handleBookSlot = async () => {
    if (!selectedSlotId) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    setIsSubmittingBooking(true);
    try {
      const updatedStudent = await api.bookSlot(token, id, selectedSlotId);
      setStudent(updatedStudent);
      setIsBookingModalOpen(false);
      toast({
        title: "Entrance Exam Slot Booked Successfully",
        description: `Exam slot has been reserved for ${updatedStudent.studentName}.`,
        variant: "success",
      });
      if (updatedStudent.examSlotId) {
        fetchBookedSlot(updatedStudent.examSlotId);
      }
    } catch (err) {
      const error = err as ApiError;
      let errMsg = "Failed to book slot.";
      if (Array.isArray(error.message)) errMsg = error.message[0];
      else if (error.message) errMsg = error.message;

      toast({
        title: "Booking Failed",
        description: errMsg,
        variant: "error",
      });
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const isSlotExpired = (slot: ExamSlot) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const slotDate = new Date(slot.date);
    const slotDateOnly = new Date(slotDate.getFullYear(), slotDate.getMonth(), slotDate.getDate());

    if (slotDateOnly < today) {
      return true;
    }

    if (slotDateOnly.getTime() === today.getTime()) {
      const [hours, minutes] = slot.startTime.split(':').map(Number);
      const serverHours = now.getHours();
      const serverMinutes = now.getMinutes();
      return hours < serverHours || (hours === serverHours && minutes <= serverMinutes);
    }
    return false;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-3 items-center">
          <div className="h-8 w-8 bg-slate-100 rounded animate-pulse" />
          <div className="h-5 bg-slate-100 rounded w-40 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-72 bg-slate-100 rounded-lg animate-pulse" />
          <div className="h-72 bg-slate-100 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="max-w-sm mx-auto py-16 px-6 text-center space-y-3">
        <div className="h-10 w-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <p className="text-[13px] font-medium text-slate-900">Failed to load student details</p>
        <p className="text-[11px] text-slate-400">{error || "Student not found or access denied."}</p>
        <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/students")} className="h-8 border-slate-200 hover:bg-slate-50 text-[12px] font-medium text-slate-600">
          Back to Students
        </Button>
      </div>
    );
  }

  const isPaid = student.paymentStatus === "PAID";

  const DetailRow = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
    <div className="flex items-start gap-3 py-2.5">
      <div className="p-1.5 rounded bg-slate-100 text-slate-400 shrink-0 mt-0.5">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider leading-none">{label}</p>
        <p className="text-[13px] font-medium text-slate-900 mt-1">{value}</p>
      </div>
    </div>
  );

  const steps = [
    { key: "APPLICATION_CREATED", label: "Application Created", description: "Profile registered successfully" },
    { key: "REGISTRATION_FEE_PAID", label: "Registration Fee Paid", description: "Application fee payment verified" },
    { key: "SLOT_BOOKED", label: "Entrance Exam Slot Booked", description: "Exam schedule confirmed" },
    { key: "EXAM_COMPLETED", label: "Exam Completed", description: "Evaluation and scores compiled" },
    { key: "ADMISSION_COMPLETED", label: "Admission Completed", description: "Final enrollment processed" },
  ];

  const getStepIndex = (status: Student["status"]) => {
    switch (status) {
      case "APPLICATION_CREATED": return 0;
      case "REGISTRATION_FEE_PAID": return 1;
      case "SLOT_BOOKED": return 2;
      case "EXAM_COMPLETED": return 3;
      case "ADMISSION_COMPLETED": return 4;
      default: return 0;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard/students")}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-[15px] font-semibold text-slate-900">{student.studentName}</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Grade {student.applyingGrade} · Registered {new Date(student.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </div>

        {!isPaid && (
          <Link href={`/dashboard/students/${student.id}/edit`} className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto gap-2 h-8 border-slate-200 hover:bg-slate-50 text-slate-600 text-[12px] font-medium">
              <Edit2 className="h-3.5 w-3.5" />
              <span>Edit Profile</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Locked Banner */}
      {student.paymentStatus === "PAID" && !student.examSlotId && !isBannerDismissed && (
        <div className="flex items-center justify-between gap-2.5 px-4 py-2.5 bg-amber-50 border border-amber-200/60 rounded-lg animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
            <p className="text-[12px] font-medium text-amber-800">
              Registration fee completed. Student information is locked. Continue to Entrance Exam Slot Booking.
            </p>
          </div>
          <button
            onClick={() => setIsBannerDismissed(true)}
            className="p-1 rounded-md text-amber-500 hover:text-amber-700 hover:bg-amber-100/50 transition-colors focus:outline-none focus:ring-1 focus:ring-amber-500"
            aria-label="Dismiss banner"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Student Information */}
        <div className="bg-white border border-slate-200/80 rounded-lg overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100">
            <h3 className="text-[13px] font-semibold text-slate-900">Student Information</h3>
          </div>
          <div className="px-5 py-2 divide-y divide-slate-100">
            <DetailRow icon={User} label="Full Name" value={student.studentName} />
            <DetailRow
              icon={Calendar}
              label="Date of Birth"
              value={new Date(student.dateOfBirth).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            />
            <DetailRow icon={User} label="Gender" value={getGenderLabel(student.gender)} />
            <DetailRow icon={School} label="Previous School" value={student.previousSchool} />
            <DetailRow icon={Layers} label="Applying Grade" value={student.applyingGrade} />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Payments */}
          <div className="bg-white border border-slate-200/80 rounded-lg overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100">
              <h3 className="text-[13px] font-semibold text-slate-900">Registration & Payments</h3>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Registration Fee</span>
                <span className="text-[13px] font-semibold text-slate-900">₹500</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Payment Status</span>
                <span
                  className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
                    isPaid ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {isPaid ? "Paid" : "Pending"}
                </span>
              </div>
              {isPaid && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Payment Date</span>
                    <span className="text-[12px] font-medium text-slate-600">
                      {new Date(student.updatedAt || student.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Reference</span>
                    <span className="text-[11px] font-mono font-medium text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded">
                      TXN-{student.id.slice(-6).toUpperCase()}
                    </span>
                  </div>
                </>
              )}

              <div className="pt-1">
                {!isPaid && (
                  <Button
                    onClick={() => setIsConfirmDialogOpen(true)}
                    className="w-full h-9 text-[12px] font-medium bg-slate-900 text-white hover:bg-slate-800"
                  >
                    Pay Registration Fee
                  </Button>
                )}
                {isPaid && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-md">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span className="text-[11px] font-medium text-emerald-700">Payment Completed</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Entrance Examination Card */}
          <div className="bg-white border border-slate-200/80 rounded-lg overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-[13px] font-semibold text-slate-900">Entrance Examination</h3>
              {student.examSlotId ? (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700">
                  Booked
                </span>
              ) : (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                  Not Booked
                </span>
              )}
            </div>

            <div className="p-5 space-y-4">
              {!isPaid ? (
                <div className="flex items-start gap-2.5 px-3 py-2.5 bg-slate-50 border border-slate-200/60 rounded-md animate-in fade-in duration-200">
                  <Clock className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-[12px] text-slate-500 leading-normal">
                    Complete Registration Fee before booking an entrance exam.
                  </p>
                </div>
              ) : student.examSlotId ? (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {bookedSlot ? (
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center text-[12px]">
                        <span className="text-slate-400 font-medium uppercase tracking-wider text-[11px]">Exam Date</span>
                        <span className="text-slate-900 font-semibold">{formatDate(bookedSlot.date)}</span>
                      </div>
                      <div className="flex justify-between items-center text-[12px]">
                        <span className="text-slate-400 font-medium uppercase tracking-wider text-[11px]">Exam Time</span>
                        <span className="text-slate-900 font-semibold">{bookedSlot.startTime} - {bookedSlot.endTime}</span>
                      </div>
                      <div className="flex justify-between items-center text-[12px]">
                        <span className="text-slate-400 font-medium uppercase tracking-wider text-[11px]">Booking Status</span>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700">
                          Confirmed
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <div className="h-4 bg-slate-50 rounded animate-pulse w-3/4" />
                      <div className="h-4 bg-slate-50 rounded animate-pulse w-2/3" />
                      <div className="h-4 bg-slate-50 rounded animate-pulse w-1/2" />
                    </div>
                  )}

                  <div className="flex items-start gap-2.5 px-3 py-2.5 bg-emerald-50/50 border border-emerald-100 rounded-md">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-emerald-800 leading-normal">
                      Your entrance examination slot has been reserved successfully. The Admission Team will update your examination score after the exam.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="text-[12px] font-medium text-slate-900 mb-1">Available Entrance Exam Slots</div>
                  {loadingSlots ? (
                    <div className="space-y-2">
                      <div className="h-[52px] bg-slate-50 rounded animate-pulse" />
                      <div className="h-[52px] bg-slate-50 rounded animate-pulse" />
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="text-center py-6 px-4 bg-slate-50 border border-slate-200/60 rounded-md">
                      <p className="text-[12px] font-medium text-slate-900">No slots available</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Please check again later.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-md overflow-hidden bg-white">
                      {availableSlots.map((slot) => {
                        const isFull = slot.bookedCount >= slot.capacity;
                        const isExpired = isSlotExpired(slot);
                        const isDisabled = isFull || isExpired;
                        const isSelected = selectedSlotId === slot.id;
                        return (
                          <label
                            key={slot.id}
                            className={`flex items-start gap-3 px-3 py-2.5 text-[12px] transition-colors select-none ${
                              isDisabled
                                ? "opacity-50 cursor-not-allowed bg-slate-50/20"
                                : "cursor-pointer hover:bg-slate-50/60"
                            }`}
                          >
                            <input
                              type="radio"
                              name="examSlot"
                              value={slot.id}
                              checked={isSelected}
                              disabled={isDisabled}
                              onChange={() => setSelectedSlotId(slot.id)}
                              className="mt-0.5 h-3.5 w-3.5 border-slate-300 text-slate-900 focus:ring-slate-900/10 cursor-pointer disabled:cursor-not-allowed"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between font-semibold text-slate-900">
                                <span>{formatDate(slot.date)}</span>
                                <span className="text-[11px] font-medium text-slate-400">
                                  {isExpired ? "0 Seats" : `${slot.capacity - slot.bookedCount} Seats`} Available
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-slate-500 text-[11px] mt-0.5 font-medium">
                                <span>{slot.startTime} - {slot.endTime}</span>
                                <span
                                  className={
                                    isExpired
                                      ? "text-red-500 font-semibold"
                                      : isFull
                                      ? "text-red-500 font-semibold"
                                      : "text-emerald-600 font-semibold"
                                  }
                                >
                                  {isExpired ? "Expired" : isFull ? "Full" : "Available"}
                                </span>
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {!student.examSlotId && availableSlots.length > 0 && (
                    <Button
                      onClick={() => setIsBookingModalOpen(true)}
                      disabled={!selectedSlotId}
                      className="w-full h-9 text-[12px] font-medium bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
                    >
                      Book Entrance Exam Slot
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Application Progress */}
          <div className="bg-white border border-slate-200/80 rounded-lg overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100">
              <h3 className="text-[13px] font-semibold text-slate-900">Application Progress</h3>
            </div>
            <div className="px-5 py-4 space-y-4">
              {steps.map((step, idx) => {
                const currentIdx = getStepIndex(student.status);
                const isCompleted = idx <= currentIdx;
                const isActive = idx === currentIdx;
                return (
                  <div key={idx} className="flex gap-3">
                    <div className="flex flex-col items-center shrink-0">
                      <div
                        className={`h-4.5 w-4.5 rounded-full flex items-center justify-center border text-[9px] font-semibold select-none ${
                          isCompleted
                            ? "bg-slate-900 border-slate-900 text-white"
                            : "bg-white border-slate-200 text-slate-400"
                        }`}
                      >
                        {isCompleted ? "✓" : idx + 1}
                      </div>
                      {idx < steps.length - 1 && (
                        <div
                          className={`w-0.5 flex-grow my-1 ${
                            isCompleted && idx < currentIdx ? "bg-slate-900" : "bg-slate-100"
                          }`}
                          style={{ minHeight: "16px" }}
                        />
                      )}
                    </div>
                    <div className="min-w-0 pb-1">
                      <p
                        className={`text-[12px] font-semibold ${
                          isCompleted ? "text-slate-900" : "text-slate-400"
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {step.description}
                        {idx === 2 && bookedSlot && (
                          <span className="block font-semibold text-slate-700 mt-0.5">
                            {formatDate(bookedSlot.date)} ({bookedSlot.startTime} - {bookedSlot.endTime})
                          </span>
                        )}
                        {idx === 3 && student.examScore !== null && (
                          <span className="block font-semibold text-slate-700 mt-0.5">
                            Score: {student.examScore} / 100
                          </span>
                        )}
                        {idx === 4 && student.assignedCourse && (
                          <span className="block font-semibold text-slate-700 mt-0.5">
                            Course: {student.assignedCourse}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Confirmation Dialog */}
      {isConfirmDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-150"
            onClick={() => setIsConfirmDialogOpen(false)}
          />
          <div className="relative bg-white rounded-lg border border-slate-200 shadow-lg max-w-sm w-full p-5 animate-in zoom-in-95 duration-150 z-10">
            <div className="space-y-4">
              <div>
                <h3 className="text-[15px] font-semibold text-slate-900">Confirm Payment</h3>
                <p className="text-[12px] text-slate-500 mt-1 leading-relaxed">
                  Once completed, student information becomes read-only and you can proceed to Entrance Exam Slot Booking.
                </p>
              </div>

              <div className="flex items-center justify-between px-3 py-2.5 rounded-md bg-slate-50 border border-slate-200/60 text-[12px]">
                <span className="text-slate-500 font-medium">Registration Fee</span>
                <span className="text-slate-900 font-semibold">₹500</span>
              </div>

              <div className="flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmittingPayment}
                  onClick={() => setIsConfirmDialogOpen(false)}
                  className="h-9 text-[12px] font-medium border-slate-200 hover:bg-slate-50 text-slate-600"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  isLoading={isSubmittingPayment}
                  disabled={isSubmittingPayment}
                  onClick={handleConfirmPayment}
                  className="h-9 text-[12px] font-medium bg-slate-900 hover:bg-slate-800 text-white"
                >
                  Confirm Payment
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Confirmation Dialog */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-150"
            onClick={() => setIsBookingModalOpen(false)}
          />
          <div className="relative bg-white rounded-lg border border-slate-200 shadow-lg max-w-sm w-full p-5 animate-in zoom-in-95 duration-150 z-10">
            <div className="space-y-4">
              <div>
                <h3 className="text-[15px] font-semibold text-slate-900">Confirm Entrance Exam Slot</h3>
                <p className="text-[12px] text-slate-500 mt-1 leading-relaxed">
                  You are about to reserve this entrance examination slot. Once booked, the slot cannot be changed.
                </p>
              </div>

              {(() => {
                const selectedSlot = availableSlots.find(s => s.id === selectedSlotId);
                if (!selectedSlot) return null;
                return (
                  <div className="space-y-2 px-3 py-2.5 rounded-md bg-slate-50 border border-slate-200/60 text-[12px]">
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-400">Exam Date</span>
                      <span className="text-slate-900 font-semibold">{formatDate(selectedSlot.date)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-400">Exam Time</span>
                      <span className="text-slate-900 font-semibold">{selectedSlot.startTime} - {selectedSlot.endTime}</span>
                    </div>
                  </div>
                );
              })()}

              <div className="flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmittingBooking}
                  onClick={() => setIsBookingModalOpen(false)}
                  className="h-9 text-[12px] font-medium border-slate-200 hover:bg-slate-50 text-slate-600"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  isLoading={isSubmittingBooking}
                  disabled={isSubmittingBooking}
                  onClick={handleBookSlot}
                  className="h-9 text-[12px] font-medium bg-slate-900 hover:bg-slate-800 text-white"
                >
                  Confirm Booking
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
