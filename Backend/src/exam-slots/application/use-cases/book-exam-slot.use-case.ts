import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { IExamSlotRepository } from '../../domain/repositories/exam-slot.repository.interface';
import { IStudentRepository } from '../../../students/domain/repositories/student.repository.interface';
import { ApplicationStatus, PaymentStatus } from '../../../students/domain/entities/student.entity';

@Injectable()
export class BookExamSlotUseCase {
  constructor(
    private readonly examSlotRepository: IExamSlotRepository,
    private readonly studentRepository: IStudentRepository,
  ) {}

  async execute(studentId: string, parentId: string, slotId: string): Promise<any> {
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new NotFoundException('Student record not found.');
    }
    if (student.parentId !== parentId) {
      throw new ForbiddenException('You do not own this student record.');
    }
    if (student.paymentStatus !== PaymentStatus.PAID) {
      throw new ForbiddenException('Registration fee has not been paid yet.');
    }
    if (student.examSlotId) {
      throw new ConflictException('Entrance exam slot has already been booked for this student.');
    }

    const slot = await this.examSlotRepository.findById(slotId);
    if (!slot) {
      throw new NotFoundException('Exam slot not found.');
    }
    if (!slot.isActive) {
      throw new ConflictException('Selected exam slot is inactive.');
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const slotDate = new Date(slot.date.getFullYear(), slot.date.getMonth(), slot.date.getDate());

    if (slotDate < today) {
      throw new ConflictException('This exam slot has already expired. Please select another available slot.');
    }

    if (slotDate.getTime() === today.getTime()) {
      const [slotHours, slotMinutes] = slot.startTime.split(':').map(Number);
      const serverHours = now.getHours();
      const serverMinutes = now.getMinutes();
      if (slotHours < serverHours || (slotHours === serverHours && slotMinutes <= serverMinutes)) {
        throw new ConflictException('This exam slot has already expired. Please select another available slot.');
      }
    }

    if (slot.bookedCount >= slot.capacity) {
      throw new ConflictException('Selected exam slot is already at full capacity.');
    }

    const incremented = await this.examSlotRepository.incrementBookedCount(slotId);
    if (!incremented) {
      throw new ConflictException('Failed to book slot. It may have become full.');
    }

    const updatedStudent = await this.studentRepository.update(studentId, {
      examSlotId: slotId,
      status: ApplicationStatus.SLOT_BOOKED,
    });

    return updatedStudent;
  }
}
