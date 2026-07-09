import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IExamSlotRepository } from '../../domain/repositories/exam-slot.repository.interface';
import { ExamSlot } from '../../domain/entities/exam-slot.entity';
import { ExamSlotDocument } from '../schemas/exam-slot.schema';

@Injectable()
export class MongoExamSlotRepository implements IExamSlotRepository {
  constructor(
    @InjectModel(ExamSlotDocument.name)
    private readonly examSlotModel: Model<ExamSlotDocument>,
  ) {}

  async create(examSlot: ExamSlot): Promise<ExamSlot> {
    const created = new this.examSlotModel({
      date: examSlot.date,
      startTime: examSlot.startTime,
      endTime: examSlot.endTime,
      capacity: examSlot.capacity,
      bookedCount: examSlot.bookedCount,
      isActive: examSlot.isActive,
    });
    const saved = await created.save();
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<ExamSlot | null> {
    const doc = await this.examSlotModel.findById(id).exec();
    if (!doc) {
      return null;
    }
    return this.toDomain(doc);
  }

  async findAll(): Promise<ExamSlot[]> {
    const docs = await this.examSlotModel.find().exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async findAvailable(): Promise<ExamSlot[]> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const nowTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const docs = await this.examSlotModel
      .find({
        isActive: true,
        $expr: { $lt: ['$bookedCount', '$capacity'] },
        $or: [
          { date: { $gt: today } },
          {
            date: today,
            startTime: { $gt: nowTimeStr },
          },
        ],
      })
      .sort({ date: 1, startTime: 1 })
      .exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async findByDateTime(date: Date, startTime: string, endTime: string): Promise<ExamSlot | null> {
    const doc = await this.examSlotModel
      .findOne({
        date: new Date(date),
        startTime,
        endTime,
      })
      .exec();
    if (!doc) {
      return null;
    }
    return this.toDomain(doc);
  }

  async incrementBookedCount(id: string): Promise<boolean> {
    const result = await this.examSlotModel
      .updateOne(
        {
          _id: id,
          isActive: true,
          $expr: { $lt: ['$bookedCount', '$capacity'] },
        },
        { $inc: { bookedCount: 1 } },
      )
      .exec();
    return result.modifiedCount > 0;
  }

  private toDomain(doc: any): ExamSlot {
    return new ExamSlot(
      doc._id.toString(),
      doc.date,
      doc.startTime,
      doc.endTime,
      doc.capacity,
      doc.bookedCount,
      doc.isActive,
      doc.createdAt,
      doc.updatedAt,
    );
  }
}
