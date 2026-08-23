import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitSolutionDto {
  @ApiProperty({
    description: 'Mentee email address',
    example: 'mentee@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  menteeEmail: string;

  @ApiProperty({
    description: 'Mentee full name',
    example: 'Ahmed Khan',
  })
  @IsString()
  @IsNotEmpty()
  menteeName: string;

  @ApiProperty({
    description: 'Challenge ID received from generate endpoint',
    example: 'ch_1699900000000_abc123',
  })
  @IsString()
  @IsNotEmpty()
  challengeId: string;

  @ApiProperty({
    description: 'Programming language of the solution',
    example: 'javascript',
    enum: ['javascript', 'python', 'java', 'typescript', 'go', 'rust'],
  })
  @IsString()
  @IsNotEmpty()
  language: string;

  @ApiProperty({
    description: 'Code solution',
    example: 'function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) return [map.get(complement), i];\n    map.set(nums[i], i);\n  }\n}',
    minLength: 10,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  code: string;
}
