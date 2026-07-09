const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

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

async function handleResponse<T>(response: Response): Promise<T> {
  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const error: ApiError = data || { message: response.statusText };
    throw error;
  }

  return data as T;
}

export const api = {
  async register(name: string, email: string, password: string): Promise<User> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });
    return handleResponse<User>(response);
  },

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<LoginResponse>(response);
  },

  async getProfile(token: string): Promise<User> {
    const response = await fetch(`${API_URL}/auth/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    return handleResponse<User>(response);
  },

  async createStudent(
    token: string,
    data: {
      studentName: string;
      dateOfBirth: string;
      gender: "MALE" | "FEMALE" | "OTHER";
      previousSchool: string;
      applyingGrade: string;
    }
  ): Promise<Student> {
    const response = await fetch(`${API_URL}/students`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse<Student>(response);
  },

  async getStudents(token: string): Promise<Student[]> {
    const response = await fetch(`${API_URL}/students`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    return handleResponse<Student[]>(response);
  },

  async getStudentDetails(token: string, id: string): Promise<Student> {
    const response = await fetch(`${API_URL}/students/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    return handleResponse<Student>(response);
  },

  async updateStudent(
    token: string,
    id: string,
    data: {
      studentName?: string;
      dateOfBirth?: string;
      gender?: "MALE" | "FEMALE" | "OTHER";
      previousSchool?: string;
      applyingGrade?: string;
    }
  ): Promise<Student> {
    const response = await fetch(`${API_URL}/students/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse<Student>(response);
  },

  async payRegistration(token: string, studentId: string): Promise<Student> {
    const response = await fetch(`${API_URL}/students/${studentId}/pay-registration`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    return handleResponse<Student>(response);
  },

  async getAvailableSlots(token: string): Promise<ExamSlot[]> {
    const response = await fetch(`${API_URL}/exam-slots/available`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    return handleResponse<ExamSlot[]>(response);
  },

  async getSlotDetails(token: string, slotId: string): Promise<ExamSlot> {
    const response = await fetch(`${API_URL}/exam-slots/${slotId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    return handleResponse<ExamSlot>(response);
  },

  async bookSlot(token: string, studentId: string, slotId: string): Promise<Student> {
    const response = await fetch(`${API_URL}/students/${studentId}/book-slot`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ slotId }),
    });
    return handleResponse<Student>(response);
  },

  async createExamSlot(
    token: string,
    data: {
      date: string;
      startTime: string;
      endTime: string;
      capacity: number;
    }
  ): Promise<ExamSlot> {
    const response = await fetch(`${API_URL}/exam-slots`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse<ExamSlot>(response);
  },

  async getAllExamSlots(token: string): Promise<ExamSlot[]> {
    const response = await fetch(`${API_URL}/exam-slots`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    return handleResponse<ExamSlot[]>(response);
  },

  async getApplications(token: string): Promise<Student[]> {
    const response = await fetch(`${API_URL}/students/applications`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    return handleResponse<Student[]>(response);
  },

  async updateExamScore(token: string, id: string, examScore: number): Promise<Student> {
    const response = await fetch(`${API_URL}/students/${id}/exam-score`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ examScore }),
    });
    return handleResponse<Student>(response);
  },

  async assignCourse(token: string, id: string, assignedCourse: AssignedCourse): Promise<Student> {
    const response = await fetch(`${API_URL}/students/${id}/assign-course`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ assignedCourse }),
    });
    return handleResponse<Student>(response);
  },

  async getCompletedAdmissions(token: string): Promise<Student[]> {
    const response = await fetch(`${API_URL}/students/completed-admissions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    return handleResponse<Student[]>(response);
  },
};
