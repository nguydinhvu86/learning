import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard, Roles } from '../auth/roles.guard';

@ApiTags('Assignments & Submissions')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('assignments')
export class AssignmentController {

  @Post('/')
  @Roles('TEACHER', 'ACADEMIC_MANAGER')
  @ApiOperation({ summary: 'Create a new assignment for a class' })
  async createAssignment(@Body() dto: any) {
    return {
      success: true,
      assignment_id: 'assig-1',
      title: dto.title,
      created_at: new Date().toISOString()
    };
  }

  @Post(':id/submit')
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Submit an assignment (File URL or Text)' })
  async submitAssignment(@Param('id') id: string, @Body() dto: any) {
    return {
      success: true,
      submission_id: 'sub-1',
      status: 'submitted'
    };
  }

  @Post('submissions/:subId/review')
  @Roles('TEACHER')
  @ApiOperation({ summary: 'Teacher grades a submission' })
  async reviewSubmission(@Param('subId') subId: string, @Body() dto: any) {
    // In real implementation:
    // await this.prisma.review.create({ data: { teacher_id, submission_id: subId, score, feedback } })
    return {
      success: true,
      review_id: 'rev-1',
      status: 'graded'
    };
  }
}
