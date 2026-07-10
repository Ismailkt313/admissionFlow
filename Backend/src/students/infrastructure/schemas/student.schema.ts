import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ApplicationStatus, PaymentStatus, Gender, Grade } from '../../domain/entities/student.entity';

@Schema({ timestamps: true })
export class StudentDocument extends Document {
  @Prop({ required: true, index: true })
  parentId!: string;

  @Prop({ required: true, trim: true })
  studentName!: string;

  @Prop({ required: true })
  dateOfBirth!: Date;

  @Prop({ type: String, required: true, enum: Object.values(Gender) })
  gender!: Gender;

  @Prop({ required: true, trim: true })
  previousSchool!: string;

  @Prop({ type: String, required: true, enum: Object.values(Grade) })
  applyingGrade!: Grade;

  @Prop({ type: String, required: true, enum: Object.values(ApplicationStatus), default: ApplicationStatus.APPLICATION_CREATED })
  status!: ApplicationStatus;

  @Prop({ type: String, required: true, enum: Object.values(PaymentStatus), default: PaymentStatus.PENDING })
  paymentStatus!: PaymentStatus;

  @Prop({ type: String, default: null })
  examSlot!: string | null;

  @Prop({ type: Number, default: null })
  examScore!: number | null;

  @Prop({ type: String, enum: [...Object.values(Grade), null], default: null })
  assignedCourse!: Grade | null;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ExamSlotDocument', default: null })
  examSlotId!: string | null;

  @Prop({ type: Date, default: null })
  admissionCompletedAt!: Date | null;

  createdAt!: Date;
  updatedAt!: Date;
}

export const StudentSchema = SchemaFactory.createForClass(StudentDocument);
