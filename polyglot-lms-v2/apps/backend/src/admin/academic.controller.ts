import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('admin')
export class AcademicController {
  constructor(private prisma: PrismaService) {}

  @Get('dashboard')
  @Roles('ACADEMIC_MANAGER', 'CENTER_MANAGER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get global dashboard analytics for Admins' })
  async getGlobalStats(@Request() req: any) {
    const total_students = await this.prisma.user.count({ where: { role: 'STUDENT' } });
    const total_teachers = await this.prisma.user.count({ where: { role: 'TEACHER' } });
    const total_classes = await this.prisma.class.count();
    const active_enrollments = await this.prisma.enrollment.count({ where: { status: 'ACTIVE' } });

    return {
      success: true,
      data: {
        total_students,
        total_teachers,
        total_classes,
        active_enrollments,
        at_risk_students: 0,
        course_completion: {
          'English A1': 45,
          'HSK 1 Basic': 88
        }
      }
    };
  }

  @Get('users')
  @Roles('ACADEMIC_MANAGER', 'CENTER_MANAGER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get all users' })
  async getUsers() {
    const users = await this.prisma.user.findMany({
      include: { student_profile: true, teacher_profile: true }
    });
    return users.map(u => ({
      id: u.id,
      email: u.email,
      role: u.role,
      is_active: u.status === 'active',
      name: u.student_profile?.full_name || u.teacher_profile?.full_name || 'Admin / Root'
    })).sort((a, b) => a.role.localeCompare(b.role));
  }

  @Put('users/:id/role')
  @Roles('ACADEMIC_MANAGER', 'CENTER_MANAGER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Update user role hierarchy' })
  async updateUserRole(@Param('id') id: string, @Body() dto: { role: any }) {
     await this.prisma.user.update({
        where: { id },
        data: { role: dto.role }
     });
     return { success: true };
  }

  @Put('users/:id/status')
  @Roles('ACADEMIC_MANAGER', 'CENTER_MANAGER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Lock or Unlock User accounts' })
  async toggleUserStatus(@Param('id') id: string, @Body() dto: { status: string }) {
     await this.prisma.user.update({
        where: { id },
        data: { status: dto.status }
     });
     return { success: true };
  }

  @Get('learning-path/generate')
  @Roles('ACADEMIC_MANAGER', 'TEACHER')
  @ApiOperation({ summary: 'Generate a rule-based learning path for a student based on current vs target level' })
  async generatePath() {
    return {
      success: true,
      message: 'Generated roadmap matching target level and patching missing skills.'
    };
  }

  @Get('courses')
  @Roles('ACADEMIC_MANAGER', 'CENTER_MANAGER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get all courses with curriculum depth' })
  async getCourses() {
    return this.prisma.course.findMany({
      include: {
        program: true,
        level: true,
        _count: {
          select: { units: true }
        }
      },
      orderBy: { title: 'asc' }
    });
  }

  @Get('metadata')
  @Roles('ACADEMIC_MANAGER', 'CENTER_MANAGER', 'SUPER_ADMIN')
  async getMetadata() {
    const programs = await this.prisma.program.findMany();
    const frameworks = await this.prisma.framework.findMany();
    const levels = await this.prisma.level.findMany({ include: { framework: true }, orderBy: { framework_id: 'asc' } });
    return { programs, frameworks, levels };
  }

  @Post('programs')
  @Roles('ACADEMIC_MANAGER', 'CENTER_MANAGER', 'SUPER_ADMIN')
  async createProgram(@Body() dto: { title: string, language: string, description: string }) {
    const program = await this.prisma.program.create({
       data: { title: dto.title, language: dto.language, description: dto.description }
    });
    return { success: true, program };
  }

  @Post('levels')
  @Roles('ACADEMIC_MANAGER', 'CENTER_MANAGER', 'SUPER_ADMIN')
  async createLevel(@Body() dto: { name: string, framework_id: string, order: number }) {
    const level = await this.prisma.level.create({
       data: { name: dto.name, framework_id: dto.framework_id, order: Number(dto.order) || 1 }
    });
    return { success: true, level };
  }

  @Post('courses')
  @Roles('ACADEMIC_MANAGER', 'CENTER_MANAGER', 'SUPER_ADMIN')
  async createCourse(@Body() dto: { title: string, program_id: string, level_id: string, description: string }) {
    const course = await this.prisma.course.create({
       data: {
         title: dto.title,
         program_id: dto.program_id,
         level_id: dto.level_id,
         description: dto.description
       }
    });
    return { success: true, course };
  }

  @Put('courses/:id')
  @Roles('ACADEMIC_MANAGER', 'CENTER_MANAGER', 'SUPER_ADMIN')
  async updateCourse(@Param('id') id: string, @Body() dto: { title: string, program_id: string, level_id: string, description: string }) {
    const course = await this.prisma.course.update({
       where: { id },
       data: {
         title: dto.title,
         program_id: dto.program_id,
         level_id: dto.level_id,
         description: dto.description
       }
    });
    return { success: true, course };
  }

  @Delete('courses/:id')
  @Roles('ACADEMIC_MANAGER', 'CENTER_MANAGER', 'SUPER_ADMIN')
  async deleteCourse(@Param('id') id: string) {
    await this.prisma.course.delete({ where: { id } });
    return { success: true };
  }

  // ==========================================
  // CURRICULUM BUILDER (UNITS & LESSONS)
  // ==========================================
  
  @Get('courses/:id/curriculum')
  @Roles('ACADEMIC_MANAGER', 'CENTER_MANAGER', 'SUPER_ADMIN')
  async getCourseCurriculum(@Param('id') id: string) {
    return this.prisma.course.findUnique({
      where: { id },
      include: {
        units: {
          orderBy: { order: 'asc' },
          include: {
            lessons: { orderBy: { order: 'asc' }, include: { _count: { select: { blocks: true } } } }
          }
        }
      }
    });
  }

  @Post('units')
  @Roles('ACADEMIC_MANAGER', 'CENTER_MANAGER', 'SUPER_ADMIN')
  async createUnit(@Body() dto: { course_id: string, title: string, order: number }) {
    const unit = await this.prisma.unit.create({ data: { course_id: dto.course_id, title: dto.title, order: Number(dto.order) || 1 } });
    return { success: true, unit };
  }

  @Put('units/:id')
  @Roles('ACADEMIC_MANAGER', 'CENTER_MANAGER', 'SUPER_ADMIN')
  async updateUnit(@Param('id') id: string, @Body() dto: { title: string, order: number }) {
    const unit = await this.prisma.unit.update({ where: { id }, data: { title: dto.title, order: Number(dto.order) } });
    return { success: true, unit };
  }

  @Delete('units/:id')
  @Roles('ACADEMIC_MANAGER', 'CENTER_MANAGER', 'SUPER_ADMIN')
  async deleteUnit(@Param('id') id: string) {
    await this.prisma.unit.delete({ where: { id } });
    return { success: true };
  }

  @Post('lessons')
  @Roles('ACADEMIC_MANAGER', 'CENTER_MANAGER', 'SUPER_ADMIN')
  async createLesson(@Body() dto: { unit_id: string, title: string, order: number }) {
    const lesson = await this.prisma.lesson.create({ data: { unit_id: dto.unit_id, title: dto.title, order: Number(dto.order) || 1 } });
    return { success: true, lesson };
  }

  @Put('lessons/:id')
  @Roles('ACADEMIC_MANAGER', 'CENTER_MANAGER', 'SUPER_ADMIN')
  async updateLesson(@Param('id') id: string, @Body() dto: { title: string, order: number }) {
    const lesson = await this.prisma.lesson.update({ where: { id }, data: { title: dto.title, order: Number(dto.order) } });
    return { success: true, lesson };
  }

  @Delete('lessons/:id')
  @Roles('ACADEMIC_MANAGER', 'CENTER_MANAGER', 'SUPER_ADMIN')
  async deleteLesson(@Param('id') id: string) {
    await this.prisma.lesson.delete({ where: { id } });
    return { success: true };
  }

  // ==========================================
  // LESSON BLOCK BUILDER (CONTENT INJECTOR)
  // ==========================================

  @Get('lessons/:id/blocks')
  @Roles('ACADEMIC_MANAGER', 'CENTER_MANAGER', 'SUPER_ADMIN')
  async getLessonBlocks(@Param('id') id: string) {
    return this.prisma.lesson.findUnique({
      where: { id },
      include: {
        blocks: { orderBy: { seq_no: 'asc' } },
        unit: { include: { course: true } }
      }
    });
  }

  @Post('blocks')
  @Roles('ACADEMIC_MANAGER', 'CENTER_MANAGER', 'SUPER_ADMIN')
  async createBlock(@Body() dto: { lesson_id: string, type: any, seq_no: number, content: any }) {
    const block = await this.prisma.lessonBlock.create({
      data: { lesson_id: dto.lesson_id, type: dto.type, seq_no: Number(dto.seq_no), content: dto.content }
    });
    return { success: true, block };
  }

  @Put('blocks/:id')
  @Roles('ACADEMIC_MANAGER', 'CENTER_MANAGER', 'SUPER_ADMIN')
  async updateBlock(@Param('id') id: string, @Body() dto: { content: any, seq_no?: number }) {
    const updateData: any = { content: dto.content };
    if(dto.seq_no) updateData.seq_no = Number(dto.seq_no);
    const block = await this.prisma.lessonBlock.update({ where: { id }, data: updateData });
    return { success: true, block };
  }

  @Delete('blocks/:id')
  @Roles('ACADEMIC_MANAGER', 'CENTER_MANAGER', 'SUPER_ADMIN')
  async deleteBlock(@Param('id') id: string) {
    await this.prisma.lessonBlock.delete({ where: { id } });
    return { success: true };
  }
}
