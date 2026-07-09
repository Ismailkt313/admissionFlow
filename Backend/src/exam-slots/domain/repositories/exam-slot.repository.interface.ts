import { ExamSlot } from '../entities/exam-slot.entity';

export abstract class IExamSlotRepository {
  abstract create(examSlot: ExamSlot): Promise<ExamSlot>;
  abstract findById(id: string): Promise<ExamSlot | null>;
  abstract findAll(): Promise<ExamSlot[]>;
  abstract findAvailable(): Promise<ExamSlot[]>;
  abstract findByDateTime(date: Date, startTime: string, endTime: string): Promise<ExamSlot | null>;
  abstract incrementBookedCount(id: string): Promise<boolean>;
}
