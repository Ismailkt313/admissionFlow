import { Injectable } from '@nestjs/common';
import { IStudentRepository } from '../../domain/repositories/student.repository.interface';
import { Student } from '../../domain/entities/student.entity';

@Injectable()
export class GetStudentsUseCase {
  constructor(private readonly studentRepository: IStudentRepository) {}

  async execute(parentId: string): Promise<Student[]> {
    return this.studentRepository.findByParentId(parentId);
  }
}
