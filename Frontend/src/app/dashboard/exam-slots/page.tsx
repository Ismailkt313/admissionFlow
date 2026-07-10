"use client";

import React, { useEffect, useState } from "react";
import { Plus, X, Calendar, Clock, Users, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/toast";
import { examSlotApi, ExamSlot, ApiError } from "@/lib/api";
import { getToken } from "@/lib/auth-storage";

export default function ExamSlotsPage() {
  const { toast } = useToast();

  const [slots, setSlots] = useState<ExamSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const [form, setForm] = useState({
    date: "",
    startTime: "",
    endTime: "",
    capacity: "",
  });

  const [touched, setTouched] = useState({
    date: false,
    startTime: false,
    endTime: false,
    capacity: false,
  });

  const [errors, setErrors] = useState({
    date: "",
    startTime: "",
    endTime: "",
    capacity: "",
  });

  const fetchSlots = async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      const data = await examSlotApi.get();
      setSlots(data);
    } catch (err) {
      setError("Failed to load entrance exam slots.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const validateField = (name: string, value: string, currentFormState = form) => {
    switch (name) {
      case "date": {
        if (!value) return "Exam date is required";
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const inputDate = new Date(value);
        inputDate.setHours(0, 0, 0, 0);
        if (inputDate < today) {
          return "Exam date cannot be in the past.";
        }
        return "";
      }
      case "startTime": {
        if (!value) return "Start time is required";
        if (currentFormState.date) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const inputDate = new Date(currentFormState.date);
          inputDate.setHours(0, 0, 0, 0);
          if (inputDate.getTime() === today.getTime()) {
            const timeParts = value.split(":");
            if (timeParts.length >= 2) {
              const hours = Number(timeParts[0]);
              const minutes = Number(timeParts[1]);
              const now = new Date();
              if (hours < now.getHours() || (hours === now.getHours() && minutes <= now.getMinutes())) {
                return "Exam time has already passed. Please choose a future examination slot.";
              }
            }
          }
        }
        return "";
      }
      case "endTime": {
        if (!value) return "End time is required";
        if (currentFormState.startTime) {
          const [sh, sm] = currentFormState.startTime.split(':').map(Number);
          const [eh, em] = value.split(':').map(Number);
          const startMin = sh * 60 + sm;
          const endMin = eh * 60 + em;
          if (endMin <= startMin) {
            return "End Time must be after Start Time.";
          }
        }
        return "";
      }
      case "capacity": {
        if (!value) return "Capacity is required";
        const num = Number(value);
        if (isNaN(num) || num <= 0 || !Number.isInteger(num)) {
          return "Capacity must be a positive integer";
        }
        if (num > 500) {
          return "Capacity cannot exceed 500.";
        }
        return "";
      }
      default:
        return "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const nextForm = { ...form, [name]: value };
    setForm(nextForm);

    if (touched[name as keyof typeof touched]) {
      const errorMsg = validateField(name, value, nextForm);
      setErrors((prev) => {
        const nextErrors = { ...prev, [name]: errorMsg };
        if (name === "date") {
          nextErrors.startTime = validateField("startTime", nextForm.startTime, nextForm);
        }
        if (name === "startTime" && nextForm.endTime) {
          nextErrors.endTime = validateField("endTime", nextForm.endTime, nextForm);
        }
        return nextErrors;
      });
    }
  };

  const handleBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const errorMsg = validateField(name, form[name as keyof typeof form]);
    setErrors((prev) => {
      const nextErrors = { ...prev, [name]: errorMsg };
      if (name === "date") {
        nextErrors.startTime = validateField("startTime", form.startTime, form);
      }
      if (name === "startTime" && form.endTime) {
        nextErrors.endTime = validateField("endTime", form.endTime, form);
      }
      return nextErrors;
    });
  };

  const isFormValid =
    form.date &&
    form.startTime &&
    form.endTime &&
    form.capacity &&
    Object.values(errors).every((err) => !err);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    const newErrors = {
      date: validateField("date", form.date),
      startTime: validateField("startTime", form.startTime),
      endTime: validateField("endTime", form.endTime),
      capacity: validateField("capacity", form.capacity),
    };

    setErrors(newErrors);
    setTouched({
      date: true,
      startTime: true,
      endTime: true,
      capacity: true,
    });

    const hasErrors = Object.values(newErrors).some((err) => !!err);
    if (hasErrors) return;

    setIsSubmitting(true);
    try {
      const token = getToken();
      if (!token) throw new Error("No session found");

      await examSlotApi.create({
        date: new Date(form.date).toISOString(),
        startTime: form.startTime,
        endTime: form.endTime,
        capacity: Number(form.capacity),
      });

      toast({
        title: "Exam Slot Created",
        description: "Predefined entrance exam slot has been created.",
        variant: "success",
      });

      setForm({ date: "", startTime: "", endTime: "", capacity: "" });
      setTouched({ date: false, startTime: false, endTime: false, capacity: false });
      setErrors({ date: "", startTime: "", endTime: "", capacity: "" });
      setIsModalOpen(false);
      fetchSlots();
    } catch (err) {
      const errorObj = err as ApiError;
      if (Array.isArray(errorObj.message)) {
        setServerError(errorObj.message[0]);
      } else if (errorObj.message) {
        setServerError(errorObj.message);
      } else {
        setServerError("Failed to create exam slot.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
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

  const getStatusBadge = (slot: ExamSlot) => {
    if (isSlotExpired(slot)) {
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-700">
          Expired
        </span>
      );
    }
    if (!slot.isActive) {
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500">
          Inactive
        </span>
      );
    }
    if (slot.bookedCount >= slot.capacity) {
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-700">
          Full
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700">
        Available
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[15px] font-semibold text-slate-900">Entrance Exam Slots</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Manage predefined entrance examination schedules for applicants.
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="gap-2 h-9 text-[12px] font-medium bg-slate-900 text-white hover:bg-slate-800 shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Create Slot</span>
        </Button>
      </div>

      {error && (
        <Alert variant="error" className="rounded-lg">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Table / Grid */}
      {loading ? (
        <div className="bg-white border border-slate-200/80 rounded-lg overflow-hidden">
          <div className="h-10 border-b border-slate-100 bg-slate-50/50" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 border-b border-slate-100 animate-pulse bg-slate-50/30" />
          ))}
        </div>
      ) : slots.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-lg flex flex-col items-center justify-center py-14 px-6 text-center">
          <AlertCircle className="h-6 w-6 text-slate-300 mb-2.5" />
          <p className="text-[13px] font-medium text-slate-900">No exam slots created</p>
          <p className="text-[11px] text-slate-400 mt-1 max-w-[280px]">
            Create your first entrance examination slot.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="mt-3 h-8 border-slate-200 hover:bg-slate-50 text-[12px] font-medium text-slate-600"
          >
            Create First Slot
          </Button>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden sm:block bg-white border border-slate-200/80 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/60 select-none">
                    <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Exam Date</th>
                    <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Start Time</th>
                    <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">End Time</th>
                    <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Capacity</th>
                    <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Booked</th>
                    <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Remaining</th>
                    <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {slots.map((slot) => (
                    <tr key={slot.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-4 py-3 text-[13px] font-medium text-slate-900">{formatDate(slot.date)}</td>
                      <td className="px-4 py-3 text-[12px] text-slate-600">{slot.startTime}</td>
                      <td className="px-4 py-3 text-[12px] text-slate-600">{slot.endTime}</td>
                      <td className="px-4 py-3 text-[12px] text-slate-600">{slot.capacity}</td>
                      <td className="px-4 py-3 text-[12px] text-slate-600">{slot.bookedCount}</td>
                      <td className="px-4 py-3 text-[12px] text-slate-600">
                        {Math.max(0, slot.capacity - slot.bookedCount)}
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(slot)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/40 select-none">
              <p className="text-[11px] text-slate-400">
                {slots.length} predefined exam {slots.length === 1 ? "schedule" : "schedules"} listed
              </p>
            </div>
          </div>

          {/* Mobile Stacked View */}
          <div className="sm:hidden space-y-3">
            {slots.map((slot) => (
              <div key={slot.id} className="bg-white border border-slate-200/80 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-[13px] font-semibold text-slate-900">{formatDate(slot.date)}</h4>
                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mt-0.5">
                      <Clock className="h-3 w-3" />
                      <span>{slot.startTime} - {slot.endTime}</span>
                    </div>
                  </div>
                  {getStatusBadge(slot)}
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Capacity</span>
                    <span className="text-[12px] font-semibold text-slate-700">{slot.capacity}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Booked</span>
                    <span className="text-[12px] font-semibold text-slate-700">{slot.bookedCount}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Remaining</span>
                    <span className="text-[12px] font-semibold text-slate-700">
                      {Math.max(0, slot.capacity - slot.bookedCount)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Create Slot Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-150"
            onClick={() => !isSubmitting && setIsModalOpen(false)}
          />
          <div className="relative bg-white rounded-lg border border-slate-200 shadow-lg max-w-sm w-full p-5 animate-in zoom-in-95 duration-150 z-10">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-[15px] font-semibold text-slate-900">Create Exam Slot</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Setup a new entrance examination schedule.</p>
                </div>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3" noValidate>
                {serverError && (
                  <Alert variant="error" className="rounded-lg">
                    <AlertDescription className="text-[11px]">{serverError}</AlertDescription>
                  </Alert>
                )}

                 <div className="space-y-1.5">
                  <Label htmlFor="date">Exam Date <span className="text-red-500">*</span></Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={form.date}
                    onChange={handleChange}
                    onBlur={() => handleBlur("date")}
                    error={touched.date && !!errors.date}
                    aria-invalid={touched.date && !!errors.date ? "true" : "false"}
                    aria-describedby={touched.date && errors.date ? "date-error" : undefined}
                    disabled={isSubmitting}
                    startIcon={<Calendar className="h-4 w-4" />}
                    required
                  />
                  {touched.date && errors.date && (
                    <p id="date-error" role="alert" className="text-[11px] font-medium text-error mt-0.5">{errors.date}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="startTime">Start Time <span className="text-red-500">*</span></Label>
                    <Input
                      id="startTime"
                      name="startTime"
                      type="time"
                      value={form.startTime}
                      onChange={handleChange}
                      onBlur={() => handleBlur("startTime")}
                      error={touched.startTime && !!errors.startTime}
                      aria-invalid={touched.startTime && !!errors.startTime ? "true" : "false"}
                      aria-describedby={touched.startTime && errors.startTime ? "startTime-error" : undefined}
                      disabled={isSubmitting}
                      startIcon={<Clock className="h-4 w-4" />}
                      required
                    />
                    {touched.startTime && errors.startTime && (
                      <p id="startTime-error" role="alert" className="text-[11px] font-medium text-error mt-0.5">{errors.startTime}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="endTime">End Time <span className="text-red-500">*</span></Label>
                    <Input
                      id="endTime"
                      name="endTime"
                      type="time"
                      value={form.endTime}
                      onChange={handleChange}
                      onBlur={() => handleBlur("endTime")}
                      error={touched.endTime && !!errors.endTime}
                      aria-invalid={touched.endTime && !!errors.endTime ? "true" : "false"}
                      aria-describedby={touched.endTime && errors.endTime ? "endTime-error" : undefined}
                      disabled={isSubmitting}
                      startIcon={<Clock className="h-4 w-4" />}
                      required
                    />
                    {touched.endTime && errors.endTime && (
                      <p id="endTime-error" role="alert" className="text-[11px] font-medium text-error mt-0.5">{errors.endTime}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="capacity">Capacity <span className="text-red-500">*</span></Label>
                  <Input
                    id="capacity"
                    name="capacity"
                    type="number"
                    min="1"
                    max="500"
                    placeholder="e.g. 20"
                    value={form.capacity}
                    onChange={handleChange}
                    onBlur={() => handleBlur("capacity")}
                    error={touched.capacity && !!errors.capacity}
                    aria-invalid={touched.capacity && !!errors.capacity ? "true" : "false"}
                    aria-describedby={touched.capacity && errors.capacity ? "capacity-error" : undefined}
                    disabled={isSubmitting}
                    startIcon={<Users className="h-4 w-4" />}
                    required
                  />
                  {touched.capacity && errors.capacity && (
                    <p id="capacity-error" role="alert" className="text-[11px] font-medium text-error mt-0.5">{errors.capacity}</p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    onClick={() => setIsModalOpen(false)}
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
                    Create Slot
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
