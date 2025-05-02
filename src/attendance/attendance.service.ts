import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAttendanceDto: CreateAttendanceDto) {
    const { scheduleId, students } = createAttendanceDto;

    const scheduleExists = await this.prisma.schedule.findUnique({
      where: { scheduleId },
    });
    if (!scheduleExists) {
      throw new NotFoundException(`Schedule with ID ${scheduleId} not found`);
    }

    const createdAttendances = [];

    for (const studentAttendance of students) {
      const existing = await this.prisma.attendance.findFirst({
        where: {
          scheduleId,
          studentId: studentAttendance.studentId,
        },
      });

      if (existing) {
        throw new ConflictException(
          `Attendance already exists for student ${studentAttendance.studentId} on schedule ${scheduleId}`,
        );
      }

      const created = await this.prisma.attendance.create({
        data: {
          schedule: { connect: { scheduleId } },
          student: { connect: { studentId: studentAttendance.studentId } },
          status: studentAttendance.status,
        },
        include: {
          schedule: {
            include: {
              teacherGroupSubject: {
                include: {
                  teacher: { include: { user: true } },
                  group: true,
                  subject: true,
                },
              },
            },
          },
          student: { include: { user: true } },
        },
      });

      createdAttendances.push(created);
    }

    const grouped = this.groupAttendances(createdAttendances);
    return Object.values(grouped).map((group) => this.formatResponse(group));
  }

  async findAll(groupId?: number) {
    const whereCondition = groupId
      ? {
          schedule: {
            teacherGroupSubject: {
              groupId: groupId,
            },
          },
        }
      : {};

    const attendances = await this.prisma.attendance.findMany({
      where: whereCondition,
      include: {
        schedule: {
          include: {
            teacherGroupSubject: {
              include: {
                teacher: { include: { user: true } },
                group: true,
                subject: true,
              },
            },
          },
        },
        student: { include: { user: true } },
      },
      orderBy: { schedule: { date: 'asc' } },
    });

    const grouped = this.groupAttendances(attendances);
    return Object.values(grouped).map((group) => this.formatResponse(group));
  }

  async findOne(attendanceId: number) {
    const attendance = await this.prisma.attendance.findUnique({
      where: { attendanceId },
      include: {
        schedule: {
          include: {
            teacherGroupSubject: {
              include: {
                teacher: { include: { user: true } },
                group: true,
                subject: true,
              },
            },
          },
        },
        student: { include: { user: true } },
      },
    });
    if (!attendance) {
      throw new NotFoundException(
        `Attendance with ID ${attendanceId} not found`,
      );
    }

    const attendances = await this.prisma.attendance.findMany({
      where: {
        schedule: {
          teacherGroupSubject: {
            teacherGroupSubjectId:
              attendance.schedule.teacherGroupSubject.teacherGroupSubjectId,
          },
        },
      },
      include: {
        schedule: {
          include: {
            teacherGroupSubject: {
              include: {
                teacher: { include: { user: true } },
                group: true,
                subject: true,
              },
            },
          },
        },
        student: { include: { user: true } },
      },
    });

    return this.formatResponse(attendances);
  }

  async update(scheduleId: number, updateAttendanceDto: UpdateAttendanceDto) {
    const { students } = updateAttendanceDto;

    const schedule = await this.prisma.schedule.findUnique({
      where: { scheduleId },
      include: { teacherGroupSubject: true },
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${scheduleId} not found`);
    }

    const updatedAttendances = [];

    for (const student of students) {
      const existingAttendance = await this.prisma.attendance.findFirst({
        where: {
          scheduleId,
          studentId: student.studentId,
        },
      });

      if (!existingAttendance) {
        throw new NotFoundException(
          `Attendance not found for student ${student.studentId} and schedule ${scheduleId}`,
        );
      }

      const updated = await this.prisma.attendance.update({
        where: { attendanceId: existingAttendance.attendanceId },
        data: { status: student.status },
        include: {
          schedule: {
            include: {
              teacherGroupSubject: {
                include: {
                  teacher: { include: { user: true } },
                  group: true,
                  subject: true,
                },
              },
            },
          },
          student: { include: { user: true } },
        },
      });

      updatedAttendances.push(updated);
    }

    const grouped = this.groupAttendances(updatedAttendances);
    return Object.values(grouped).map((group) => this.formatResponse(group));
  }

  async remove(attendanceId: number) {
    const attendance = await this.findOne(attendanceId);
    const teacherGroupSubjectId = attendance.teacherGroupSubjectId;
    await this.prisma.attendance.deleteMany({
      where: {
        schedule: {
          teacherGroupSubject: {
            teacherGroupSubjectId,
          },
        },
      },
    });
    return attendance;
  }

  private groupAttendances(attendances: any[]): Record<string, any[]> {
    return attendances.reduce((acc, att) => {
      const key = att.schedule.teacherGroupSubject.teacherGroupSubjectId;
      if (!acc[key]) acc[key] = [];
      acc[key].push(att);
      return acc;
    }, {});
  }

  private formatResponse(attendances: any[]): any {
    if (!attendances || attendances.length === 0) return null;
    const first = attendances[0];
    const teacherFullName = `${first.schedule.teacherGroupSubject.teacher.user.surname} ${first.schedule.teacherGroupSubject.teacher.user.name} ${first.schedule.teacherGroupSubject.teacher.user.patronymic}`;
    const groupCode = first.schedule.teacherGroupSubject.group.groupCode;
    const subjectName = first.schedule.teacherGroupSubject.subject.name;

    const latest = attendances.reduce((prev, curr) =>
      curr.schedule.date > prev.schedule.date ? curr : prev,
    );
    const dateOfTheLastLesson = latest.schedule.date
      .toISOString()
      .split('T')[0];
    const lessonNumber = latest.schedule.lessonNumber;

    const studentMap = attendances.reduce((map, att) => {
      const studentId = att.student.studentId;
      const fullName = `${att.student.user.surname} ${att.student.user.name} ${att.student.user.patronymic}`;
      const date = att.schedule.date.toISOString().split('T')[0];
      if (!map[studentId]) {
        map[studentId] = { studentId, fullName, attendance: {} };
      }
      map[studentId].attendance[date] = att.status.toLowerCase();
      return map;
    }, {});

    const students = Object.values(studentMap);

    return {
      dateOfTheLastLesson,
      subjectName,
      teacherFullName,
      groupCode,
      lessonNumber,
      totalStudents: students.length,
      students,
    };
  }
}
