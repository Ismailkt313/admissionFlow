import { IsDate, IsEnum, IsOptional, IsString, MaxLength, MinLength, Matches } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Gender, Grade } from '../../domain/entities/student.entity';

export class UpdateStudentDto {
  @IsOptional()
  @IsString({ message: 'Student name must be a string.' })
  @MinLength(3, { message: 'Student name must be at least 3 characters long.' })
  @MaxLength(60, { message: 'Student name cannot exceed 60 characters.' })
  @Matches(/^[a-zA-Z]+( [a-zA-Z]+)*$/, {
    message: 'Student name must contain only letters and single spaces, with no consecutive or leading/trailing spaces.',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  studentName?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Please provide a valid date of birth.' })
  dateOfBirth?: Date;

  @IsOptional()
  @IsEnum(Gender, { message: 'Please select a valid gender option.' })
  gender?: Gender;

  @IsOptional()
  @IsString({ message: 'Previous school name must be a string.' })
  @MinLength(3, { message: 'Previous school name must be at least 3 characters long.' })
  @MaxLength(100, { message: 'Previous school name cannot exceed 100 characters.' })
  @Matches(/^(?![.\-\s]+$)[a-zA-Z0-9\s.\-]+$/, {
    message: 'Previous school name must contain alphanumeric characters and only allowed special characters (spaces, hyphens, periods). It cannot consist of only special characters.',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  previousSchool?: string;

  @IsOptional()
  @IsEnum(Grade, { message: 'Applying grade must be a valid grade option (GRADE_1, GRADE_2, GRADE_3, or GRADE_4).' })
  applyingGrade?: Grade;
}
