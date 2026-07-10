"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { studentApi, Student } from "@/lib/api";
import { getToken } from "@/lib/auth-storage";
import { getCourseLabel } from "@/lib/validation";

export default function CompletedAdmissionsPage() {
  const [admissions, setAdmissions] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadData = () => {
    setLoading(true);
    setError(false);
    const token = getToken();
    if (!token) {
      setError(true);
      setLoading(false);
      return;
    }

    studentApi.completedAdmissions()
      .then((data) => {
        setAdmissions(data);
        setError(false);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[15px] font-semibold text-slate-900">Completed Admissions</h2>
        <p className="text-[11px] text-slate-400 mt-0.5">
          View all registered students who have finalized their admission enrollment.
        </p>
      </div>

      {loading && (
        <div className="bg-white border border-slate-200/80 rounded-lg overflow-hidden">
          <div className="h-10 border-b border-slate-100 bg-slate-50/50" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 border-b border-slate-100 animate-pulse bg-slate-50/30" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="bg-white border border-slate-200/80 rounded-lg flex flex-col items-center justify-center py-14 px-6 text-center">
          <AlertCircle className="h-6 w-6 text-red-500 mb-2.5 animate-bounce" />
          <h3 className="text-[13px] font-semibold text-slate-900">Unable to load completed admissions</h3>
          <p className="text-[11px] text-slate-400 mt-1 max-w-[280px]">
            An unexpected error occurred while loading completed admissions. Please try again.
          </p>
          <Button
            onClick={loadData}
            className="mt-4 h-8 text-[11px] font-medium bg-slate-900 hover:bg-slate-800 text-white"
          >
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && admissions.length === 0 && (
        <div className="bg-white border border-slate-200/80 rounded-lg flex flex-col items-center justify-center py-14 px-6 text-center">
          <AlertCircle className="h-6 w-6 text-slate-300 mb-2.5" />
          <h3 className="text-[13px] font-semibold text-slate-900">No completed admissions yet</h3>
          <p className="text-[11px] text-slate-400 mt-1 max-w-[280px]">
            Completed student admissions will appear here once the admission process is finalized.
          </p>
        </div>
      )}

      {!loading && !error && admissions.length > 0 && (
        <>
          <div className="hidden sm:block bg-white border border-slate-200/80 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/60 select-none">
                    <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Student</th>
                    <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Parent</th>
                    <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Applied Grade</th>
                    <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Assigned Grade</th>
                    <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Exam Score</th>
                    <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Completed Date</th>
                    <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {admissions.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-4 py-3 text-[13px] font-medium text-slate-900">{student.studentName}</td>
                      <td className="px-4 py-3 text-[12px] text-slate-600">{student.parentName}</td>
                      <td className="px-4 py-3 text-[12px] text-slate-600">{getCourseLabel(student.applyingGrade)}</td>
                      <td className="px-4 py-3 text-[12px] text-slate-900 font-medium">
                        {getCourseLabel(student.assignedCourse)}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-slate-600">
                        {student.examScore !== null ? `${student.examScore} / 100` : "-"}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-slate-400">
                        {formatDate(student.admissionCompletedAt)}
                      </td>
                      <td className="px-4 py-3 text-[12px]">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Completed
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/40 select-none">
              <p className="text-[11px] text-slate-400">
                {admissions.length} enrolled {admissions.length === 1 ? "applicant" : "applicants"} in total
              </p>
            </div>
          </div>

          <div className="sm:hidden space-y-3">
            {admissions.map((student) => (
              <div key={student.id} className="bg-white border border-slate-200/80 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-[13px] font-semibold text-slate-900">{student.studentName}</h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">{getCourseLabel(student.applyingGrade)}</p>
                  </div>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Completed
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Course</span>
                    <span className="text-[12px] font-semibold text-slate-700">{getCourseLabel(student.assignedCourse)}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Exam Score</span>
                    <span className="text-[12px] font-semibold text-slate-700">
                      {student.examScore !== null ? `${student.examScore}/100` : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
