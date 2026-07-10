export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface ApiError {
  message: string | string[];
  error?: string;
  statusCode?: number;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

export type Gender = "MALE" | "FEMALE" | "OTHER";
export type Grade = "GRADE_1" | "GRADE_2" | "GRADE_3" | "GRADE_4";
export type AssignedCourse = Grade;

export interface ExamSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  parentId: string;
  studentName: string;
  dateOfBirth: string;
  gender: Gender;
  previousSchool: string;
  applyingGrade: Grade;
  status: "APPLICATION_CREATED" | "REGISTRATION_FEE_PAID" | "SLOT_BOOKED" | "EXAM_COMPLETED" | "ADMISSION_COMPLETED";
  paymentStatus: "PENDING" | "PAID";
  examSlot: string | null;
  examSlotId: string | null;
  examScore: number | null;
  assignedCourse: AssignedCourse | null;
  createdAt: string;
  updatedAt: string;
  parentName?: string;
  admissionCompletedAt?: string;
}
