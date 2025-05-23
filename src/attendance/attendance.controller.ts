import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { GroupAttendanceSummaryDto } from './dto/group-attendance-summary.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('attendance')
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  create(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendanceService.create(createAttendanceDto);
  }

  @Get()
  async findAll(
    @Query('groupId') groupId?: string,
    @Query('teachingAssignmentId') teachingAssignmentId?: string,
  ) {
    return this.attendanceService.findAll(
      groupId ? Number(groupId) : undefined,
      teachingAssignmentId ? Number(teachingAssignmentId) : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attendanceService.findOne(+id);
  }

  @Get('group/:groupId/summary')
  @ApiOperation({ summary: 'Get attendance summary for a group' })
  @ApiResponse({
    status: 200,
    description: 'Returns attendance statistics for the group',
    type: GroupAttendanceSummaryDto,
  })
  getGroupAttendanceSummary(@Param('groupId') groupId: string) {
    return this.attendanceService.getGroupAttendanceSummary(+groupId);
  }

  @Patch(':scheduleId')
  update(
    @Param('scheduleId', ParseIntPipe) scheduleId: number,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
  ) {
    return this.attendanceService.update(scheduleId, updateAttendanceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attendanceService.remove(+id);
  }
}
