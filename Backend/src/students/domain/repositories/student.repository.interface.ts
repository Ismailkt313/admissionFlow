import { Student } from '../entities/student.entity';

export abstract class IStudentRepository {
  abstract create(student: Student): Promise<Student>;
  abstract findById(id: string): Promise<Student | null>;
  abstract findByParentId(parentId: string): Promise<Student[]>;
  abstract findAll(): Promise<Student[]>;
  abstract update(id: string, student: Partial<Student>): Promise<Student | null>;
  abstract findCompletedAdmissions(): Promise<Student[]>;
}
