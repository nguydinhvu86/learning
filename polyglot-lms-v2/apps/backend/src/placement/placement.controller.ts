import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Placement Test')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('placement')
export class PlacementController {
  constructor(private prisma: PrismaService) {}

  @Post('submit')
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Submit placement test and receive estimated level' })
  async evaluatePlacementTest(@Body() dto: any, @Request() req: any) {
    const { language, score } = dto;
    let estimated_level = 'A1';

    if (language === 'EN') {
      if (score >= 90) estimated_level = 'C1';
      else if (score >= 70) estimated_level = 'B2';
      else if (score >= 50) estimated_level = 'B1';
      else if (score >= 30) estimated_level = 'A2';
      else estimated_level = 'A1';
    } else if (language === 'ZH') {
      if (score >= 90) estimated_level = 'HSK5';
      else if (score >= 70) estimated_level = 'HSK4';
      else if (score >= 50) estimated_level = 'HSK3';
      else if (score >= 30) estimated_level = 'HSK2';
      else estimated_level = 'HSK1';
    }

    try {
      // Save result to profile
      await this.prisma.studentProfile.update({
        where: { user_id: req.user.id },
        data: { current_level: estimated_level, target_lang: language }
      });
    } catch(e) {
      console.error('Failed to bind profile:', e.message);
    }

    return {
      success: true,
      score,
      estimated_level,
      message: `Initial test mapped your proficiency to ${estimated_level}.`
    };
  }
}
