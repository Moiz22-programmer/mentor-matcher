import { Test, TestingModule } from '@nestjs/testing';
import { InterviewFeedbackService } from '../src/modules/interview-feedback/interview-feedback.service';
import { OpenaiService } from '../src/modules/openai/openai.service';
import { EmailService } from '../src/modules/email/email.service';

describe('InterviewFeedbackService', () => {
  let service: InterviewFeedbackService;

  const mockOpenaiService = {
    analyzeInterview: jest.fn().mockResolvedValue({
      score: 8,
      strengths: ['Clear communication'],
      improvements: ['More examples'],
      overallFeedback: 'Good interview overall',
    }),
  };

  const mockEmailService = {
    sendInterviewFeedback: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterviewFeedbackService,
        { provide: OpenaiService, useValue: mockOpenaiService },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<InterviewFeedbackService>(InterviewFeedbackService);
  });

  it('should analyze interview and send email', async () => {
    const dto = {
      menteeEmail: 'test@example.com',
      menteeName: 'Test User',
      transcript: 'Interviewer: Tell me about yourself. Candidate: I am a developer...',
    };

    const result = await service.analyzeAndEmail(dto);

    expect(result.success).toBe(true);
    expect(result.feedback.score).toBe(8);
    expect(mockOpenaiService.analyzeInterview).toHaveBeenCalledWith(dto.transcript);
    expect(mockEmailService.sendInterviewFeedback).toHaveBeenCalled();
  });
});
