import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { RolesGuard, Roles } from './auth/roles.guard';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
     private readonly appService: AppService,
     private prisma: PrismaService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('public/settings')
  async getPublicSettings() {
    try {
      const rows: any = await this.prisma.$queryRaw`SELECT * FROM SystemSetting WHERE id='global'`;
      if (rows && rows.length > 0) return rows[0];
      await this.prisma.$executeRaw`
        INSERT INTO SystemSetting (id, platform_name, tagline, description, company_name, company_description, company_url, updated_at)
        VALUES ('global', 'Polyglot Hub', 'E-Learning Ecosystem', 'Nền tảng Học thuật chuyên nghiệp tích hợp ngôn ngữ học và Spaced Repetition System.', 'TSOL', 'TSOL là đơn vị chủ quản quản lý hạ tầng học thuật.', 'https://thegioigiaiphap.vn', NOW(3))
      `;
      const newRows: any = await this.prisma.$queryRaw`SELECT * FROM SystemSetting WHERE id='global'`;
      return newRows[0];
    } catch(e) {
      return { id: 'global', platform_name: 'Polyglot Hub', tagline: 'E-Learning Ecosystem', description: '...', company_name: 'TSOL', company_description: '...', company_url: '#' };
    }
  }

  @Get('student/my-classes')
  @UseGuards(RolesGuard)
  @Roles('STUDENT')
  async getStudentClasses(@Request() req: any) {
     const userId = req.user?.sub || req.user?.id || req.user?.user_id;
     if (!userId) return [];
     
     const memberships = await this.prisma.classMember.findMany({
        where: { student_id: userId },
        include: { class: { include: { course: true } } }
     });
     
     return memberships.map(m => ({
        id: m.class.id,
        name: m.class.name,
        course_title: m.class.course?.title || '',
        joined_at: m.joined_at
     }));
  }
}
