import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { PrismaService } from '../prisma.service';
import { GroupDetailsResponseDto } from './dto/group-details.dto';
import { GroupStudentsResponseDto } from './dto/group-students.dto';

@Injectable()
export class GroupsService {
  constructor(protected readonly prisma: PrismaService) {}

  async create(createGroupDto: CreateGroupDto) {
    try {
      const group = await this.prisma.group.create({
        data: {
          ...createGroupDto,
          name: createGroupDto.name || '',
          specialty: createGroupDto.specialty || '',
          course: createGroupDto.course || 1,
        },
        include: {
          students: {
            include: {
              user: {
                select: {
                  name: true,
                  surname: true,
                  patronymic: true,
                },
              },
            },
          },
        },
      });

      return this.formatResponse(group);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Group with this code already exists');
      }
      if (error.code === 'P2000') {
        throw new BadRequestException(
          'Group code is too long (maximum 15 characters)',
        );
      }
      throw error;
    }
  }

  async findAll() {
    const groups = await this.prisma.group.findMany({
      include: {
        students: {
          include: {
            user: {
              select: {
                name: true,
                surname: true,
                patronymic: true,
              },
            },
          },
        },
      },
    });

    return groups.map(this.formatResponse);
  }

  async findOne(groupId: number) {
    const group = await this.prisma.group.findUnique({
      where: { groupId },
      include: {
        students: {
          include: {
            user: {
              select: {
                name: true,
                surname: true,
                patronymic: true,
              },
            },
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException(`Group with groupId ${groupId} not found`);
    }

    return this.formatResponse(group);
  }

  async update(groupId: number, updateGroupDto: UpdateGroupDto) {
    await this.findOne(groupId);

    const updatedGroup = await this.prisma.group.update({
      where: { groupId },
      data: updateGroupDto,
      include: {
        students: {
          include: {
            user: {
              select: {
                name: true,
                surname: true,
                patronymic: true,
              },
            },
          },
        },
      },
    });

    return this.formatResponse(updatedGroup);
  }

  async remove(groupId: number) {
    await this.findOne(groupId);

    const deletedGroup = await this.prisma.group.delete({
      where: { groupId },
      include: {
        students: {
          include: {
            user: {
              select: {
                name: true,
                surname: true,
                patronymic: true,
              },
            },
          },
        },
      },
    });

    return this.formatResponse(deletedGroup);
  }

  private formatStudent(student: any) {
    return {
      id: student.studentId,
      fullName:
        `${student.user.surname} ${student.user.name} ${student.user.patronymic || ''}`.trim(),
    };
  }

  async getGroupDetails(groupId: number): Promise<GroupDetailsResponseDto> {
    const group = await this.prisma.group.findUnique({
      where: { groupId },
      include: {
        students: {
          include: {
            user: true,
          },
        },
        teacherSubjects: {
          include: {
            teacher: {
              include: {
                user: true,
                subjects: {
                  include: {
                    subject: true,
                  },
                },
              },
            },
            subject: true,
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    // Get attendance stats
    const attendanceStats = await this.getAttendanceStats(groupId);

    return {
      id: group.groupId,
      code: group.groupCode,
      name: group.name || '',
      specialty: group.specialty || '',
      course: group.course || 1,
      yearOfEntry: group.yearOfEntry,
      students: group.students.map((student) => ({
        id: student.studentId,
        fullName:
          `${student.user.surname} ${student.user.name} ${student.user.patronymic || ''}`.trim(),
      })),
      teachers: group.teacherSubjects.map((ts) => ({
        id: ts.teacher.teacherId,
        fullName:
          `${ts.teacher.user.surname} ${ts.teacher.user.name} ${ts.teacher.user.patronymic || ''}`.trim(),
        subjects: ts.teacher.subjects.map((s) => ({
          id: s.subject.subjectId,
          name: s.subject.name,
          semester: s.semester,
        })),
        roles: ['teacher'],
      })),
      subjects: group.teacherSubjects.map((ts) => ({
        id: ts.subject.subjectId,
        name: ts.subject.name,
        semester: ts.semester,
      })),
      teachingAssignments: group.teacherSubjects.map((ts) => ({
        id: ts.teacherGroupSubjectId,
        teacherId: ts.teacherId,
        subjectId: ts.subjectId,
        semester: ts.semester,
      })),
      attendanceStats,
    };
  }

  private async getAttendanceStats(groupId: number) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const attendance = await this.prisma.attendance.findMany({
      where: {
        student: {
          groupId,
        },
        schedule: {
          date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      },
      include: {
        schedule: true,
      },
    });

    const totalLessons = attendance.length;
    const average = totalLessons > 0 ? 100 : 0;

    return {
      average: Math.round(average),
      byMonth: {
        [now.toISOString().slice(0, 7)]: Math.round(average),
      },
    };
  }

  async getGroupTeachers(groupId: number) {
    const group = await this.prisma.group.findUnique({
      where: { groupId },
      include: {
        teacherSubjects: {
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
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    // Group teachers by teacherId to avoid duplicates
    const teachersMap = new Map();

    group.teacherSubjects.forEach((ts) => {
      const teacher = ts.teacher;
      if (!teachersMap.has(teacher.teacherId)) {
        teachersMap.set(teacher.teacherId, {
          id: teacher.teacherId,
          fullName:
            `${teacher.user.surname} ${teacher.user.name} ${teacher.user.patronymic || ''}`.trim(),
          subjects: [],
        });
      }

      const teacherData = teachersMap.get(teacher.teacherId);
      teacherData.subjects.push({
        id: ts.subject.subjectId,
        name: ts.subject.name,
        semester: ts.semester,
      });
    });

    return {
      teachers: Array.from(teachersMap.values()),
    };
  }

  async getGroupStudents(groupId: number): Promise<GroupStudentsResponseDto> {
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
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    const students = group.students.map((student) => {
      const totalLessons = student.attendance.length;
      const attendancePercentage = totalLessons > 0 ? 100 : 0;

      return {
        id: student.studentId,
        fullName: `${student.user.surname} ${student.user.name} ${
          student.user.patronymic || ''
        }`.trim(),
        attendancePercentage,
      };
    });

    return {
      students,
    };
  }

  private formatResponse(group: any) {
    return group;
  }
}
