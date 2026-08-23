import { Injectable, Logger } from '@nestjs/common';
import { OpenaiService } from '../openai/openai.service';
import { EmailService } from '../email/email.service';
import { SubmitInterviewDto } from './dto/submit-interview.dto';
import { InterviewFeedbackResponseDto } from './dto/interview-feedback-response.dto';

@Injectable()
export class InterviewFeedbackService {
  private readonly logger = new Logger(InterviewFeedbackService.name);

  constructor(
    private readonly openaiService: OpenaiService,
    private readonly emailService: EmailService,
  ) {}

  async analyzeAndEmail(dto: SubmitInterviewDto): Promise<InterviewFeedbackResponseDto> {
    this.logger.log(`Analyzing interview for ${dto.menteeEmail}`);

    // Step 1: AI analyzes the interview transcript
    const feedback = await this.openaiService.analyzeInterview(dto.transcript);

    // Step 2: Send feedback via email
    await this.emailService.sendInterviewFeedback(
      dto.menteeEmail,
      dto.menteeName,
      feedback,
    );

    this.logger.log(`Feedback sent to ${dto.menteeEmail}`);

    return {
      success: true,
      message: 'Interview analyzed and feedback emailed successfully',
      feedback,
      processingTime: '2 minutes',
    };
  }
}
