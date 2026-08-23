import { Module } from '@nestjs/common';
import { MentorSessionController } from './mentor-session.controller';
import { MentorSessionService } from './mentor-session.service';
@Module({ controllers: [MentorSessionController], providers: [MentorSessionService] })
export class MentorSessionModule {}
