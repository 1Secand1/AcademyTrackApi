import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SubjectService {
  constructor(private prisma: PrismaService) {}

  async create(createSubjectDto: CreateSubjectDto) {
    const subject = await this.prisma.subject.create({
      data: {
        name: createSubjectDto.name,
      },
    });
    return subject;
  }

  async findAll() {
    return this.prisma.subject.findMany();
  }

  async findOne(id: number) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
    });
    if (!subject) {
      throw new NotFoundException(`Subject with id ${id} not found`);
    }
    return subject;
  }

  async update(id: number, updateSubjectDto: UpdateSubjectDto) {
    await this.findOne(id);

    const updatedSubject = await this.prisma.subject.update({
      where: { id },
      data: updateSubjectDto,
    });
    return updatedSubject;
  }

  async remove(id: number) {
    await this.findOne(id);

    const deletedSubject = await this.prisma.subject.delete({
      where: { id },
    });
    return deletedSubject;
  }
}
