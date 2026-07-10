import { apiInstance } from "./axios";
import { Student, Gender, Grade, AssignedCourse } from "./types";

export const studentApi = {
  async create(data: {
    studentName: string;
    dateOfBirth: string;
    gender: Gender;
    previousSchool: string;
    applyingGrade: string;
  }): Promise<Student> {
    const { data: responseData } = await apiInstance.post<Student>("/students", data);
    return responseData;
  },

  async remove(id: string): Promise<string> {
    const { data: responseData } = await apiInstance.delete<string>(`/students/delete/${id}`);
    return responseData;
  },

  async update(
    id: string,
    data: {
      studentName?: string;
      dateOfBirth?: string;
      gender?: Gender;
      previousSchool?: string;
      applyingGrade?: string;
    }
  ): Promise<Student> {
    const { data: responseData } = await apiInstance.patch<Student>(`/students/${id}`, data);
    return responseData;
  },

  async delete(id: string): Promise<void> {
    await apiInstance.delete(`/students/${id}`);
  },

  async get(): Promise<Student[]> {
    const { data: responseData } = await apiInstance.get<Student[]>("/students");
    return responseData;
  },

  async getDetails(id: string): Promise<Student> {
    const { data: responseData } = await apiInstance.get<Student>(`/students/${id}`);
    return responseData;
  },

  async payRegistration(studentId: string): Promise<Student> {
    const { data: responseData } = await apiInstance.patch<Student>(
      `/students/${studentId}/pay-registration`
    );
    return responseData;
  },

  async bookSlot(studentId: string, slotId: string): Promise<Student> {
    const { data: responseData } = await apiInstance.patch<Student>(
      `/students/${studentId}/book-slot`,
      { slotId }
    );
    return responseData;
  },

  async updateExamScore(id: string, examScore: number): Promise<Student> {
    const { data: responseData } = await apiInstance.patch<Student>(
      `/students/${id}/exam-score`,
      { examScore }
    );
    return responseData;
  },

  async assignCourse(id: string, assignedCourse: AssignedCourse): Promise<Student> {
    const { data: responseData } = await apiInstance.patch<Student>(
      `/students/${id}/assign-course`,
      { assignedCourse }
    );
    return responseData;
  },

  async applications(): Promise<Student[]> {
    const { data: responseData } = await apiInstance.get<Student[]>("/students/applications");
    return responseData;
  },

  async completedAdmissions(): Promise<Student[]> {
    const { data: responseData } = await apiInstance.get<Student[]>(
      "/students/completed-admissions"
    );
    return responseData;
  },
};
