import { IsInt, Min, Max, IsNotEmpty } from 'class-validator';

export class UpdateExamScoreDto {
  @IsNotEmpty({ message: 'Exam score is required.' })
  @IsInt({ message: 'Exam score must be an integer.' })
  @Min(0, { message: 'Exam score must be between 0 and 100.' })
  @Max(100, { message: 'Exam score must be between 0 and 100.' })
  examScore!: number;
}
