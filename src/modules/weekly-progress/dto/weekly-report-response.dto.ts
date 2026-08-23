import { ApiProperty } from '@nestjs/swagger';

class WeeklyAnalysisDto {
  @ApiProperty({ example: 'Strong week with solid progress on backend tasks.' })
  summary: string;

  @ApiProperty({
    example: ['Completed authentication module', 'Consistent standup attendance'],
  })
  achievements: string[];

  @ApiProperty({
    example: ['Focus on database fundamentals', 'Use time-blocking technique'],
  })
  recommendations: string[];

  @ApiProperty({
    example: 'You are making excellent progress! Keep pushing forward — next week will be even better.',
  })
  motivationMessage: string;

  @ApiProperty({ example: 8, description: 'Progress score (1-10)' })
  progressScore: number;
}

export class WeeklyReportResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Weekly report analyzed and motivation email sent successfully' })
  message: string;

  @ApiProperty({ type: WeeklyAnalysisDto })
  analysis: WeeklyAnalysisDto;
}
