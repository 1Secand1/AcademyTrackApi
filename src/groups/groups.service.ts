import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class GroupsService {
  constructor(protected readonly prisma: PrismaService) {}

  async create(createGroupDto: CreateGroupDto) {
    const group = await this.prisma.group.create({
      data: createGroupDto,
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

    return this.formatResponse(group);
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

    return groups.map(this.formatResponse);
  }

  async findOne(groupId: number) {
    const group = await this.prisma.group.findUnique({
      where: { groupId },
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

    if (!group) {
      throw new NotFoundException(`Group with groupId ${groupId} not found`);
    }

    return this.formatResponse(group);
  }

  async update(groupId: number, updateGroupDto: UpdateGroupDto) {
    await this.findOne(groupId);

    const updatedGroup = await this.prisma.group.update({
      where: { groupId },
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

    return this.formatResponse(updatedGroup);
  }

  async remove(groupId: number) {
    await this.findOne(groupId);

    const deletedGroup = await this.prisma.group.delete({
      where: { groupId },
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

    return this.formatResponse(deletedGroup);
  }

  private formatResponse(group: any) {
    return group;
  }
}
