import { Module } from '@nestjs/common';
import { WeeklyProgressController } from './weekly-progress.controller';
import { WeeklyProgressService } from './weekly-progress.service';
import { OpenaiModule } from '../openai/openai.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [OpenaiModule, EmailModule],
  controllers: [WeeklyProgressController],
  providers: [WeeklyProgressService],
})
export class WeeklyProgressModule {}
