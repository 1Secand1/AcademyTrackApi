import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { PrismaService } from '../prisma.service';
import { GetGroupScheduleDto } from './dto/get-group-schedule.dto';

@Injectable()
export class ScheduleService {
  constructor(private prisma: PrismaService) {}

  private async checkScheduleConflict(
    groupId: number,
    date: Date,
    lessonNumber: number,
    excludeScheduleId?: number
  ) {
    const existingSchedule = await this.prisma.schedule.findFirst({
      where: {
        scheduleId: excludeScheduleId ? { not: excludeScheduleId } : undefined,
        date,
        lessonNumber,
        groupId
      },
      include: {
        teacherGroupSubject: {
          include: {
            teacher: { include: { user: true } },
            subject: true,
            group: true
          }
        }
      }
    });

    if (existingSchedule) {
      const teacher = existingSchedule.teacherGroupSubject.teacher.user;
      const teacherName = `${teacher.surname} ${teacher.name} ${teacher.patronymic}`;
      const group = existingSchedule.teacherGroupSubject.group;
      throw new ConflictException(
        `Конфликт расписания: в это время (${date.toLocaleDateString()}, ${lessonNumber} пара) уже запланировано занятие "${existingSchedule.teacherGroupSubject.subject.name}" с преподавателем ${teacherName} для группы ${group.groupCode}`
      );
    }
  }

  async create(createScheduleDto: CreateScheduleDto) {
    const teacherGroupSubject = await this.prisma.teacherGroupSubject.findUnique({
      where: { teacherGroupSubjectId: createScheduleDto.teacherGroupSubjectId },
      include: {
        group: true,
        teacher: { include: { user: true } },
        subject: true
      }
    });

    if (!teacherGroupSubject) {
      throw new NotFoundException('Назначение преподавателя не найдено');
    }

    await this.checkScheduleConflict(
      teacherGroupSubject.groupId,
      createScheduleDto.date,
      createScheduleDto.lessonNumber
    );

    const schedule = await this.prisma.schedule.create({
      data: {
        lessonNumber: createScheduleDto.lessonNumber,
        date: createScheduleDto.date,
        teacherGroupSubjectId: createScheduleDto.teacherGroupSubjectId,
        groupId: teacherGroupSubject.groupId,
        timeSlot: createScheduleDto.timeSlot || 1
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

  async findAll(teachingAssignmentId?: number) {
    const whereCondition = teachingAssignmentId
      ? {
          teacherGroupSubjectId: teachingAssignmentId,
        }
      : {};

    const schedules = await this.prisma.schedule.findMany({
      where: whereCondition,
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
    const currentSchedule = await this.prisma.schedule.findUnique({
      where: { scheduleId },
      include: {
        teacherGroupSubject: {
          include: {
            group: true
          }
        }
      }
    });

    if (!currentSchedule) {
      throw new NotFoundException(`Расписание с ID ${scheduleId} не найдено`);
    }

    const teacherGroupSubjectId = updateScheduleDto.teacherGroupSubjectId || currentSchedule.teacherGroupSubjectId;
    const teacherGroupSubject = await this.prisma.teacherGroupSubject.findUnique({
      where: { teacherGroupSubjectId },
      include: {
        group: true
      }
    });

    if (!teacherGroupSubject) {
      throw new NotFoundException('Назначение преподавателя не найдено');
    }

    if (updateScheduleDto.date || updateScheduleDto.lessonNumber) {
      await this.checkScheduleConflict(
        teacherGroupSubject.groupId,
        updateScheduleDto.date || currentSchedule.date,
        updateScheduleDto.lessonNumber || currentSchedule.lessonNumber,
        scheduleId
      );
    }

    const updatedSchedule = await this.prisma.schedule.update({
      where: { scheduleId },
      data: {
        lessonNumber: updateScheduleDto.lessonNumber ?? undefined,
        date: updateScheduleDto.date ?? undefined,
        teacherGroupSubjectId: updateScheduleDto.teacherGroupSubjectId ?? undefined,
        timeSlot: updateScheduleDto.timeSlot ?? undefined
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
    const teacherFullName = `${schedule.teacherGroupSubject.teacher.user.surname} ${schedule.teacherGroupSubject.teacher.user.name} ${schedule.teacherGroupSubject.teacher.user.patronymic}`;
    const subjectName = schedule.teacherGroupSubject.subject.name;

    return {
      groupCode: schedule.teacherGroupSubject.group.groupCode,
      teacherFullName,
      subject: subjectName,
      lessonsAttendance: [
        {
          lessonNumber: schedule.lessonNumber,
          date: schedule.date.toISOString().split('T')[0],
          status: 'planned',
          scheduleId: schedule.scheduleId,
          subjectName: subjectName,
          teacherName: teacherFullName
        },
      ],
    };
  }

  private groupSchedules(schedules: any[]) {
    // Создаем Map для отслеживания уникальных комбинаций даты и номера пары
    const uniqueLessons = new Map<string, any>();

    const grouped = schedules.reduce(
      (acc, schedule) => {
        const groupCode = schedule.teacherGroupSubject.group.groupCode;
        const teacher = schedule.teacherGroupSubject.teacher.user;
        const subjectName = schedule.teacherGroupSubject.subject.name;
        const teacherFullName = `${teacher.surname} ${teacher.name} ${teacher.patronymic}`;

        const key = `${groupCode}|${teacherFullName}|${subjectName}`;

        if (!acc[key]) {
          acc[key] = {
            groupCode,
            teacherFullName,
            subject: subjectName,
            lessonsAttendance: [],
          };
        }

        // Создаем уникальный ключ для занятия
        const lessonKey = `${schedule.date.toISOString().split('T')[0]}|${schedule.lessonNumber}`;
        
        // Проверяем, нет ли уже занятия на эту дату и пару
        if (!uniqueLessons.has(lessonKey)) {
          uniqueLessons.set(lessonKey, schedule);
          
          acc[key].lessonsAttendance.push({
            lessonNumber: schedule.lessonNumber,
            date: schedule.date.toISOString().split('T')[0],
            status: 'planned',
            scheduleId: schedule.scheduleId,
            subjectName: subjectName,
            teacherName: teacherFullName
          });
        }

        return acc;
      },
      {} as Record<string, any>,
    );

    return Object.values(grouped);
  }

  async getGroupSchedule(groupId: string, query: GetGroupScheduleDto) {
    // Получаем группу
    const group = await this.prisma.group.findUnique({
      where: { groupId: parseInt(groupId) },
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    // Определяем период для фильтрации
    const now = new Date();
    const startDate = query.month
      ? new Date(query.month + '-01')
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = query.month
      ? new Date(now.getFullYear(), now.getMonth() + 1, 0)
      : new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Получаем все расписания для группы
    const schedules = await this.prisma.schedule.findMany({
      where: {
        teacherGroupSubject: {
          groupId: parseInt(groupId),
        },
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        teacherGroupSubject: {
          include: {
            teacher: {
              include: {
                user: true,
              },
            },
            subject: true,
          },
        },
      },
      orderBy: [
        { date: 'asc' },
        { lessonNumber: 'asc' },
      ],
    });

    // Создаем Map для отслеживания уникальных комбинаций даты и номера пары
    const uniqueLessons = new Map<string, any>();

    // Форматируем ответ и исключаем дубликаты
    const formattedSchedules = schedules
      .map(schedule => {
        const teacher = schedule.teacherGroupSubject.teacher.user;
        const teacherName = `${teacher.surname} ${teacher.name} ${teacher.patronymic}`;
        const date = new Date(schedule.date);
        const dayOfWeek = date.toLocaleDateString('ru-RU', { weekday: 'long' });
        const subjectName = schedule.teacherGroupSubject.subject.name;

        return {
          id: schedule.scheduleId.toString(),
          date: schedule.date.toISOString().split('T')[0],
          dayOfWeek,
          lessonNumber: schedule.lessonNumber,
          subjectName,
          teacherName,
          teachingAssignmentId: schedule.teacherGroupSubject.teacherGroupSubjectId.toString(),
          isException: false,
          exceptionDate: null,
        };
      })
      .filter(lesson => {
        // Создаем уникальный ключ для занятия, включая предмет
        const key = `${lesson.date}|${lesson.lessonNumber}|${lesson.subjectName}`;
        
        // Если такого занятия еще нет, добавляем его
        if (!uniqueLessons.has(key)) {
          uniqueLessons.set(key, lesson);
          return true;
        }
        return false;
      });

    return {
      groupId: group.groupId.toString(),
      groupName: group.groupCode,
      schedule: formattedSchedules,
    };
  }
}
