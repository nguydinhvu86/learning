import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AuthMiddleware } from './auth/auth.middleware';
import { NotificationModule } from './notification/notification.module';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AcademicController } from './admin/academic.controller';
import { CurriculumController } from './curriculum/curriculum.controller';
import { PlacementController } from './placement/placement.controller';
import { ProgressController } from './progress/progress.controller';
import { AssignmentController } from './teacher/assignment.controller';
import { ClassController } from './teacher/class.controller';

@Module({
  imports: [PrismaModule, NotificationModule],
  controllers: [
    AppController,
    AuthController,
    AcademicController,
    CurriculumController,
    PlacementController,
    ProgressController,
    AssignmentController,
    ClassController
  ],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
