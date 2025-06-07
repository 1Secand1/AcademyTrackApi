import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import {
  GroupAttendanceSummaryDto,
  StudentAttendanceDto,
} from './dto/group-attendance-summary.dto';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAttendanceDto: CreateAttendanceDto) {
    const { scheduleId, studentId } = createAttendanceDto;

    const schedule = await this.prisma.schedule.findUnique({
      where: { scheduleId },
      include: { group: true },
    });

    if (!schedule) {
      throw new NotFoundException('Расписание не найдено');
    }

    const student = await this.prisma.student.findUnique({
      where: { studentId },
      include: { group: true },
    });

    if (!student) {
      throw new NotFoundException('Студент не найден');
    }

    if (student.groupId !== schedule.groupId) {
      throw new BadRequestException('Студент не принадлежит к этой группе');
    }

    return this.prisma.attendance.create({
      data: {
        scheduleId,
        studentId,
      },
    });
  }

  async findAll(groupId?: number, teachingAssignmentId?: number) {
    const whereCondition: any = {};

    if (groupId) {
      whereCondition.schedule = {
        teacherGroupSubject: {
          groupId: groupId,
        },
      };
    }

    if (teachingAssignmentId) {
      whereCondition.schedule = {
        ...whereCondition.schedule,
        teacherGroupSubjectId: teachingAssignmentId,
      };
    }

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

  async update(attendanceId: number, updateAttendanceDto: UpdateAttendanceDto) {
    const { scheduleId, studentId } = updateAttendanceDto;

    const attendance = await this.prisma.attendance.findUnique({
      where: { attendanceId },
    });

    if (!attendance) {
      throw new NotFoundException('Запись о посещаемости не найдена');
    }

    const schedule = await this.prisma.schedule.findUnique({
      where: { scheduleId },
      include: { group: true },
    });

    if (!schedule) {
      throw new NotFoundException('Расписание не найдено');
    }

    const student = await this.prisma.student.findUnique({
      where: { studentId },
      include: { group: true },
    });

    if (!student) {
      throw new NotFoundException('Студент не найден');
    }

    if (student.groupId !== schedule.groupId) {
      throw new BadRequestException('Студент не принадлежит к этой группе');
    }

    return this.prisma.attendance.update({
      where: { attendanceId },
      data: {
        scheduleId,
        studentId,
      },
    });
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
      map[studentId].attendance[date] = 'present';
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

  async getGroupAttendanceSummary(groupId: number) {
    const group = await this.prisma.group.findUnique({
      where: { groupId },
      include: {
        students: {
          include: {
            user: true,
            attendance: {
              include: {
                schedule: true,
              },
            },
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException('Группа не найдена');
    }

    const attendanceMap = new Map<
      number,
      {
        student: { studentId: number; fullName: string };
        attendance: Record<string, string>;
        total: number;
        present: number;
      }
    >();

    group.students.forEach((student) => {
      attendanceMap.set(student.studentId, {
        student: {
          studentId: student.studentId,
          fullName:
            `${student.user.surname} ${student.user.name} ${student.user.patronymic || ''}`.trim(),
        },
        attendance: {},
        total: 0,
        present: 0,
      });
    });

    group.students.forEach((student) => {
      student.attendance.forEach((att) => {
        const date = att.schedule.date.toISOString().split('T')[0];
        const map = attendanceMap.get(student.studentId);
        if (map) {
          map.attendance[date] = 'present';
          map.total++;
          map.present++;
        }
      });
    });

    const summary = Array.from(attendanceMap.values()).map((item) => ({
      student: item.student,
      attendance: item.attendance,
      percentage:
        item.total > 0 ? Math.round((item.present / item.total) * 100) : 0,
    }));

    return {
      groupId: group.groupId,
      groupCode: group.groupCode,
      totalStudents: group.students.length,
      averageAttendance:
        summary.length > 0
          ? Math.round(
              summary.reduce((acc, curr) => acc + curr.percentage, 0) /
                summary.length,
            )
          : 0,
      students: summary,
    };
  }
}
