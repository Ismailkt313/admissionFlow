import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExamSlotsController } from './presentation/controllers/exam-slots.controller';
import { CreateExamSlotUseCase } from './application/use-cases/create-exam-slot.use-case';
import { GetExamSlotsUseCase } from './application/use-cases/get-exam-slots.use-case';
import { GetAvailableExamSlotsUseCase } from './application/use-cases/get-available-exam-slots.use-case';
import { BookExamSlotUseCase } from './application/use-cases/book-exam-slot.use-case';
import { GetExamSlotDetailsUseCase } from './application/use-cases/get-exam-slot-details.use-case';
import { ExamSlotDocument, ExamSlotSchema } from './infrastructure/schemas/exam-slot.schema';
import { IExamSlotRepository } from './domain/repositories/exam-slot.repository.interface';
import { MongoExamSlotRepository } from './infrastructure/repositories/mongo-exam-slot.repository';
import { StudentsModule } from '../students/students.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ExamSlotDocument.name, schema: ExamSlotSchema }]),
    forwardRef(() => StudentsModule),
    AuthModule,
  ],
  controllers: [ExamSlotsController],
  providers: [
    CreateExamSlotUseCase,
    GetExamSlotsUseCase,
    GetAvailableExamSlotsUseCase,
    BookExamSlotUseCase,
    GetExamSlotDetailsUseCase,
    {
      provide: IExamSlotRepository,
      useClass: MongoExamSlotRepository,
    },
  ],
  exports: [
    IExamSlotRepository,
    BookExamSlotUseCase,
    CreateExamSlotUseCase,
    GetExamSlotsUseCase,
    GetAvailableExamSlotsUseCase,
    GetExamSlotDetailsUseCase,
  ],
})
export class ExamSlotsModule {}
