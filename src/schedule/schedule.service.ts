import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ScheduleService {
  constructor(private prisma: PrismaService) {}

  async create(createScheduleDto: CreateScheduleDto) {
    const schedule = await this.prisma.schedule.create({
      data: {
        lessonNumber: createScheduleDto.lessonNumber,
        date: createScheduleDto.date,
        teacherGroupAssignment: {
          connect: {
            teacherGroupSubjectId: createScheduleDto.teacherGroupSubjectId,
          },
        },
      },
      include: {
        teacherGroupAssignment: {
          include: {
            teacher: { include: { user: true } },
            group: true,
            subject: true,
          },
        },
      },
    });

    return this.formatResponse(schedule);
  }

  async findAll() {
    const schedules = await this.prisma.schedule.findMany({
      include: {
        teacherGroupAssignment: {
          include: {
            teacher: { include: { user: true } },
            group: true,
            subject: true,
          },
        },
      },
    });

    return schedules.map(this.formatResponse);
  }

  async findOne(scheduleId: number) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { scheduleId },
      include: {
        teacherGroupAssignment: {
          include: {
            teacher: { include: { user: true } },
            group: true,
            subject: true,
          },
        },
      },
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${scheduleId} not found`);
    }

    return this.formatResponse(schedule);
  }

  async update(scheduleId: number, updateScheduleDto: UpdateScheduleDto) {
    await this.findOne(scheduleId);

    const updatedSchedule = await this.prisma.schedule.update({
      where: { scheduleId },
      data: {
        lessonNumber: updateScheduleDto.lessonNumber ?? undefined,
        date: updateScheduleDto.date ?? undefined,
        teacherGroupAssignment: updateScheduleDto.teacherGroupSubjectId
          ? {
              connect: {
                teacherGroupSubjectId: updateScheduleDto.teacherGroupSubjectId,
              },
            }
          : undefined,
      },
      include: {
        teacherGroupAssignment: {
          include: {
            teacher: { include: { user: true } },
            group: true,
            subject: true,
          },
        },
      },
    });

    return this.formatResponse(updatedSchedule);
  }

  async remove(scheduleId: number) {
    await this.findOne(scheduleId);

    const deletedSchedule = await this.prisma.schedule.delete({
      where: { scheduleId },
      include: {
        teacherGroupAssignment: {
          include: {
            teacher: { include: { user: true } },
            group: true,
            subject: true,
          },
        },
      },
    });

    return this.formatResponse(deletedSchedule);
  }

  private formatResponse(schedule: any) {
    return {
      scheduleId: schedule.scheduleId,
      teacherId: schedule.teacherGroupAssignment.teacher.teacherId,
      groupId: schedule.teacherGroupAssignment.group.groupId,
      lessonNumber: schedule.lessonNumber,
      teacherName: `${schedule.teacherGroupAssignment.teacher.user.name} ${schedule.teacherGroupAssignment.teacher.user.surname}`,
      groupCode: schedule.teacherGroupAssignment.group.groupCode,
      subjectId: schedule.teacherGroupAssignment.subject.subjectId,
      subjectName: schedule.teacherGroupAssignment.subject.name,
      date: schedule.date,
    };
  }
}
