import { IsNotEmpty, IsEnum } from 'class-validator';
import { Grade } from '../../domain/entities/student.entity';

export class AssignCourseDto {
  @IsNotEmpty({ message: 'Assigned course is required.' })
  @IsEnum(Grade, { message: 'Assigned course must be a valid course level (GRADE_1, GRADE_2, GRADE_3, or GRADE_4).' })
  assignedCourse!: Grade;
}
