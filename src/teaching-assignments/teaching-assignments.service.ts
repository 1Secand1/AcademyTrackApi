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
        teacher: {
          connect: { teacherId: createTeachingAssignmentDto.teacherId },
        },
        group: { connect: { groupId: createTeachingAssignmentDto.groupId } },
        subject: {
          connect: { subjectId: createTeachingAssignmentDto.subjectId },
        },
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

  async findOne(teacherGroupSubjectId: number) {
    const teachingAssignment = await this.prisma.teacherGroupSubject.findUnique(
      {
        where: { teacherGroupSubjectId },
        include: {
          teacher: { include: { user: true } },
          group: true,
          subject: true,
        },
      },
    );

    if (!teachingAssignment) {
      throw new NotFoundException(
        `Teaching assignment with teacherGroupSubjectId ${teacherGroupSubjectId} not found`,
      );
    }

    return this.formatResponse(teachingAssignment);
  }

  async update(
    teacherGroupSubjectId: number,
    updateTeachingAssignmentDto: UpdateTeachingAssignmentDto,
  ) {
    await this.findOne(teacherGroupSubjectId);

    const updatedTeachingAssignment =
      await this.prisma.teacherGroupSubject.update({
        where: { teacherGroupSubjectId },
        data: {
          teacher: updateTeachingAssignmentDto.teacherId
            ? { connect: { teacherId: updateTeachingAssignmentDto.teacherId } }
            : undefined,
          group: updateTeachingAssignmentDto.groupId
            ? { connect: { groupId: updateTeachingAssignmentDto.groupId } }
            : undefined,
          subject: updateTeachingAssignmentDto.subjectId
            ? { connect: { subjectId: updateTeachingAssignmentDto.subjectId } }
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

  async remove(teacherGroupSubjectId: number) {
    await this.findOne(teacherGroupSubjectId);

    const deletedTeachingAssignment =
      await this.prisma.teacherGroupSubject.delete({
        where: { teacherGroupSubjectId },
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
      teachingAssignmentId: teachingAssignment.teacherGroupSubjectId,
      teacher: {
        id: teachingAssignment.teacher.teacherId,
        name: teachingAssignment.teacher.user.name,
        surname: teachingAssignment.teacher.user.surname,
      },
      group: {
        id: teachingAssignment.group.groupId,
        code: teachingAssignment.group.groupCode,
      },
      subject: {
        id: teachingAssignment.subject.subjectId,
        name: teachingAssignment.subject.name,
      },
    };
  }
}
