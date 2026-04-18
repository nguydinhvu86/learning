import { Controller, Get, Param, UseGuards, Request, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { PrismaService } from '../prisma/prisma.service';

/**
 * MVP Mock Data for Curriculum
 * In a real implementation this hooks to PrismaService:
 * this.prisma.course.findMany({ include: { units: { include: { lessons: true } } } })
 */

@ApiTags('Curriculum')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('curriculum')
export class CurriculumController {
  constructor(private prisma: PrismaService) {}
  
  @Get('courses')
  @Roles('STUDENT', 'TEACHER', 'ACADEMIC_MANAGER')
  @ApiOperation({ summary: 'Get all available courses for the user' })
  async getCourses(@Request() req: any) {
    const user_id = req.user.id;

    const dbCourses = await this.prisma.course.findMany({
      include: {
        program: true,
        level: true,
        units: { include: { lessons: { include: { _count: { select: { blocks: true } } } } } }
      }
    });

    const userProgress = await this.prisma.studentProgress.findMany({
      where: { user_id, status: { in: ['completed', 'mastered'] } }
    });
    const completedBlockIds = new Set(userProgress.map(p => p.block_id));

    const result = await Promise.all(dbCourses.map(async c => {
      let totalBlocks = 0;
      let completedBlocks = 0;
      
      const blocksIter = await this.prisma.lessonBlock.findMany({
         where: { lesson: { unit: { course_id: c.id } } },
         select: { id: true }
      });
      totalBlocks = blocksIter.length;
      completedBlocks = blocksIter.filter(b => completedBlockIds.has(b.id)).length;

      const progress = totalBlocks > 0 ? Math.round((completedBlocks / totalBlocks) * 100) : 0;

      return {
        id: c.id,
        title: c.title,
        language: c.program.language.toUpperCase(),
        progress,
        total_lessons: c.units.reduce((acc, u) => acc + u.lessons.length, 0),
        completed_lessons: Math.floor(progress / 10) // Approx mapping for UI
      };
    }));

    return result;
  }

  @Get('courses/:id/roadmap')
  @Roles('STUDENT', 'TEACHER', 'ACADEMIC_MANAGER')
  @ApiOperation({ summary: 'Get the detailed lesson tree of a course' })
  async getCourseRoadmap(@Param('id') id: string, @Request() req: any) {
    const user_id = req.user.id;

    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        units: {
          orderBy: { order: 'asc' },
          include: { lessons: { orderBy: { order: 'asc' }, include: { blocks: { select: { id: true } } } } }
        }
      }
    });

    if (!course) return {};

    const userProgress = await this.prisma.studentProgress.findMany({
      where: { user_id, status: { in: ['completed', 'mastered'] } }
    });
    const completedBlockIds = new Set(userProgress.map(p => p.block_id));

    return {
      course_id: course.id,
      title: course.title,
      units: course.units.map(u => ({
        id: u.id,
        title: u.title,
        lessons: u.lessons.map(l => {
          const totalBlocks = l.blocks.length;
          const completedBlocks = l.blocks.filter(b => completedBlockIds.has(b.id)).length;
          let status = 'locked';
          
          if (totalBlocks === 0) status = 'pending';
          else if (completedBlocks === totalBlocks) status = 'completed';
          else if (completedBlocks > 0) status = 'in_progress';
          else status = 'pending';

          return {
            id: l.id,
            title: l.title,
            status
          };
        })
      }))
    };
  }

  @Get('lessons/:id')
  @Roles('STUDENT', 'TEACHER')
  @ApiOperation({ summary: 'Get lesson blocks (content) by lesson ID' })
  async getLessonContent(@Param('id') id: string) {
    const blocks = await this.prisma.lessonBlock.findMany({
      where: { lesson_id: id },
      orderBy: { seq_no: 'asc' }
    });

    return blocks.map(b => ({
      block_id: b.id,
      type: b.type,
      seq_no: b.seq_no,
      content: typeof b.content === 'string' ? JSON.parse(b.content) : b.content
    }));
  }

  @Post('progress')
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Update student progress for a lesson block' })
  async updateProgress(@Body() dto: any, @Request() req: any) {
    const { block_id, status, score } = dto;
    
    // Check if block exists
    const block = await this.prisma.lessonBlock.findUnique({ where: { id: block_id } });
    if (!block) return { success: false, message: 'Block not found' };

    const progress = await this.prisma.studentProgress.upsert({
      where: {
        user_id_block_id: { user_id: req.user.id, block_id }
      },
      update: {
        status,
        score: score !== undefined ? score : null
      },
      create: {
        user_id: req.user.id,
        block_id,
        status,
        score: score !== undefined ? score : null
      }
    });

    return { success: true, progress };
  }
}
