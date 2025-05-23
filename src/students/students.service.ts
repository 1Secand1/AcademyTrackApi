import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class StudentsService {
  constructor(protected readonly prisma: PrismaService) {}

  async create(createStudentDto: CreateStudentDto) {
    const { name, patronymic, surname, groupId } = createStudentDto;

    const groupExists = await this.prisma.group.findUnique({
      where: { groupId },
    });

    if (!groupExists) {
      throw new NotFoundException('Group does not exist');
    }

    const existingUser = await this.prisma.user.findFirst({
      where: {
        name,
        patronymic,
        surname,
      },
    });

    if (existingUser) {
      throw new ConflictException(
        'User with the same name, patronymic, and surname already exists',
      );
    }

    return this.prisma.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: {
          name,
          patronymic,
          surname,
        },
      });

      const student = await prisma.student.create({
        data: {
          studentId: user.userId,
          groupId,
        },
      });

      return student;
    });
  }

  async findAll(teachingAssignmentId?: number) {
    const whereCondition = teachingAssignmentId
      ? {
          group: {
            teacherSubjects: {
              some: {
                teacherGroupSubjectId: teachingAssignmentId
              }
            }
          }
        }
      : {};

    const students = await this.prisma.student.findMany({
      where: whereCondition,
      include: {
        user: true,
        group: true
      }
    });

    return students.map(student => ({
      studentId: student.studentId,
      fullName: `${student.user.surname} ${student.user.name} ${student.user.patronymic || ''}`,
      name: student.user.name,
      surname: student.user.surname,
      patronymic: student.user.patronymic,
      groupId: student.groupId,
      groupCode: student.group.groupCode
    }));
  }

  async findOne(studentId: number) {
    const student = await this.prisma.student.findUnique({
      where: { studentId },
      include: {
        user: {
          select: {
            name: true,
            surname: true,
            patronymic: true,
          },
        },
      },
    });

    return { ...student, ...student.user, user: undefined };
  }

  async update(studentId: number, updateStudentDto: UpdateStudentDto) {
    const { groupId, name, surname, patronymic } = updateStudentDto;
    const student = await this.prisma.student.update({
      where: { studentId },
      data: {
        group: {
          connect: { groupId: groupId },
        },
        user: {
          update: {
            name,
            surname,
            patronymic,
          },
        },
      },
      include: {
        user: {
          select: {
            userId: true,
            name: true,
            surname: true,
            patronymic: true,
          },
        },
      },
    });

    return { ...student };
  }

  remove(studentId: number) {
    return this.prisma.student.delete({
      where: { studentId },
    });
  }
}
