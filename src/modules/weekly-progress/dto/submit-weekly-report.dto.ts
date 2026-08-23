import { IsString, IsEmail, IsNotEmpty, IsNumber, Min, Max, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitWeeklyReportDto {
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
    description: 'What goals did you achieve this week?',
    example: 'Completed the authentication module, fixed 3 bugs, and attended the team standup daily.',
    minLength: 10,
    maxLength: 2000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(2000)
  goalsMet: string;

  @ApiProperty({
    description: 'What challenges did you face?',
    example: 'Struggled with understanding the new database schema. Had trouble with time management.',
    minLength: 10,
    maxLength: 2000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(2000)
  challenges: string;

  @ApiProperty({
    description: 'What are your goals for next week?',
    example: 'Finish the API integration, learn about caching strategies, and complete the code review.',
    minLength: 10,
    maxLength: 2000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(2000)
  nextWeekGoals: string;

  @ApiProperty({
    description: 'Current morale level (1-10)',
    example: 8,
    minimum: 1,
    maximum: 10,
  })
  @IsNumber()
  @Min(1)
  @Max(10)
  morale: number;
}
