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
        teacherGroupSubject: {
          connect: {
            teacherGroupSubjectId: createScheduleDto.teacherGroupSubjectId,
          },
        },
      },
      include: {
        teacherGroupSubject: {
          include: {
            teacher: { include: { user: true } },
            group: true,
            subject: true,
          },
        },
        attendances: {
          include: {
            student: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    return this.formatResponse(schedule);
  }

  async findAll() {
    const schedules = await this.prisma.schedule.findMany({
      include: {
        teacherGroupSubject: {
          include: {
            teacher: { include: { user: true } },
            group: true,
            subject: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    });

    if (!schedules.length) {
      return [];
    }

    const groupedSchedules = schedules.reduce((acc, schedule) => {
      const key = `${schedule.teacherGroupSubject.group.groupCode}|${schedule.teacherGroupSubject.teacher.user.surname} ${schedule.teacherGroupSubject.teacher.user.name} ${schedule.teacherGroupSubject.teacher.user.patronymic}|${schedule.teacherGroupSubject.subject.name}`;

      if (!acc[key]) {
        acc[key] = {
          groupCode: schedule.teacherGroupSubject.group.groupCode,
          teacherFullName: `${schedule.teacherGroupSubject.teacher.user.surname} ${schedule.teacherGroupSubject.teacher.user.name} ${schedule.teacherGroupSubject.teacher.user.patronymic}`,
          subject: schedule.teacherGroupSubject.subject.name,
          lessonsAttendance: [],
        };
      }

      acc[key].lessonsAttendance.push({
        lessonNumber: schedule.lessonNumber,
        date: schedule.date.toISOString().split('T')[0],
        status: 'planned',
      });

      return acc;
    }, {});

    return Object.values(groupedSchedules);
  }

  async findOne(scheduleId: number) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { scheduleId },
      include: {
        teacherGroupSubject: {
          include: {
            teacher: { include: { user: true } },
            group: true,
            subject: true,
          },
        },
        attendances: {
          include: {
            student: {
              include: {
                user: true,
              },
            },
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
        teacherGroupSubject: updateScheduleDto.teacherGroupSubjectId
          ? {
              connect: {
                teacherGroupSubjectId: updateScheduleDto.teacherGroupSubjectId,
              },
            }
          : undefined,
      },
      include: {
        teacherGroupSubject: {
          include: {
            teacher: { include: { user: true } },
            group: true,
            subject: true,
          },
        },
        attendances: {
          include: {
            student: {
              include: {
                user: true,
              },
            },
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
        teacherGroupSubject: {
          include: {
            teacher: { include: { user: true } },
            group: true,
            subject: true,
          },
        },
        attendances: {
          include: {
            student: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    return this.formatResponse(deletedSchedule);
  }

  private formatResponse(schedule: any) {
    return {
      groupCode: schedule.teacherGroupSubject.group.groupCode,
      teacherFullName: `${schedule.teacherGroupSubject.teacher.user.surname} ${schedule.teacherGroupSubject.teacher.user.name} ${schedule.teacherGroupSubject.teacher.user.patronymic}`,
      subject: schedule.teacherGroupSubject.subject.name,
      lessonsAttendance: [
        {
          lessonNumber: schedule.lessonNumber,
          date: schedule.date.toISOString().split('T')[0],
          status: 'planned',
        },
      ],
    };
  }
}
