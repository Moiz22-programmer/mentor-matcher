import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { InterviewFeedbackService } from './interview-feedback.service';
import { SubmitInterviewDto } from './dto/submit-interview.dto';
import { InterviewFeedbackResponseDto } from './dto/interview-feedback-response.dto';

@ApiTags('Interview Feedback')
@Controller('interview-feedback')
export class InterviewFeedbackController {
  constructor(private readonly interviewFeedbackService: InterviewFeedbackService) {}

  @Post('submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Submit interview transcript for AI analysis',
    description: 'Upload interview transcript. OpenAI analyzes delivery, tone, and content. Feedback is emailed instantly.',
  })
  @ApiBody({ type: SubmitInterviewDto })
  @ApiResponse({
    status: 200,
    description: 'Interview analyzed successfully. Feedback sent via email.',
    type: InterviewFeedbackResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'AI analysis or email delivery failed' })
  async submitInterview(@Body() dto: SubmitInterviewDto): Promise<InterviewFeedbackResponseDto> {
    return this.interviewFeedbackService.analyzeAndEmail(dto);
  }
}
