import { ConflictException, Injectable, BadRequestException } from '@nestjs/common';
import { IExamSlotRepository } from '../../domain/repositories/exam-slot.repository.interface';
import { ExamSlot } from '../../domain/entities/exam-slot.entity';
import { CreateExamSlotDto } from '../../presentation/dto/create-exam-slot.dto';

@Injectable()
export class CreateExamSlotUseCase {
  constructor(private readonly examSlotRepository: IExamSlotRepository) {}

  async execute(dto: CreateExamSlotDto): Promise<ExamSlot> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dateObj = new Date(dto.date);
    const slotDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());

    if (slotDate < today) {
      throw new BadRequestException('Cannot create an exam slot for a past date.');
    }

    if (slotDate.getTime() === today.getTime()) {
      const [slotHours, slotMinutes] = dto.startTime.split(':').map(Number);
      const serverHours = now.getHours();
      const serverMinutes = now.getMinutes();
      if (slotHours < serverHours || (slotHours === serverHours && slotMinutes <= serverMinutes)) {
        throw new BadRequestException('Cannot create an exam slot for a time that has already passed.');
      }
    }

    const toMinutes = (timeStr: string): number => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    const newStart = toMinutes(dto.startTime);
    const newEnd = toMinutes(dto.endTime);

    if (newEnd <= newStart) {
      throw new BadRequestException('End Time must be after Start Time.');
    }

    const allSlots = await this.examSlotRepository.findAll();
    const sameDateSlots = allSlots.filter((s) => {
      const sDate = new Date(s.date);
      return sDate.getFullYear() === dateObj.getFullYear() &&
             sDate.getMonth() === dateObj.getMonth() &&
             sDate.getDate() === dateObj.getDate();
    });

    const hasOverlap = sameDateSlots.some((s) => {
      const sStart = toMinutes(s.startTime);
      const sEnd = toMinutes(s.endTime);
      return newStart < sEnd && newEnd > sStart;
    });

    if (hasOverlap) {
      throw new ConflictException('An overlapping exam slot already exists on this date.');
    }

    const slot = new ExamSlot(
      '',
      dateObj,
      dto.startTime,
      dto.endTime,
      dto.capacity,
      0,
      true,
    );
    return this.examSlotRepository.create(slot);
  }
}
