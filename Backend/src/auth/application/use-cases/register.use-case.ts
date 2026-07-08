import { ConflictException, Injectable } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { IHashService } from '../hash-service.interface';
import { User } from '../../domain/entities/user.entity';
import { RegisterDto } from '../../presentation/dto/register.dto';

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hashService: IHashService,
  ) {}

  async execute(dto: RegisterDto): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(dto.email.toLowerCase());
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await this.hashService.hash(dto.password);

    const newUser = new User(
      '',
      dto.name,
      dto.email.toLowerCase(),
      hashedPassword,
      'PARENT',
    );

    const savedUser = await this.userRepository.create(newUser);

    return new User(
      savedUser.id,
      savedUser.name,
      savedUser.email,
      undefined,
      savedUser.role,
      savedUser.createdAt,
      savedUser.updatedAt,
    );
  }
}
