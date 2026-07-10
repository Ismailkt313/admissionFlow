import { apiInstance } from "./axios";
import { ExamSlot } from "./types";

export const examSlotApi = {
  async create(data: {
    date: string;
    startTime: string;
    endTime: string;
    capacity: number;
  }): Promise<ExamSlot> {
    const { data: responseData } = await apiInstance.post<ExamSlot>("/exam-slots", data);
    return responseData;
  },

  async update(id: string, data: any): Promise<ExamSlot> {
    const { data: responseData } = await apiInstance.patch<ExamSlot>(`/exam-slots/${id}`, data);
    return responseData;
  },

  async get(): Promise<ExamSlot[]> {
    const { data: responseData } = await apiInstance.get<ExamSlot[]>("/exam-slots");
    return responseData;
  },

  async getAvailable(): Promise<ExamSlot[]> {
    const { data: responseData } = await apiInstance.get<ExamSlot[]>("/exam-slots/available");
    return responseData;
  },

  async getDetails(id: string): Promise<ExamSlot> {
    const { data: responseData } = await apiInstance.get<ExamSlot>(`/exam-slots/${id}`);
    return responseData;
  },
};
