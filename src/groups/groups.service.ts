import { Injectable } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class GroupsService {
  constructor(protected readonly prisma: PrismaService) {}

  create(createGroupDto: CreateGroupDto) {
    return this.prisma.group.create({
      data: createGroupDto,
    });
  }

  async findAll() {
    const groups = await this.prisma.group.findMany({
      include: {
        students: {
          include: {
            user: {
              select: {
                name: true,
                surname: true,
                patronymic: true,
              },
            },
          },
        },
      },
    });

    const formatedGroups = groups.map((group) => ({
      ...group,
      students: group.students.map(({ user, userId }) => ({
        id: userId,
        ...user,
      })),
    }));

    return formatedGroups;
  }

  async findOne(id: number) {
    const groups = await this.prisma.group.findUnique({
      where: { id },
      include: {
        students: {
          include: {
            user: {
              select: {
                name: true,
                surname: true,
                patronymic: true,
              },
            },
          },
        },
      },
    });

    return {
      ...groups,
      students: groups.students.map(({ user, userId }) => ({
        id: userId,
        ...user,
      })),
    };
  }

  async update(id: number, updateGroupDto: UpdateGroupDto) {
    const groups = await this.prisma.group.update({
      where: { id },
      data: updateGroupDto,
      include: {
        students: {
          include: {
            user: {
              select: {
                name: true,
                surname: true,
                patronymic: true,
              },
            },
          },
        },
      },
    });

    return {
      ...groups,
      students: groups.students.map(({ user, userId }) => ({
        id: userId,
        ...user,
      })),
    };
  }

  remove(id: number) {
    return this.prisma.group.delete({
      where: { id },
    });
  }
}
