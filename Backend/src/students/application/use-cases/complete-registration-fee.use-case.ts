import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { IStudentRepository } from '../../domain/repositories/student.repository.interface';
import { Student, PaymentStatus, ApplicationStatus } from '../../domain/entities/student.entity';

@Injectable()
export class CompleteRegistrationFeeUseCase {
  constructor(private readonly studentRepository: IStudentRepository) {}

  async execute(studentId: string, parentId: string): Promise<Student> {
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    if (student.parentId !== parentId) {
      throw new ForbiddenException('Access denied to this student record');
    }
    if (student.paymentStatus === PaymentStatus.PAID) {
      throw new ConflictException('Registration fee has already been paid.');
    }
    if (student.status === ApplicationStatus.ADMISSION_COMPLETED) {
      throw new ConflictException('Cannot make a payment after the admission workflow has been completed.');
    }

    const updated = await this.studentRepository.update(studentId, {
      paymentStatus: PaymentStatus.PAID,
      status: ApplicationStatus.REGISTRATION_FEE_PAID,
    });

    if (!updated) {
      throw new NotFoundException('Student not found');
    }

    return updated;
  }
}
