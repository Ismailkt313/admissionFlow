import { Injectable } from '@nestjs/common';
import { IExamSlotRepository } from '../../domain/repositories/exam-slot.repository.interface';
import { ExamSlot } from '../../domain/entities/exam-slot.entity';

@Injectable()
export class GetExamSlotsUseCase {
  constructor(private readonly examSlotRepository: IExamSlotRepository) {}

  async execute(): Promise<ExamSlot[]> {
    return this.examSlotRepository.findAll();
  }
}
