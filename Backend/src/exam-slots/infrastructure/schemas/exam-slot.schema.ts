import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'exam_slots' })
export class ExamSlotDocument extends Document {
  @Prop({ required: true })
  date!: Date;

  @Prop({ required: true, trim: true })
  startTime!: string;

  @Prop({ required: true, trim: true })
  endTime!: string;

  @Prop({ required: true, min: 1 })
  capacity!: number;

  @Prop({ required: true, default: 0 })
  bookedCount!: number;

  @Prop({ required: true, default: true })
  isActive!: boolean;

  createdAt!: Date;
  updatedAt!: Date;
}

export const ExamSlotSchema = SchemaFactory.createForClass(ExamSlotDocument);
