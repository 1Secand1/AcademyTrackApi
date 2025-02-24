import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TeachingAssignmentsService } from './teaching-assignments.service';
import { CreateTeachingAssignmentDto } from './dto/create-teaching-assignment.dto';
import { UpdateTeachingAssignmentDto } from './dto/update-teaching-assignment.dto';

@Controller('teaching-assignments')
export class TeachingAssignmentsController {
  constructor(
    private readonly teachingAssignmentsService: TeachingAssignmentsService,
  ) {}

  @Post()
  create(@Body() createTeachingAssignmentDto: CreateTeachingAssignmentDto) {
    return this.teachingAssignmentsService.create(createTeachingAssignmentDto);
  }

  @Get()
  findAll() {
    return this.teachingAssignmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teachingAssignmentsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTeachingAssignmentDto: UpdateTeachingAssignmentDto,
  ) {
    return this.teachingAssignmentsService.update(
      +id,
      updateTeachingAssignmentDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teachingAssignmentsService.remove(+id);
  }
}
