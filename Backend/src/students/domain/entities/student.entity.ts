export enum ApplicationStatus {
  APPLICATION_CREATED = 'APPLICATION_CREATED',
  REGISTRATION_FEE_PAID = 'REGISTRATION_FEE_PAID',
  SLOT_BOOKED = 'SLOT_BOOKED',
  EXAM_COMPLETED = 'EXAM_COMPLETED',
  ADMISSION_COMPLETED = 'ADMISSION_COMPLETED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum Grade {
  GRADE_1 = 'GRADE_1',
  GRADE_2 = 'GRADE_2',
  GRADE_3 = 'GRADE_3',
  GRADE_4 = 'GRADE_4',
}

export class Student {
  constructor(
    public readonly id: string,
    public readonly parentId: string,
    public readonly studentName: string,
    public readonly dateOfBirth: Date,
    public readonly gender: Gender,
    public readonly previousSchool: string,
    public readonly applyingGrade: Grade,
    public readonly status: ApplicationStatus,
    public readonly paymentStatus: PaymentStatus,
    public readonly examSlot: string | null,
    public readonly examScore: number | null,
    public readonly assignedCourse: Grade | null,
    public readonly examSlotId: string | null = null,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
    public readonly admissionCompletedAt: Date | null = null,
  ) {}
}
