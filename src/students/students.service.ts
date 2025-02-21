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
      where: { id: groupId },
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
          userId: user.id,
          groupId,
        },
      });

      return student;
    });
  }

  async findAll() {
    const students = await this.prisma.student.findMany({
      include: {
        group: {
          select: {
            groupCode: true,
          },
        },
        user: {
          select: {
            name: true,
            surname: true,
            patronymic: true,
          },
        },
      },
    });

    return students.map(({ user, group, ...student }) => ({
      id: student.id,
      ...group,
      ...user,
    }));
  }

  async findOne(id: number) {
    const student = await this.prisma.student.findUnique({
      where: { id },
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

  async update(id: number, updateStudentDto: UpdateStudentDto) {
    const student = await this.prisma.student.update({
      where: { id },
      data: {
        user: {
          update: updateStudentDto,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            surname: true,
            patronymic: true,
          },
        },
      },
    });

    return { ...student, ...student.user, user: undefined };
  }

  remove(id: number) {
    return this.prisma.student.delete({
      where: { id },
    });
  }
}
