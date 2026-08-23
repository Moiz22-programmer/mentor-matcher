import { ApiProperty } from '@nestjs/swagger';

class EvaluationDto {
  @ApiProperty({ example: true })
  passed: boolean;

  @ApiProperty({ example: 85, description: 'Score out of 100' })
  score: number;

  @ApiProperty({
    example: 'Good solution with correct logic. Could optimize space complexity.',
  })
  feedback: string;

  @ApiProperty({
    example: ['Use a single pass instead of two passes', 'Add input validation'],
  })
  improvements: string[];

  @ApiProperty({ example: 'O(n) time, O(n) space' })
  complexity: string;
}

export class EvaluationResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Solution evaluated and results emailed' })
  message: string;

  @ApiProperty({ type: EvaluationDto })
  evaluation: EvaluationDto;

  @ApiProperty({ example: 'Silver Coder', required: false, description: 'Badge earned if score >= 75' })
  badgeEarned?: string;
}
