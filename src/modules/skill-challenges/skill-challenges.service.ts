import { Injectable, Logger } from '@nestjs/common';
import { OpenaiService } from '../openai/openai.service';
import { EmailService } from '../email/email.service';
import { GenerateChallengeDto } from './dto/generate-challenge.dto';
import { SubmitSolutionDto } from './dto/submit-solution.dto';
import { ChallengeResponseDto } from './dto/challenge-response.dto';
import { EvaluationResponseDto } from './dto/evaluation-response.dto';

@Injectable()
export class SkillChallengesService {
  private readonly logger = new Logger(SkillChallengesService.name);

  // In-memory store for demo (replace with DB in production)
  private challenges = new Map<string, any>();

  constructor(
    private readonly openaiService: OpenaiService,
    private readonly emailService: EmailService,
  ) {}

  async generateChallenge(dto: GenerateChallengeDto): Promise<ChallengeResponseDto> {
    this.logger.log(`Generating ${dto.difficulty} challenge for ${dto.skill}`);

    const challenge = await this.openaiService.generateChallenge(dto.skill, dto.difficulty);
    const challengeId = `ch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store challenge for later evaluation
    this.challenges.set(challengeId, challenge);

    return {
      success: true,
      message: 'Challenge generated successfully',
      challengeId,
      challenge,
    };
  }

  async evaluateSolution(dto: SubmitSolutionDto): Promise<EvaluationResponseDto> {
    this.logger.log(`Evaluating solution for challenge ${dto.challengeId}`);

    const challenge = this.challenges.get(dto.challengeId);
    if (!challenge) {
      throw new Error('Challenge not found. It may have expired.');
    }

    // Step 1: AI evaluates the code
    const evaluation = await this.openaiService.evaluateCode(
      challenge.description,
      dto.code,
      dto.language,
    );

    // Step 2: Determine badge
    const badgeEarned = this.determineBadge(evaluation.score, challenge.title);

    // Step 3: Send results via email
    await this.emailService.sendChallengeResult(
      dto.menteeEmail,
      dto.menteeName,
      challenge.title,
      evaluation,
      badgeEarned,
    );

    this.logger.log(`Evaluation sent to ${dto.menteeEmail}. Score: ${evaluation.score}`);

    return {
      success: true,
      message: 'Solution evaluated and results emailed',
      evaluation,
      badgeEarned,
    };
  }

  getBadgeTiers() {
    return {
      tiers: [
        { name: 'Bronze Coder', minScore: 60, icon: '🥉', description: 'Completed challenge with passing score' },
        { name: 'Silver Coder', minScore: 75, icon: '🥈', description: 'Strong solution with good practices' },
        { name: 'Gold Coder', minScore: 90, icon: '🥇', description: 'Excellent solution with optimal approach' },
        { name: 'Platinum Coder', minScore: 95, icon: '💎', description: 'Perfect solution — truly exceptional!' },
      ],
    };
  }

  private determineBadge(score: number, challengeTitle: string): string | undefined {
    if (score >= 95) return 'Platinum Coder';
    if (score >= 90) return 'Gold Coder';
    if (score >= 75) return 'Silver Coder';
    if (score >= 60) return 'Bronze Coder';
    return undefined;
  }
}
