import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import type { RequestWithUser } from '../../../common/interfaces/request.interface';
import { CreateStudentUseCase } from '../../application/use-cases/create-student.use-case';
import { GetStudentsUseCase } from '../../application/use-cases/get-students.use-case';
import { GetStudentDetailsUseCase } from '../../application/use-cases/get-student-details.use-case';
import { UpdateStudentUseCase } from '../../application/use-cases/update-student.use-case';
import { CompleteRegistrationFeeUseCase } from '../../application/use-cases/complete-registration-fee.use-case';
import { BookExamSlotUseCase } from '../../../exam-slots/application/use-cases/book-exam-slot.use-case';
import { GetApplicationsUseCase } from '../../application/use-cases/get-applications.use-case';
import { UpdateExamScoreUseCase } from '../../application/use-cases/update-exam-score.use-case';
import { AssignCourseUseCase } from '../../application/use-cases/assign-course.use-case';
import { GetApplicationDetailsUseCase } from '../../application/use-cases/get-application-details.use-case';
import { GetCompletedAdmissionsUseCase } from '../../application/use-cases/get-completed-admissions.use-case';
import { CreateStudentDto } from '../dto/create-student.dto';
import { UpdateStudentDto } from '../dto/update-student.dto';
import { BookSlotDto } from '../dto/book-slot.dto';
import { UpdateExamScoreDto } from '../dto/update-exam-score.dto';
import { AssignCourseDto } from '../dto/assign-course.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentsController {
  constructor(
    private readonly createStudentUseCase: CreateStudentUseCase,
    private readonly getStudentsUseCase: GetStudentsUseCase,
    private readonly getStudentDetailsUseCase: GetStudentDetailsUseCase,
    private readonly updateStudentUseCase: UpdateStudentUseCase,
    private readonly completeRegistrationFeeUseCase: CompleteRegistrationFeeUseCase,
    private readonly bookExamSlotUseCase: BookExamSlotUseCase,
    private readonly getApplicationsUseCase: GetApplicationsUseCase,
    private readonly updateExamScoreUseCase: UpdateExamScoreUseCase,
    private readonly assignCourseUseCase: AssignCourseUseCase,
    private readonly getApplicationDetailsUseCase: GetApplicationDetailsUseCase,
    private readonly getCompletedAdmissionsUseCase: GetCompletedAdmissionsUseCase,
  ) {}

  @Post()
  @Roles('PARENT')
  @HttpCode(HttpStatus.CREATED)
  async create(@Request() req: RequestWithUser, @Body() dto: CreateStudentDto) {
    const parentId = this.getParentId(req);
    return this.createStudentUseCase.execute(dto, parentId);
  }

  @Get()
  @Roles('PARENT')
  @HttpCode(HttpStatus.OK)
  async findAll(@Request() req: RequestWithUser) {
    const parentId = this.getParentId(req);
    return this.getStudentsUseCase.execute(parentId);
  }

  @Get('applications')
  @Roles('ADMISSION_TEAM')
  @HttpCode(HttpStatus.OK)
  async findApplications() {
    return this.getApplicationsUseCase.execute();
  }

  @Get('completed-admissions')
  @Roles('ADMISSION_TEAM')
  @HttpCode(HttpStatus.OK)
  async findCompletedAdmissions() {
    return this.getCompletedAdmissionsUseCase.execute();
  }

  @Get(':id')
  @Roles('PARENT', 'ADMISSION_TEAM')
  @HttpCode(HttpStatus.OK)
  async findOne(@Request() req: RequestWithUser, @Param('id') id: string) {
    if (req.user.role === 'ADMISSION_TEAM') {
      return this.getApplicationDetailsUseCase.execute(id);
    }
    const parentId = this.getParentId(req);
    return this.getStudentDetailsUseCase.execute(id, parentId);
  }

  @Patch(':id')
  @Roles('PARENT')
  @HttpCode(HttpStatus.OK)
  async update(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateStudentDto,
  ) {
    const parentId = this.getParentId(req);
    return this.updateStudentUseCase.execute(id, parentId, dto);
  }

  @Patch(':studentId/pay-registration')
  @Roles('PARENT')
  @HttpCode(HttpStatus.OK)
  async payRegistration(
    @Request() req: RequestWithUser,
    @Param('studentId') studentId: string,
  ) {
    const parentId = this.getParentId(req);
    return this.completeRegistrationFeeUseCase.execute(studentId, parentId);
  }

  @Patch(':studentId/book-slot')
  @Roles('PARENT')
  @HttpCode(HttpStatus.OK)
  async bookSlot(
    @Request() req: RequestWithUser,
    @Param('studentId') studentId: string,
    @Body() dto: BookSlotDto,
  ) {
    const parentId = this.getParentId(req);
    return this.bookExamSlotUseCase.execute(studentId, parentId, dto.slotId);
  }

  @Patch(':studentId/exam-score')
  @Roles('ADMISSION_TEAM')
  @HttpCode(HttpStatus.OK)
  async updateExamScore(
    @Param('studentId') studentId: string,
    @Body() dto: UpdateExamScoreDto,
  ) {
    return this.updateExamScoreUseCase.execute(studentId, dto);
  }

  @Patch(':studentId/assign-course')
  @Roles('ADMISSION_TEAM')
  @HttpCode(HttpStatus.OK)
  async assignCourse(
    @Param('studentId') studentId: string,
    @Body() dto: AssignCourseDto,
  ) {
    return this.assignCourseUseCase.execute(studentId, dto);
  }

  private getParentId(req: RequestWithUser): string {
    if (!req.user || req.user.role !== 'PARENT') {
      throw new ForbiddenException('Only authenticated Parent users can access these APIs.');
    }
    return req.user.id;
  }
}
