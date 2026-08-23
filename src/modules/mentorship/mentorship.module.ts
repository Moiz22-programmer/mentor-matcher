import { Module } from '@nestjs/common';
import { EmailModule } from '../email/email.module';
import { OpenaiModule } from '../openai/openai.module';
import { MentorsModule } from '../mentors/mentors.module';
import { MentorshipController } from './mentorship.controller';
import { MentorshipService } from './mentorship.service';

@Module({ imports: [OpenaiModule, EmailModule, MentorsModule], controllers: [MentorshipController], providers: [MentorshipService], exports: [MentorshipService] })
export class MentorshipModule {}
