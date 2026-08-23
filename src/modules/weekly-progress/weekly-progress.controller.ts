import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { WeeklyProgressService } from './weekly-progress.service';
import { SubmitWeeklyReportDto } from './dto/submit-weekly-report.dto';
import { WeeklyReportResponseDto } from './dto/weekly-report-response.dto';
import { TriggerSurveyDto } from './dto/trigger-survey.dto';

@ApiTags('Weekly Progress')
@Controller('weekly-progress')
export class WeeklyProgressController {
  constructor(private readonly weeklyProgressService: WeeklyProgressService) {}

  @Post('submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Submit weekly progress survey',
    description: 'Mentee submits weekly progress. OpenAI analyzes responses and sends a personalized motivation email.',
  })
  @ApiBody({ type: SubmitWeeklyReportDto })
  @ApiResponse({
    status: 200,
    description: 'Weekly report analyzed and motivation email sent.',
    type: WeeklyReportResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'AI analysis or email delivery failed' })
  async submitWeeklyReport(@Body() dto: SubmitWeeklyReportDto): Promise<WeeklyReportResponseDto> {
    return this.weeklyProgressService.processWeeklyReport(dto);
  }

  @Post('trigger-survey')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Trigger weekly survey email (Admin/Mentor)',
    description: 'Manually trigger the weekly survey email to a mentee. Usually automated every Friday.',
  })
  @ApiBody({ type: TriggerSurveyDto })
  @ApiResponse({ status: 200, description: 'Survey email sent successfully.' })
  async triggerSurvey(@Body() dto: TriggerSurveyDto) {
    return this.weeklyProgressService.sendSurveyEmail(dto);
  }
}
