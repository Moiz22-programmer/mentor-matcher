import { Injectable, Logger } from '@nestjs/common';
import { OpenaiService } from '../openai/openai.service';
import { EmailService } from '../email/email.service';
import { SubmitWeeklyReportDto } from './dto/submit-weekly-report.dto';
import { WeeklyReportResponseDto } from './dto/weekly-report-response.dto';
import { TriggerSurveyDto } from './dto/trigger-survey.dto';

@Injectable()
export class WeeklyProgressService {
  private readonly logger = new Logger(WeeklyProgressService.name);

  constructor(
    private readonly openaiService: OpenaiService,
    private readonly emailService: EmailService,
  ) {}

  async processWeeklyReport(dto: SubmitWeeklyReportDto): Promise<WeeklyReportResponseDto> {
    this.logger.log(`Processing weekly report for ${dto.menteeEmail}`);

    // Step 1: AI analyzes the weekly progress
    const analysis = await this.openaiService.analyzeWeeklyProgress({
      goalsMet: dto.goalsMet,
      challenges: dto.challenges,
      nextWeekGoals: dto.nextWeekGoals,
      morale: dto.morale,
    });

    // Step 2: Send personalized progress report via email
    await this.emailService.sendWeeklyProgressReport(
      dto.menteeEmail,
      dto.menteeName,
      analysis,
    );

    this.logger.log(`Weekly progress report sent to ${dto.menteeEmail}`);

    return {
      success: true,
      message: 'Weekly report analyzed and motivation email sent successfully',
      analysis,
    };
  }

  async sendSurveyEmail(dto: TriggerSurveyDto) {
    const surveyLink = `https://mentormatcher.app/weekly-survey?mentee=${encodeURIComponent(dto.menteeEmail)}`;

    await this.emailService.sendWeeklySurvey(
      dto.menteeEmail,
      dto.menteeName,
      surveyLink,
    );

    this.logger.log(`Survey email sent to ${dto.menteeEmail}`);

    return {
      success: true,
      message: 'Weekly survey email sent successfully',
      surveyLink,
    };
  }
}
