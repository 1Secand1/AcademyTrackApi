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

  async findOne(subjectId: number) {
    const subject = await this.prisma.subject.findUnique({
      where: { subjectId },
    });
    if (!subject) {
      throw new NotFoundException(`Subject with id ${subjectId} not found`);
    }
    return subject;
  }

  async update(subjectId: number, updateSubjectDto: UpdateSubjectDto) {
    await this.findOne(subjectId);

    const updatedSubject = await this.prisma.subject.update({
      where: { subjectId },
      data: updateSubjectDto,
    });
    return updatedSubject;
  }

  async remove(subjectId: number) {
    await this.findOne(subjectId);

    const deletedSubject = await this.prisma.subject.delete({
      where: { subjectId },
    });
    return deletedSubject;
  }
}
