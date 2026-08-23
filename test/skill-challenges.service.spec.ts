import { Test, TestingModule } from '@nestjs/testing';
import { SkillChallengesService } from '../src/modules/skill-challenges/skill-challenges.service';
import { OpenaiService } from '../src/modules/openai/openai.service';
import { EmailService } from '../src/modules/email/email.service';

describe('SkillChallengesService', () => {
  let service: SkillChallengesService;

  const mockOpenaiService = {
    generateChallenge: jest.fn().mockResolvedValue({
      title: 'Two Sum',
      description: 'Find two numbers that add up to target',
      requirements: ['O(n) time'],
      starterCode: 'function twoSum() {}',
      testCases: [{ input: '[2,7,11,15], 9', expectedOutput: '[0,1]' }],
      hints: ['Use hash map'],
      timeLimit: 30,
    }),
    evaluateCode: jest.fn().mockResolvedValue({
      passed: true,
      score: 85,
      feedback: 'Good solution',
      improvements: ['Optimize space'],
      complexity: 'O(n) time, O(n) space',
    }),
  };

  const mockEmailService = {
    sendChallengeResult: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillChallengesService,
        { provide: OpenaiService, useValue: mockOpenaiService },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<SkillChallengesService>(SkillChallengesService);
  });

  it('should generate a challenge', async () => {
    const result = await service.generateChallenge({ skill: 'JavaScript', difficulty: 'medium' });

    expect(result.success).toBe(true);
    expect(result.challenge.title).toBe('Two Sum');
    expect(mockOpenaiService.generateChallenge).toHaveBeenCalledWith('JavaScript', 'medium');
  });

  it('should evaluate solution and award badge', async () => {
    // First generate a challenge to store it
    const challenge = await service.generateChallenge({ skill: 'JavaScript', difficulty: 'medium' });

    const result = await service.evaluateSolution({
      menteeEmail: 'test@example.com',
      menteeName: 'Test User',
      challengeId: challenge.challengeId,
      language: 'javascript',
      code: 'function twoSum(nums, target) { return [0,1]; }',
    });

    expect(result.success).toBe(true);
    expect(result.evaluation.score).toBe(85);
    expect(result.badgeEarned).toBe('Silver Coder');
    expect(mockEmailService.sendChallengeResult).toHaveBeenCalled();
  });
});
