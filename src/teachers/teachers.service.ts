import { Injectable } from '@nestjs/common';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TeachersService {
  constructor(protected readonly prisma: PrismaService) {}

  create(createTeacherDto: CreateTeacherDto) {
    return this.prisma.teachers.create({
      data: createTeacherDto,
    });
  }

  findAll() {
    return this.prisma.teachers.findMany();
  }

  findOne(id: number) {
    return this.prisma.teachers.findUnique({
      where: { id: id },
    });
  }

  update(id: number, updateTeacherDto: UpdateTeacherDto) {
    return this.prisma.teachers.update({
      where: { id: id },
      data: updateTeacherDto,
    });
  }

  remove(id: number) {
    return this.prisma.teachers.delete({
      where: { id: id },
    });
  }
}
