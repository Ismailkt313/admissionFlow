import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IStudentRepository } from '../../domain/repositories/student.repository.interface';
import { Student, ApplicationStatus } from '../../domain/entities/student.entity';
import { StudentDocument } from '../schemas/student.schema';

@Injectable()
export class MongoStudentRepository implements IStudentRepository {
  constructor(
    @InjectModel(StudentDocument.name)
    private readonly studentModel: Model<StudentDocument>,
  ) {}

  async create(student: Student): Promise<Student> {
    const created = new this.studentModel({
      parentId: student.parentId,
      studentName: student.studentName,
      dateOfBirth: student.dateOfBirth,
      gender: student.gender,
      previousSchool: student.previousSchool,
      applyingGrade: student.applyingGrade,
      status: student.status,
      paymentStatus: student.paymentStatus,
      examSlot: student.examSlot,
      examScore: student.examScore,
      assignedCourse: student.assignedCourse,
      examSlotId: student.examSlotId,
      admissionCompletedAt: student.admissionCompletedAt,
    });
    const saved = await created.save();
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Student | null> {
    const doc = await this.studentModel.findById(id).exec();
    if (!doc) {
      return null;
    }
    return this.toDomain(doc);
  }

  async findByParentId(parentId: string): Promise<Student[]> {
    const docs = await this.studentModel.find({ parentId }).exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async findAll(): Promise<Student[]> {
    const docs = await this.studentModel.find().exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async update(id: string, student: Partial<Student>): Promise<Student | null> {
    const doc = await this.studentModel
      .findByIdAndUpdate(id, { $set: student }, { new: true })
      .exec();
    if (!doc) {
      return null;
    }
    return this.toDomain(doc);
  }

  async findCompletedAdmissions(): Promise<Student[]> {
    const docs = await this.studentModel
      .find({ status: ApplicationStatus.ADMISSION_COMPLETED })
      .sort({ admissionCompletedAt: -1 })
      .exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  private toDomain(doc: any): Student {
    let applyingGrade = doc.applyingGrade;
    if (typeof applyingGrade === 'string') {
      const normalized = applyingGrade.toUpperCase().replace(/\s+/g, "");
      if (normalized === "GRADE1" || normalized === "1" || normalized === "GRADE_1" || normalized.includes("1")) {
        applyingGrade = 'GRADE_1';
      } else if (normalized === "GRADE2" || normalized === "2" || normalized === "GRADE_2" || normalized.includes("2")) {
        applyingGrade = 'GRADE_2';
      } else if (normalized === "GRADE3" || normalized === "3" || normalized === "GRADE_3" || normalized.includes("3")) {
        applyingGrade = 'GRADE_3';
      } else if (normalized === "GRADE4" || normalized === "4" || normalized === "GRADE_4" || normalized.includes("4")) {
        applyingGrade = 'GRADE_4';
      }
    }
    return new Student(
      doc._id.toString(),
      doc.parentId,
      doc.studentName,
      doc.dateOfBirth,
      doc.gender,
      doc.previousSchool,
      applyingGrade,
      doc.status,
      doc.paymentStatus,
      doc.examSlot,
      doc.examScore,
      doc.assignedCourse,
      doc.examSlotId ? doc.examSlotId.toString() : null,
      doc.createdAt,
      doc.updatedAt,
      doc.admissionCompletedAt,
    );
  }
}
