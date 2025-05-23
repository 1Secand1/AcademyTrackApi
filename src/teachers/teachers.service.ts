import { ConflictException, Injectable } from '@nestjs/common';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TeachersService {
  constructor(protected readonly prisma: PrismaService) {}

  // TODO заменить на юзер ДТО
  async create(createTeacherDto: CreateTeacherDto) {
    const { name, patronymic, surname } = createTeacherDto;

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

      const teachers = await prisma.teacher.create({
        data: {
          teacherId: user.userId,
        },
      });

      return teachers;
    });
  }

  async findAll(groupId?: number) {
    const whereCondition = groupId
      ? {
          subjects: {
            some: {
              groupId
            }
          }
        }
      : {};

    const teachers = await this.prisma.teacher.findMany({
      where: whereCondition,
      include: {
        user: true
      }
    });

    return teachers.map(teacher => ({
      teacherId: teacher.teacherId,
      surname: teacher.user.surname,
      name: teacher.user.name,
      patronymic: teacher.user.patronymic
    }));
  }

  async findOne(teacherId: number) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { teacherId },
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

    return { ...teacher, ...teacher.user, user: undefined };
  }

  async update(teacherId: number, updateTeacherDto: UpdateTeacherDto) {
    const teacher = await this.prisma.teacher.update({
      where: { teacherId },
      data: {
        user: {
          update: updateTeacherDto,
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

    console.log(teacher);

    return { ...teacher, ...teacher.user, user: undefined };
  }

  remove(teacherId: number) {
    return this.prisma.teacher.delete({
      where: { teacherId },
    });
  }
}
