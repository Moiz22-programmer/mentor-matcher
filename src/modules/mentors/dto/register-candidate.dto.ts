import { IsString, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterCandidateDto {
  @ApiProperty({ example: 'Jordan Lee' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'jordan@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Fullstack Developer' })
  @IsString()
  @IsNotEmpty()
  targetRole: string;

  @ApiProperty({ example: 'Looking for system design mentorship and mock interviews.' })
  @IsString()
  @IsOptional()
  bio?: string;
}
