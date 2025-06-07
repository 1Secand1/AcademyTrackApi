import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { TeachingAssignmentsService } from './teaching-assignments.service';
import { CreateTeachingAssignmentDto } from './dto/create-teaching-assignment.dto';
import { UpdateTeachingAssignmentDto } from './dto/update-teaching-assignment.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('teaching-assignments')
@Controller('teaching-assignments')
export class TeachingAssignmentsController {
  constructor(
    private readonly teachingAssignmentsService: TeachingAssignmentsService,
  ) {}

  @ApiOperation({ summary: 'Создать новое назначение преподавателя' })
  @ApiResponse({ status: 201, description: 'Назначение успешно создано' })
  @ApiResponse({ status: 400, description: 'Неверные данные' })
  @ApiResponse({
    status: 404,
    description: 'Преподаватель, группа или предмет не найдены',
  })
  @ApiResponse({ status: 409, description: 'Такое назначение уже существует' })
  @Post()
  create(@Body() createTeachingAssignmentDto: CreateTeachingAssignmentDto) {
    return this.teachingAssignmentsService.create(createTeachingAssignmentDto);
  }

  @ApiOperation({ summary: 'Получить все назначения преподавателей' })
  @ApiResponse({ status: 200, description: 'Список назначений' })
  @ApiQuery({
    name: 'teacherId',
    required: false,
    description: 'ID преподавателя для фильтрации',
  })
  @Get()
  async findAll(@Query('teacherId') teacherId?: string) {
    return this.teachingAssignmentsService.findAll(
      teacherId ? Number(teacherId) : undefined,
    );
  }

  @ApiOperation({ summary: 'Получить назначение по ID' })
  @ApiResponse({ status: 200, description: 'Назначение найдено' })
  @ApiResponse({ status: 404, description: 'Назначение не найдено' })
  @ApiParam({ name: 'id', description: 'ID назначения' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teachingAssignmentsService.findOne(+id);
  }

  @ApiOperation({ summary: 'Обновить назначение' })
  @ApiResponse({ status: 200, description: 'Назначение обновлено' })
  @ApiResponse({ status: 400, description: 'Неверные данные' })
  @ApiResponse({ status: 404, description: 'Назначение не найдено' })
  @ApiResponse({ status: 409, description: 'Такое назначение уже существует' })
  @ApiParam({ name: 'id', description: 'ID назначения' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTeachingAssignmentDto: UpdateTeachingAssignmentDto,
  ) {
    return this.teachingAssignmentsService.update(
      +id,
      updateTeachingAssignmentDto,
    );
  }

  @ApiOperation({ summary: 'Удалить назначение' })
  @ApiResponse({ status: 200, description: 'Назначение удалено' })
  @ApiResponse({ status: 404, description: 'Назначение не найдено' })
  @ApiParam({ name: 'id', description: 'ID назначения' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teachingAssignmentsService.remove(+id);
  }
}
