import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { IStudentRepository } from '../../domain/repositories/student.repository.interface';
import { Student, PaymentStatus } from '../../domain/entities/student.entity';
import { UpdateStudentDto } from '../../presentation/dto/update-student.dto';
import { isValidDOB, sanitizeString } from '../../../common/utils/validation.helper';

@Injectable()
export class UpdateStudentUseCase {
  constructor(private readonly studentRepository: IStudentRepository) {}

  async execute(id: string, parentId: string, dto: UpdateStudentDto): Promise<Student> {
    const student = await this.studentRepository.findById(id);
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    if (student.parentId !== parentId) {
      throw new ForbiddenException('Access denied to this student record');
    }
    if (student.paymentStatus === PaymentStatus.PAID) {
      throw new ForbiddenException('Student details cannot be updated after registration fee payment.');
    }

    if (dto.dateOfBirth && !isValidDOB(dto.dateOfBirth)) {
      throw new BadRequestException('Student age must be between 3 and 18 years.');
    }

    const updatePayload = { ...dto };
    if (updatePayload.studentName) {
      updatePayload.studentName = sanitizeString(updatePayload.studentName);
    }
    if (updatePayload.previousSchool) {
      updatePayload.previousSchool = sanitizeString(updatePayload.previousSchool);
    }

    const updated = await this.studentRepository.update(id, updatePayload);
    if (!updated) {
      throw new NotFoundException('Student not found');
    }
    return updated;
  }
}
