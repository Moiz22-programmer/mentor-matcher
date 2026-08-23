import { Module } from '@nestjs/common';
import { SkillChallengesController } from './skill-challenges.controller';
import { SkillChallengesService } from './skill-challenges.service';
import { OpenaiModule } from '../openai/openai.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [OpenaiModule, EmailModule],
  controllers: [SkillChallengesController],
  providers: [SkillChallengesService],
})
export class SkillChallengesModule {}
