import { Injectable, UnauthorizedException } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { IHashService } from '../hash-service.interface';
import { ITokenService } from '../token-service.interface';
import { User } from '../../domain/entities/user.entity';
import { LoginDto } from '../../presentation/dto/login.dto';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hashService: IHashService,
    private readonly tokenService: ITokenService,
  ) {}

  async execute(dto: LoginDto): Promise<{ accessToken: string; user: User }> {
    const user = await this.userRepository.findByEmail(dto.email.toLowerCase());
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isPasswordValid = await this.hashService.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role || 'PARENT',
    };

    const accessToken = await this.tokenService.generateToken(payload);

    const userResponse = new User(
      user.id,
      user.name,
      user.email,
      undefined,
      user.role,
      user.createdAt,
      user.updatedAt,
    );

    return {
      accessToken,
      user: userResponse,
    };
  }
}
