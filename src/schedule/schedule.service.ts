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

    return this.groupSchedules(schedules);
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
      },
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${scheduleId} not found`);
    }

    const schedules = await this.prisma.schedule.findMany({
      where: {
        teacherGroupSubject: {
          teacherGroupSubjectId:
            schedule.teacherGroupSubject.teacherGroupSubjectId,
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
      },
      orderBy: { date: 'asc' },
    });

    return this.groupSchedules(schedules);
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

  private groupSchedules(schedules: any[]) {
    const grouped = schedules.reduce(
      (acc, schedule) => {
        const groupCode = schedule.teacherGroupSubject.group.groupCode;
        const teacher = schedule.teacherGroupSubject.teacher.user;
        const subjectName = schedule.teacherGroupSubject.subject.name;

        const key = `${groupCode}|${teacher.surname} ${teacher.name} ${teacher.patronymic}|${subjectName}`;

        if (!acc[key]) {
          acc[key] = {
            groupCode,
            teacherFullName: `${teacher.surname} ${teacher.name} ${teacher.patronymic}`,
            subject: subjectName,
            lessonsAttendance: [],
          };
        }

        acc[key].lessonsAttendance.push({
          lessonNumber: schedule.lessonNumber,
          date: schedule.date.toISOString().split('T')[0],
          status: 'planned',
          scheduleId: schedule.scheduleId,
        });

        return acc;
      },
      {} as Record<string, any>,
    );

    return Object.values(grouped);
  }
}
