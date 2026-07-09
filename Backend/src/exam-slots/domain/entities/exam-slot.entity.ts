export class ExamSlot {
  constructor(
    public readonly id: string,
    public readonly date: Date,
    public readonly startTime: string,
    public readonly endTime: string,
    public readonly capacity: number,
    public readonly bookedCount: number,
    public readonly isActive: boolean,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
