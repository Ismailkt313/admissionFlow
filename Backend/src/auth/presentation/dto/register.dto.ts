import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @IsNotEmpty({ message: 'Name is required.' })
  @IsString({ message: 'Name must be a string.' })
  @MinLength(3, { message: 'Name must be at least 3 characters long.' })
  @MaxLength(50, { message: 'Name cannot exceed 50 characters.' })
  @Matches(/^[a-zA-Z]+( [a-zA-Z]+)*$/, {
    message: 'Name must contain only letters and single spaces, with no leading/trailing spaces or consecutive spaces.',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name: string;

  @IsNotEmpty({ message: 'Email is required.' })
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  @MaxLength(100, { message: 'Email cannot exceed 100 characters.' })
  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase().trim() : value))
  email: string;

  @IsNotEmpty({ message: 'Password is required.' })
  @IsString({ message: 'Password must be a string.' })
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  @MaxLength(64, { message: 'Password cannot exceed 64 characters.' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9\s])[^\s]{8,64}$/, {
    message: 'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, 1 special character, and must not contain any spaces.',
  })
  password: string;
}
