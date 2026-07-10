import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { IStudentRepository } from '../../domain/repositories/student.repository.interface';
import { IUserRepository } from '../../../auth/domain/repositories/user.repository.interface';
import { IExamSlotRepository } from '../../../exam-slots/domain/repositories/exam-slot.repository.interface';
import { Gender, Grade, ApplicationStatus, PaymentStatus } from '../../domain/entities/student.entity';

export interface ApplicationListItem {
  id: string;
  parentId: string;
  parentName: string;
  studentName: string;
  dateOfBirth: Date;
  gender: Gender;
  previousSchool: string;
  applyingGrade: Grade;
  status: ApplicationStatus;
  paymentStatus: PaymentStatus;
  examSlotId: string | null;
  examSlot: {
    date: Date;
    startTime: string;
    endTime: string;
  } | null;
  examScore: number | null;
  assignedCourse: Grade | null;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class GetApplicationsUseCase {
  constructor(
    private readonly studentRepository: IStudentRepository,
    private readonly userRepository: IUserRepository,
    @Inject(forwardRef(() => IExamSlotRepository))
    private readonly examSlotRepository: IExamSlotRepository,
  ) {}

  async execute(): Promise<ApplicationListItem[]> {
    const students = await this.studentRepository.findAll();
    return Promise.all(
      students.map(async (student) => {
        const parent = await this.userRepository.findById(student.parentId);
        let slotDetails: { date: Date; startTime: string; endTime: string } | null = null;
        if (student.examSlotId) {
          const slot = await this.examSlotRepository.findById(student.examSlotId);
          if (slot) {
            slotDetails = {
              date: slot.date,
              startTime: slot.startTime,
              endTime: slot.endTime,
            };
          }
        }
        return {
          id: student.id,
          parentId: student.parentId,
          parentName: parent ? parent.name : 'Unknown Parent',
          studentName: student.studentName,
          dateOfBirth: student.dateOfBirth,
          gender: student.gender,
          previousSchool: student.previousSchool,
          applyingGrade: student.applyingGrade,
          status: student.status,
          paymentStatus: student.paymentStatus,
          examSlotId: student.examSlotId,
          examSlot: slotDetails,
          examScore: student.examScore,
          assignedCourse: student.assignedCourse,
          createdAt: student.createdAt,
          updatedAt: student.updatedAt,
        };
      }),
    );
  }
}
