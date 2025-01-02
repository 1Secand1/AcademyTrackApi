import { Injectable } from '@nestjs/common';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TeachersService {
  constructor(protected readonly prisma: PrismaService) {}

  // TODO заменить на юзер ДТО
  async create(createTeacherDto: CreateTeacherDto) {
    const user = await this.prisma.user.create({
      data: createTeacherDto,
    });

    return this.prisma.teacher.create({ data: { id: user.id } });
  }

  async findAll() {
    const teachers = await this.prisma.teacher.findMany({
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

    return teachers.map(({ user, ...teacher }) => ({
      id: teacher.id,
      ...user,
    }));
  }

  async findOne(id: number) {
    const teacher = await this.prisma.teacher.findUnique({
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

    return { ...teacher, ...teacher.user, user: undefined };
  }

  async update(id: number, updateTeacherDto: UpdateTeacherDto) {
    const teacher = await this.prisma.teacher.update({
      where: { id },
      data: {
        user: {
          update: updateTeacherDto,
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

    return { ...teacher, ...teacher.user, user: undefined };
  }

  remove(id: number) {
    return this.prisma.teacher.delete({
      where: { id: id },
    });
  }
}
