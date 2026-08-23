import { IsString, IsEmail, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitInterviewDto {
  @ApiProperty({
    description: 'Mentee email address to receive feedback',
    example: 'mentee@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  menteeEmail: string;

  @ApiProperty({
    description: 'Mentee full name for personalization',
    example: 'Ahmed Khan',
  })
  @IsString()
  @IsNotEmpty()
  menteeName: string;

  @ApiProperty({
    description: 'Interview transcript or video transcription text',
    example: 'Interviewer: Tell me about yourself.\nCandidate: I am a software engineer with 3 years of experience...',
    minLength: 50,
    maxLength: 10000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(50, { message: 'Transcript must be at least 50 characters' })
  @MaxLength(10000, { message: 'Transcript must not exceed 10000 characters' })
  transcript: string;
}
