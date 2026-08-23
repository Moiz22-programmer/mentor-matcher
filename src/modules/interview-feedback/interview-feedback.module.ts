import { Module } from '@nestjs/common';
import { InterviewFeedbackController } from './interview-feedback.controller';
import { InterviewFeedbackService } from './interview-feedback.service';
import { OpenaiModule } from '../openai/openai.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [OpenaiModule, EmailModule],
  controllers: [InterviewFeedbackController],
  providers: [InterviewFeedbackService],
})
export class InterviewFeedbackModule {}
