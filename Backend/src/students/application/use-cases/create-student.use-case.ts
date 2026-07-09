import { Injectable, BadRequestException } from '@nestjs/common';
import { IStudentRepository } from '../../domain/repositories/student.repository.interface';
import { Student, ApplicationStatus, PaymentStatus } from '../../domain/entities/student.entity';
import { CreateStudentDto } from '../../presentation/dto/create-student.dto';
import { isValidDOB, sanitizeString } from '../../../common/utils/validation.helper';

@Injectable()
export class CreateStudentUseCase {
  constructor(private readonly studentRepository: IStudentRepository) {}

  async execute(dto: CreateStudentDto, parentId: string): Promise<Student> {
    if (!isValidDOB(dto.dateOfBirth)) {
      throw new BadRequestException('Student age must be between 3 and 18 years.');
    }

    const sanitizedName = sanitizeString(dto.studentName);
    const sanitizedSchool = sanitizeString(dto.previousSchool);

    const student = new Student(
      '',
      parentId,
      sanitizedName,
      new Date(dto.dateOfBirth),
      dto.gender,
      sanitizedSchool,
      dto.applyingGrade,
      ApplicationStatus.APPLICATION_CREATED,
      PaymentStatus.PENDING,
      null,
      null,
      null,
    );
    return this.studentRepository.create(student);
  }
}
