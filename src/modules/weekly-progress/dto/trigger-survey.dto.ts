import { IsString, IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TriggerSurveyDto {
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
}
