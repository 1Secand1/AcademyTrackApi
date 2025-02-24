import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTeachingAssignmentDto } from './dto/create-teaching-assignment.dto';
import { UpdateTeachingAssignmentDto } from './dto/update-teaching-assignment.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TeachingAssignmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createTeachingAssignmentDto: CreateTeachingAssignmentDto) {
    const teachingAssignment = await this.prisma.teacherGroupSubject.create({
      data: {
        teacher: { connect: { id: createTeachingAssignmentDto.teacherId } },
        group: { connect: { id: createTeachingAssignmentDto.groupId } },
        subject: { connect: { id: createTeachingAssignmentDto.subjectId } },
      },
      include: {
        teacher: { include: { user: true } },
        group: true,
        subject: true,
      },
    });

    return this.formatResponse(teachingAssignment);
  }

  async findAll() {
    const teachingAssignments = await this.prisma.teacherGroupSubject.findMany({
      include: {
        teacher: { include: { user: true } },
        group: true,
        subject: true,
      },
    });

    return teachingAssignments.map(this.formatResponse);
  }

  async findOne(id: number) {
    const teachingAssignment = await this.prisma.teacherGroupSubject.findUnique(
      {
        where: { id },
        include: {
          teacher: { include: { user: true } },
          group: true,
          subject: true,
        },
      },
    );

    if (!teachingAssignment) {
      throw new NotFoundException(
        `Teaching assignment with id ${id} not found`,
      );
    }

    return this.formatResponse(teachingAssignment);
  }

  async update(
    id: number,
    updateTeachingAssignmentDto: UpdateTeachingAssignmentDto,
  ) {
    await this.findOne(id);

    const updatedTeachingAssignment =
      await this.prisma.teacherGroupSubject.update({
        where: { id },
        data: {
          teacher: updateTeachingAssignmentDto.teacherId
            ? { connect: { id: updateTeachingAssignmentDto.teacherId } }
            : undefined,
          group: updateTeachingAssignmentDto.groupId
            ? { connect: { id: updateTeachingAssignmentDto.groupId } }
            : undefined,
          subject: updateTeachingAssignmentDto.subjectId
            ? { connect: { id: updateTeachingAssignmentDto.subjectId } }
            : undefined,
        },
        include: {
          teacher: { include: { user: true } },
          group: true,
          subject: true,
        },
      });

    return this.formatResponse(updatedTeachingAssignment);
  }

  async remove(id: number) {
    await this.findOne(id);

    const deletedTeachingAssignment =
      await this.prisma.teacherGroupSubject.delete({
        where: { id },
        include: {
          teacher: { include: { user: true } },
          group: true,
          subject: true,
        },
      });

    return this.formatResponse(deletedTeachingAssignment);
  }

  private formatResponse(teachingAssignment: any) {
    return {
      id: teachingAssignment.id,
      teacher: {
        id: teachingAssignment.teacher.id,
        name: teachingAssignment.teacher.user.name,
        surname: teachingAssignment.teacher.user.surname,
      },
      group: {
        id: teachingAssignment.group.id,
        code: teachingAssignment.group.groupCode,
      },
      subject: {
        id: teachingAssignment.subject.id,
        name: teachingAssignment.subject.name,
      },
    };
  }
}
