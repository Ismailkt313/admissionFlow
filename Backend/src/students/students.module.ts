import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StudentsController } from './presentation/controllers/students.controller';
import { CreateStudentUseCase } from './application/use-cases/create-student.use-case';
import { GetStudentsUseCase } from './application/use-cases/get-students.use-case';
import { GetStudentDetailsUseCase } from './application/use-cases/get-student-details.use-case';
import { UpdateStudentUseCase } from './application/use-cases/update-student.use-case';
import { CompleteRegistrationFeeUseCase } from './application/use-cases/complete-registration-fee.use-case';
import { StudentDocument, StudentSchema } from './infrastructure/schemas/student.schema';
import { IStudentRepository } from './domain/repositories/student.repository.interface';
import { MongoStudentRepository } from './infrastructure/repositories/mongo-student.repository';
import { AuthModule } from '../auth/auth.module';
import { ExamSlotsModule } from '../exam-slots/exam-slots.module';
import { GetApplicationsUseCase } from './application/use-cases/get-applications.use-case';
import { UpdateExamScoreUseCase } from './application/use-cases/update-exam-score.use-case';
import { AssignCourseUseCase } from './application/use-cases/assign-course.use-case';
import { GetApplicationDetailsUseCase } from './application/use-cases/get-application-details.use-case';
import { GetCompletedAdmissionsUseCase } from './application/use-cases/get-completed-admissions.use-case';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: StudentDocument.name, schema: StudentSchema }]),
    AuthModule,
    forwardRef(() => ExamSlotsModule),
  ],
  controllers: [StudentsController],
  providers: [
    CreateStudentUseCase,
    GetStudentsUseCase,
    GetStudentDetailsUseCase,
    UpdateStudentUseCase,
    CompleteRegistrationFeeUseCase,
    GetApplicationsUseCase,
    UpdateExamScoreUseCase,
    AssignCourseUseCase,
    GetApplicationDetailsUseCase,
    GetCompletedAdmissionsUseCase,
    {
      provide: IStudentRepository,
      useClass: MongoStudentRepository,
    },
  ],
  exports: [IStudentRepository],
})
export class StudentsModule {}
 