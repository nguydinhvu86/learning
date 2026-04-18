import { Controller, Get } from '@nestjs/common';
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
}
