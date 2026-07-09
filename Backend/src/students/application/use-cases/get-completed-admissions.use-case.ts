import { Injectable } from '@nestjs/common';
import { IStudentRepository } from '../../domain/repositories/student.repository.interface';
import { IUserRepository } from '../../../auth/domain/repositories/user.repository.interface';
import { Grade } from '../../domain/entities/student.entity';

export interface CompletedAdmissionResponse {
  id: string;
  studentName: string;
  parentName: string;
  applyingGrade: Grade;
  assignedCourse: Grade | null;
  examScore: number | null;
  admissionCompletedAt: Date | null;
  status: string;
}

@Injectable()
export class GetCompletedAdmissionsUseCase {
  constructor(
    private readonly studentRepository: IStudentRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(): Promise<CompletedAdmissionResponse[]> {
    const students = await this.studentRepository.findCompletedAdmissions();
    const enriched = await Promise.all(
      students.map(async (student) => {
        const parent = await this.userRepository.findById(student.parentId);
        return {
          id: student.id,
          studentName: student.studentName,
          parentName: parent ? parent.name : 'Unknown Parent',
          applyingGrade: student.applyingGrade,
          assignedCourse: student.assignedCourse,
          examScore: student.examScore,
          admissionCompletedAt: student.admissionCompletedAt,
          status: student.status,
        };
      }),
    );
    return enriched;
  }
}
