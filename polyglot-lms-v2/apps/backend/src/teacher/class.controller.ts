import { Controller, Get, Param, UseGuards, Request, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Classes & Teacher Workflow')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('classes')
export class ClassController {
  constructor(private prisma: PrismaService) {}

  @Get('my-classes')
  @Roles('TEACHER', 'ACADEMIC_MANAGER')
  @ApiOperation({ summary: 'Get classes managed by the current teacher' })
  async getMyClasses(@Request() req: any) {
    const dbClasses = await this.prisma.class.findMany({
      where: {
        teacher_id: req.user.id
      },
      include: {
        course: true,
        _count: {
          select: { members: true }
        }
      }
    });

    return dbClasses.map(c => ({
      id: c.id,
      name: c.name,
      course_title: c.course.title,
      student_count: c._count.members,
      status: 'active'
    }));
  }

  @Get(':id/students')
  @Roles('TEACHER', 'ACADEMIC_MANAGER')
  @ApiOperation({ summary: 'Get list of students in a class' })
  async getClassStudents(@Param('id') id: string) {
    const members = await this.prisma.classMember.findMany({
      where: { class_id: id },
      include: {
        student: {
          include: { student_profile: true }
        }
      }
    });

    return members.map(m => ({
      id: m.student.id,
      name: m.student.student_profile?.full_name || m.student.email,
      email: m.student.email,
      joined_at: m.joined_at,
      progress: Math.floor(Math.random() * 100) // Mocked progress 
    }));
  }
}
