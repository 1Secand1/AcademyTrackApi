import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateTeachingAssignmentDto } from './dto/create-teaching-assignment.dto';
import { UpdateTeachingAssignmentDto } from './dto/update-teaching-assignment.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TeachingAssignmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createTeachingAssignmentDto: CreateTeachingAssignmentDto) {
    try {
      // Проверка на существование такого назначения
      const existing = await this.prisma.teacherGroupSubject.findFirst({
        where: {
          groupId: createTeachingAssignmentDto.groupId,
          subjectId: createTeachingAssignmentDto.subjectId,
          semester: createTeachingAssignmentDto.semester || 1
        }
      });

      if (existing) {
        throw new ConflictException('Teaching assignment already exists');
      }

      const teachingAssignment = await this.prisma.teacherGroupSubject.create({
        data: {
          teacher: {
            connect: { teacherId: createTeachingAssignmentDto.teacherId },
          },
          group: { connect: { groupId: createTeachingAssignmentDto.groupId } },
          subject: {
            connect: { subjectId: createTeachingAssignmentDto.subjectId },
          },
          semester: createTeachingAssignmentDto.semester || 1
        },
        include: {
          teacher: { include: { user: true } },
          group: { include: { students: true } },
          subject: true,
        },
      });

      return this.formatResponse(teachingAssignment);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      if (error.code === 'P2025') {
        throw new NotFoundException('Teacher, group or subject not found');
      }
      throw error;
    }
  }

  async findAll(teacherId?: number) {
    const whereCondition = teacherId ? { teacherId } : {};

    const teachingAssignments = await this.prisma.teacherGroupSubject.findMany({
      where: whereCondition,
      include: {
        teacher: { include: { user: true } },
        group: { include: { students: true } },
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
          group: { include: { students: true } },
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
    try {
      await this.findOne(teacherGroupSubjectId);

      // Проверка на существование такого назначения при обновлении
      if (updateTeachingAssignmentDto.groupId && updateTeachingAssignmentDto.subjectId) {
        const existing = await this.prisma.teacherGroupSubject.findFirst({
          where: {
            groupId: updateTeachingAssignmentDto.groupId,
            subjectId: updateTeachingAssignmentDto.subjectId,
            semester: updateTeachingAssignmentDto.semester || 1,
            teacherGroupSubjectId: { not: teacherGroupSubjectId }
          }
        });

        if (existing) {
          throw new ConflictException('Teaching assignment already exists');
        }
      }

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
            semester: updateTeachingAssignmentDto.semester
          },
          include: {
            teacher: { include: { user: true } },
            group: { include: { students: true } },
            subject: true,
          },
        });

      return this.formatResponse(updatedTeachingAssignment);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      if (error.code === 'P2025') {
        throw new NotFoundException('Teacher, group or subject not found');
      }
      throw error;
    }
  }

  async remove(teacherGroupSubjectId: number) {
    await this.findOne(teacherGroupSubjectId);

    // Сначала удаляем все связанные записи из расписания
    await this.prisma.schedule.deleteMany({
      where: { teacherGroupSubjectId }
    });

    const deletedTeachingAssignment =
      await this.prisma.teacherGroupSubject.delete({
        where: { teacherGroupSubjectId },
        include: {
          teacher: { include: { user: true } },
          group: { include: { students: true } },
          subject: true,
        },
      });

    return this.formatResponse(deletedTeachingAssignment);
  }

  private formatResponse(teachingAssignment: any) {
    return {
      teachingAssignmentId: teachingAssignment.teacherGroupSubjectId,
      group: {
        groupId: teachingAssignment.group.groupId,
        code: teachingAssignment.group.groupCode,
        course: teachingAssignment.group.yearOfEntry,
        specialty: teachingAssignment.group.groupCode.split('-')[0],
        numberOfStudents: teachingAssignment.group.students?.length || 0
      },
      subject: {
        subjectId: teachingAssignment.subject.subjectId,
        name: teachingAssignment.subject.name
      },
      teacher: {
        teacherId: teachingAssignment.teacher.teacherId,
        surname: teachingAssignment.teacher.user.surname,
        name: teachingAssignment.teacher.user.name,
        patronymic: teachingAssignment.teacher.user.patronymic
      },
      semester: teachingAssignment.semester
    };
  }
}
