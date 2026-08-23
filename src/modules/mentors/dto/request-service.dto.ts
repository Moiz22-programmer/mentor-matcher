import { IsString, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestServiceDto {
  @ApiProperty({ example: 'cand_101' })
  @IsString()
  @IsOptional()
  candidateId?: string;

  @ApiProperty({ example: 'Jordan Lee' })
  @IsString()
  @IsNotEmpty()
  candidateName: string;

  @ApiProperty({ example: 'jordan@example.com' })
  @IsEmail()
  candidateEmail: string;

  @ApiProperty({ example: 'ment_202' })
  @IsString()
  @IsNotEmpty()
  mentorId: string;

  @ApiProperty({ example: 'Mock Interview' })
  @IsString()
  @IsNotEmpty()
  serviceTitle: string;

  @ApiProperty({ example: 'Need mock interview for Senior Frontend Role' })
  @IsString()
  @IsOptional()
  notes?: string;
}
