import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { CreateExamSlotUseCase } from '../../application/use-cases/create-exam-slot.use-case';
import { GetExamSlotsUseCase } from '../../application/use-cases/get-exam-slots.use-case';
import { GetAvailableExamSlotsUseCase } from '../../application/use-cases/get-available-exam-slots.use-case';
import { GetExamSlotDetailsUseCase } from '../../application/use-cases/get-exam-slot-details.use-case';
import { CreateExamSlotDto } from '../dto/create-exam-slot.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('exam-slots')
export class ExamSlotsController {
  constructor(
    private readonly createExamSlotUseCase: CreateExamSlotUseCase,
    private readonly getExamSlotsUseCase: GetExamSlotsUseCase,
    private readonly getAvailableExamSlotsUseCase: GetAvailableExamSlotsUseCase,
    private readonly getExamSlotDetailsUseCase: GetExamSlotDetailsUseCase,
  ) {}

  @Post()
  @Roles('ADMISSION_TEAM')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateExamSlotDto) {
    return this.createExamSlotUseCase.execute(dto);
  }

  @Get()
  @Roles('ADMISSION_TEAM')
  @HttpCode(HttpStatus.OK)
  async findAll() {
    return this.getExamSlotsUseCase.execute();
  }

  @Get('available')
  @Roles('PARENT')
  @HttpCode(HttpStatus.OK)
  async findAvailable() {
    return this.getAvailableExamSlotsUseCase.execute();
  }

  @Get(':id')
  @Roles('ADMISSION_TEAM', 'PARENT')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return this.getExamSlotDetailsUseCase.execute(id);
  }
}
