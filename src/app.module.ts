import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InterviewFeedbackModule } from './modules/interview-feedback/interview-feedback.module';
import { WeeklyProgressModule } from './modules/weekly-progress/weekly-progress.module';
import { SkillChallengesModule } from './modules/skill-challenges/skill-challenges.module';
import { EmailModule } from './modules/email/email.module';
import { OpenaiModule } from './modules/openai/openai.module';
import { MentorsModule } from './modules/mentors/mentors.module';
import { MentorshipModule } from './modules/mentorship/mentorship.module';
import { AppController } from './app.controller';
import { AccountsModule } from './modules/accounts/accounts.module';
import { MentorSessionModule } from './modules/mentor-session/mentor-session.module';
import { CallsModule } from './modules/calls/calls.module';
import appConfig from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: ['.env'],
    }),
    OpenaiModule,
    EmailModule,
    InterviewFeedbackModule,
    WeeklyProgressModule,
    SkillChallengesModule,
    MentorsModule,
    AccountsModule,
    MentorSessionModule,
    CallsModule,
    MentorshipModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
