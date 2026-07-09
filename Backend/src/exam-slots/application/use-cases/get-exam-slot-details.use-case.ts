import { Injectable, NotFoundException } from '@nestjs/common';
import { IExamSlotRepository } from '../../domain/repositories/exam-slot.repository.interface';
import { ExamSlot } from '../../domain/entities/exam-slot.entity';

@Injectable()
export class GetExamSlotDetailsUseCase {
  constructor(private readonly examSlotRepository: IExamSlotRepository) {}

  async execute(id: string): Promise<ExamSlot> {
    const slot = await this.examSlotRepository.findById(id);
    if (!slot) {
      throw new NotFoundException('Exam slot not found.');
    }
    return slot;
  }
}
