import { Test, TestingModule } from '@nestjs/testing';
import { WeeklyProgressService } from '../src/modules/weekly-progress/weekly-progress.service';
import { OpenaiService } from '../src/modules/openai/openai.service';
import { EmailService } from '../src/modules/email/email.service';

describe('WeeklyProgressService', () => {
  let service: WeeklyProgressService;

  const mockOpenaiService = {
    analyzeWeeklyProgress: jest.fn().mockResolvedValue({
      summary: 'Great week!',
      achievements: ['Completed tasks'],
      recommendations: ['Keep going'],
      motivationMessage: 'You are doing great!',
      progressScore: 9,
    }),
  };

  const mockEmailService = {
    sendWeeklyProgressReport: jest.fn().mockResolvedValue(undefined),
    sendWeeklySurvey: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeeklyProgressService,
        { provide: OpenaiService, useValue: mockOpenaiService },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<WeeklyProgressService>(WeeklyProgressService);
  });

  it('should process weekly report and send motivation email', async () => {
    const dto = {
      menteeEmail: 'test@example.com',
      menteeName: 'Test User',
      goalsMet: 'Completed all goals',
      challenges: 'None',
      nextWeekGoals: 'Learn more',
      morale: 9,
    };

    const result = await service.processWeeklyReport(dto);

    expect(result.success).toBe(true);
    expect(result.analysis.progressScore).toBe(9);
    expect(mockOpenaiService.analyzeWeeklyProgress).toHaveBeenCalled();
    expect(mockEmailService.sendWeeklyProgressReport).toHaveBeenCalled();
  });
});
