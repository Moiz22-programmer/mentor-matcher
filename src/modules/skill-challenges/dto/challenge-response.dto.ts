import { ApiProperty } from '@nestjs/swagger';

class TestCaseDto {
  @ApiProperty({ example: '[2, 7, 11, 15], target = 9' })
  input: string;

  @ApiProperty({ example: '[0, 1]' })
  expectedOutput: string;
}

class ChallengeDto {
  @ApiProperty({ example: 'Two Sum Problem' })
  title: string;

  @ApiProperty({
    example: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
  })
  description: string;

  @ApiProperty({
    example: ['Solve in O(n) time complexity', 'Use a hash map for efficiency', 'Handle edge cases'],
  })
  requirements: string[];

  @ApiProperty({
    example: 'function twoSum(nums, target) {\n  // Your code here\n}',
  })
  starterCode: string;

  @ApiProperty({ type: [TestCaseDto] })
  testCases: TestCaseDto[];

  @ApiProperty({
    example: ['Think about using a hash map to store complements', 'Consider what happens if no solution exists'],
  })
  hints: string[];

  @ApiProperty({ example: 30, description: 'Time limit in minutes' })
  timeLimit: number;
}

export class ChallengeResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Challenge generated successfully' })
  message: string;

  @ApiProperty({ example: 'ch_1699900000000_abc123' })
  challengeId: string;

  @ApiProperty({ type: ChallengeDto })
  challenge: ChallengeDto;
}
