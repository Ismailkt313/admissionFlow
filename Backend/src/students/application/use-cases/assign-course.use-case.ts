import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { IStudentRepository } from '../../domain/repositories/student.repository.interface';
import { Student, ApplicationStatus, PaymentStatus } from '../../domain/entities/student.entity';
import { AssignCourseDto } from '../../presentation/dto/assign-course.dto';

@Injectable()
export class AssignCourseUseCase {
  constructor(private readonly studentRepository: IStudentRepository) {}

  async execute(id: string, dto: AssignCourseDto): Promise<Student> {
    const student = await this.studentRepository.findById(id);
    if (!student) {
      throw new NotFoundException('Student not found.');
    }

    if (student.paymentStatus !== PaymentStatus.PAID) {
      throw new BadRequestException('Registration fee has not been completed.');
    }

    if (!student.examSlotId) {
      throw new BadRequestException('Entrance exam has not been booked.');
    }

    if (student.examScore === null) {
      throw new BadRequestException('Exam evaluation score has not been recorded.');
    }

    if (student.status !== ApplicationStatus.EXAM_COMPLETED) {
      if (student.status === ApplicationStatus.ADMISSION_COMPLETED) {
        throw new ConflictException('Course assignment already exists.');
      }
      throw new BadRequestException('Entrance exam has not been completed.');
    }

    if (student.assignedCourse !== null) {
      throw new ConflictException('Course assignment already exists.');
    }

    const updated = await this.studentRepository.update(id, {
      assignedCourse: dto.assignedCourse,
      status: ApplicationStatus.ADMISSION_COMPLETED,
      admissionCompletedAt: new Date(),
    });

    if (!updated) {
      throw new NotFoundException('Student not found.');
    }

    return updated;
  }
}
