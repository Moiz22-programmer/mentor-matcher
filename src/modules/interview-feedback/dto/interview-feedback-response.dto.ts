import { ApiProperty } from '@nestjs/swagger';

class FeedbackDetailDto {
  @ApiProperty({ example: 7, description: 'Overall interview score (1-10)' })
  score: number;

  @ApiProperty({
    example: ['Clear communication', 'Strong technical answers', 'Good problem-solving approach'],
    description: 'Identified strengths',
  })
  strengths: string[];

  @ApiProperty({
    example: ['Could improve eye contact', 'Answer was too brief on leadership question'],
    description: 'Areas for improvement',
  })
  improvements: string[];

  @ApiProperty({
    example: 'Overall solid performance with room for improvement in behavioral questions.',
    description: 'Summary feedback',
  })
  overallFeedback: string;
}

export class InterviewFeedbackResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Interview analyzed and feedback emailed successfully' })
  message: string;

  @ApiProperty({ type: FeedbackDetailDto })
  feedback: FeedbackDetailDto;

  @ApiProperty({ example: '2 minutes', description: 'Time taken for analysis' })
  processingTime: string;
}
