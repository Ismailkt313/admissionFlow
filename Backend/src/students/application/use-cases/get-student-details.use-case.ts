import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IStudentRepository } from '../../domain/repositories/student.repository.interface';
import { Student } from '../../domain/entities/student.entity';

@Injectable()
export class GetStudentDetailsUseCase {
  constructor(private readonly studentRepository: IStudentRepository) {}

  async execute(id: string, parentId: string): Promise<Student> {
    const student = await this.studentRepository.findById(id);
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    if (student.parentId !== parentId) {
      throw new ForbiddenException('Access denied to this student record');
    }
    return student;
  }
}
