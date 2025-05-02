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

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  create(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendanceService.create(createAttendanceDto);
  }

  @Get()
  async findAll(@Query('groupId') groupId?: string) {
    return this.attendanceService.findAll(
      groupId ? Number(groupId) : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attendanceService.findOne(+id);
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
