import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupDetailsResponseDto } from './dto/group-details.dto';
import { GroupTeachersResponseDto } from './dto/group-teachers.dto';
import { GroupStudentsResponseDto } from './dto/group-students.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('groups')
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  create(@Body() createGroupDto: CreateGroupDto) {
    return this.groupsService.create(createGroupDto);
  }

  @Get()
  findAll() {
    return this.groupsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(+id);
  }

  @Get(':id/details')
  @ApiOperation({ summary: 'Get detailed information about a group' })
  @ApiResponse({
    status: 200,
    description: 'Returns detailed information about the group',
    type: GroupDetailsResponseDto,
  })
  getGroupDetails(@Param('id') id: string) {
    return this.groupsService.getGroupDetails(+id);
  }

  @Get(':id/teachers')
  @ApiOperation({ summary: 'Get list of teachers for a group' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of teachers with their subjects',
    type: GroupTeachersResponseDto,
  })
  getGroupTeachers(@Param('id') id: string) {
    return this.groupsService.getGroupTeachers(+id);
  }

  @Get(':id/students')
  @ApiOperation({ summary: 'Get list of students in a group' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of students with their attendance statistics',
    type: GroupStudentsResponseDto,
  })
  getGroupStudents(@Param('id') id: string) {
    return this.groupsService.getGroupStudents(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
    return this.groupsService.update(+id, updateGroupDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupsService.remove(+id);
  }
}
