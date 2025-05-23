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
import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { GetGroupScheduleDto } from './dto/get-group-schedule.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('schedule')
@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  create(@Body() createScheduleDto: CreateScheduleDto) {
    return this.scheduleService.create(createScheduleDto);
  }

  @Get()
  findAll(@Query('teachingAssignmentId') teachingAssignmentId?: string) {
    return this.scheduleService.findAll(
      teachingAssignmentId ? parseInt(teachingAssignmentId) : undefined
    );
  }

  @Get('groups/:groupId')
  @ApiOperation({ summary: 'Get group schedule' })
  @ApiResponse({
    status: 200,
    description: 'Returns the group schedule',
    schema: {
      type: 'object',
      properties: {
        groupId: { type: 'string' },
        groupName: { type: 'string' },
        schedule: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              date: { type: 'string', format: 'date' },
              dayOfWeek: { type: 'string' },
              lessonNumber: { type: 'number' },
              subjectName: { type: 'string' },
              teacherName: { type: 'string' },
              teachingAssignmentId: { type: 'string' },
              isException: { type: 'boolean' },
              exceptionDate: { type: 'string', format: 'date', nullable: true },
            },
          },
        },
      },
    },
  })
  getGroupSchedule(
    @Param('groupId') groupId: string,
    @Query() query: GetGroupScheduleDto,
  ) {
    return this.scheduleService.getGroupSchedule(groupId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scheduleService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ) {
    return this.scheduleService.update(+id, updateScheduleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.scheduleService.remove(+id);
  }
}
