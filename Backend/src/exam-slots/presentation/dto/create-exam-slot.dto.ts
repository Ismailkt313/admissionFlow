import { IsNotEmpty, IsString, IsInt, Min, Max, IsDate, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateExamSlotDto {
  @IsNotEmpty({ message: 'Exam Date is required.' })
  @Type(() => Date)
  @IsDate({ message: 'Please provide a valid exam date.' })
  date: Date;

  @IsNotEmpty({ message: 'Start Time is required.' })
  @IsString({ message: 'Start Time must be a string.' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Start time must be in HH:MM 24-hour format.' })
  startTime: string;

  @IsNotEmpty({ message: 'End Time is required.' })
  @IsString({ message: 'End Time must be a string.' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'End time must be in HH:MM 24-hour format.' })
  endTime: string;

  @IsNotEmpty({ message: 'Capacity is required.' })
  @IsInt({ message: 'Capacity must be a positive integer.' })
  @Min(1, { message: 'Capacity must be at least 1.' })
  @Max(500, { message: 'Capacity cannot exceed 500.' })
  capacity: number;
}
