import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAttendanceDto: CreateAttendanceDto) {
    const { subjectId, groupId, date, students } = createAttendanceDto;

    const attendanceDate = new Date(date);

    const createdAttendances = await Promise.all(
      students.map((studentAttendance) =>
        this.prisma.attendance.create({
          data: {
            subject: { connect: { subjectId } },
            group: { connect: { groupId } },
            date: attendanceDate,
            student: { connect: { studentId: studentAttendance.studentId } },
            status: studentAttendance.status,
          },
          include: {
            subject: true,
            group: true,
            student: { include: { user: true } },
          },
        }),
      ),
    );

    return createdAttendances.map(this.formatResponse);
  }

  async findAll() {
    const attendances = await this.prisma.attendance.findMany({
      include: {
        subject: true,
        group: true,
        student: { include: { user: true } },
      },
    });
    return attendances.map(this.formatResponse);
  }

  async findOne(attendanceId: number) {
    const attendance = await this.prisma.attendance.findUnique({
      where: { attendanceId },
      include: {
        subject: true,
        group: true,
        student: { include: { user: true } },
      },
    });
    if (!attendance) {
      throw new NotFoundException(
        `Attendance with ID ${attendanceId} not found`,
      );
    }
    return this.formatResponse(attendance);
  }

  async update(attendanceId: number, updateAttendanceDto: UpdateAttendanceDto) {
    await this.findOne(attendanceId);

    const updatedAttendance = await this.prisma.attendance.update({
      where: { attendanceId },
      data: {
        date: updateAttendanceDto.date
          ? new Date(updateAttendanceDto.date)
          : undefined,
        status: updateAttendanceDto.status,
      },
      include: {
        subject: true,
        group: true,
        student: { include: { user: true } },
      },
    });
    return this.formatResponse(updatedAttendance);
  }

  async remove(attendanceId: number) {
    await this.findOne(attendanceId);
    const deletedAttendance = await this.prisma.attendance.delete({
      where: { attendanceId },
      include: {
        subject: true,
        group: true,
        student: { include: { user: true } },
      },
    });
    return this.formatResponse(deletedAttendance);
  }

  private formatResponse(attendance: any) {
    return {
      groupId: attendance.group.groupId,
      attendanceId: attendance.attendanceId,
      subjectId: attendance.subject.subjectId,
      studentId: attendance.student.studentId,
      date: attendance.date,
      status: attendance.status,
      subjectName: attendance.subject.name,
      groupCode: attendance.group.groupCode,
      studentName: `${attendance.student.user.name} ${attendance.student.user.surname}`,
    };
  }
}
