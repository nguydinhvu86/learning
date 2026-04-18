import { Controller, Get, Post, Param, UseGuards, Request, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../auth/roles.guard';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationGateway } from './notification.gateway';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private prisma: PrismaService, private gateway: NotificationGateway) {}

  @Get('my-alerts')
  @ApiOperation({ summary: 'Fetch unread notifications for the current user' })
  async getMyNotifications(@Request() req: any) {
    const alerts = await this.prisma.notification.findMany({
      where: { user_id: req.user.id },
      orderBy: { created_at: 'desc' },
      take: 10
    });
    return alerts;
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  async markAsRead(@Param('id') id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { is_read: true }
    });
  }

  @Post('admin/broadcast')
  @ApiOperation({ summary: 'Broadcast a notification to everyone' })
  async broadcast(@Body() dto: { title: string, message: string }) {
    // In a real app avoiding OOM, we might push to a queue or Redis pubsub.
    // MVP simulates bulk insert by picking 5 random users:
    const users = await this.prisma.user.findMany({ take: 5 });
    
    await this.prisma.notification.createMany({
      data: users.map(u => ({
        user_id: u.id,
        title: dto.title,
        message: dto.message,
        is_read: false
      }))
    });

    // Dispatch realtime events to active sockets
    users.forEach(u => {
      this.gateway.notifyUser(u.id, {
        title: dto.title,
        message: dto.message,
        is_read: false
      });
    });

    return { success: true, count_sent: users.length };
  }
}
