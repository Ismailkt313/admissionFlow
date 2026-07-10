import { IsMongoId, IsNotEmpty } from 'class-validator';

export class BookSlotDto {
  @IsNotEmpty()
  @IsMongoId()
  slotId!: string;
}
