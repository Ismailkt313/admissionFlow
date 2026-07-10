import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { IStudentRepository } from '../../domain/repositories/student.repository.interface';
import { IUserRepository } from '../../../auth/domain/repositories/user.repository.interface';
import { IExamSlotRepository } from '../../../exam-slots/domain/repositories/exam-slot.repository.interface';
import { Gender, Grade, ApplicationStatus, PaymentStatus } from '../../domain/entities/student.entity';

export interface ApplicationDetails {
  student: {
    id: string;
    parentId: string;
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
  };
  parent: {
    name: string;
    email: string;
  };
}

@Injectable()
export class GetApplicationDetailsUseCase {
  constructor(
    private readonly studentRepository: IStudentRepository,
    private readonly userRepository: IUserRepository,
    @Inject(forwardRef(() => IExamSlotRepository))
    private readonly examSlotRepository: IExamSlotRepository,
  ) {}

  async execute(id: string): Promise<ApplicationDetails> {
    const student = await this.studentRepository.findById(id);
    if (!student) {
      throw new NotFoundException('Student record not found.');
    }

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
      student: {
        id: student.id,
        parentId: student.parentId,
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
      },
      parent: {
        name: parent ? parent.name : 'Unknown Parent',
        email: parent ? parent.email : 'Unknown Email',
      },
    };
  }
}
