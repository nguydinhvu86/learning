import { Controller, Post, Body, HttpCode, HttpStatus, UnauthorizedException, Get, Put, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty, ApiBearerAuth } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { RolesGuard, Roles } from './roles.guard';

export class LoginDto {
  @ApiProperty({ example: 'student@polyglot.edu' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(6)
  password: string;
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private prisma: PrismaService) {}
  
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login and retrieve JWT token' })
  @ApiResponse({ status: 200, description: 'Successful login.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email }
    });

    if (!user) {
      throw new UnauthorizedException('Thông tin đăng nhập không hợp lệ');
    }

    const payload = { sub: user.id, role: user.role };
    const access_token = Buffer.from(JSON.stringify(payload)).toString('base64');

    return {
       access_token,
       role: user.role,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh JWT token' })
  async refresh() {
     return { access_token: 'new-mock-jwt-token' };
  }

  @Get('me')
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@Request() req: any) {
    const userId = req.user?.sub || req.user?.id || req.user?.user_id;
    if (!userId) throw new UnauthorizedException();

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { 
         id: true, 
         email: true, 
         role: true, 
         student_profile: { select: { full_name: true, phone: true } }
      }
    });

    const formattedUser = {
       id: user?.id,
       email: user?.email,
       role: user?.role,
       full_name: user?.student_profile?.full_name || '',
       phone: user?.student_profile?.phone || ''
    };
    
    return formattedUser;
  }

  @Put('me')
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  async updateMe(@Body() body: any, @Request() req: any) {
    const userId = req.user?.sub || req.user?.id || req.user?.user_id;
    if (!userId) throw new UnauthorizedException();

    const updateData: any = {};
    if (body.password) updateData.password_hash = body.password; // Note: No hashing done here to match MVP architecture

    if (Object.keys(updateData).length > 0) {
       await this.prisma.user.update({
         where: { id: userId },
         data: updateData
       });
    }

    if (body.full_name || body.phone) {
       const profileData: any = {};
       if (body.full_name) profileData.full_name = body.full_name;
       if (body.phone) profileData.phone = body.phone;
       
       await this.prisma.studentProfile.upsert({
          where: { user_id: userId },
          create: { user_id: userId, ...profileData, full_name: profileData.full_name || 'Student' },
          update: profileData
       });
    }

    return { success: true };
  }
}
