import { IsString, IsEmail, IsNotEmpty, IsArray, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class ServiceOfferedDto {
  @ApiProperty({ example: 'Mock Interview' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Interview' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: '1-on-1 mock interview with detailed AI feedback' })
  @IsString()
  @IsNotEmpty()
  description: string;
}

export class RegisterMentorDto {
  @ApiProperty({ example: 'Alex Rivera' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'alex.rivera@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Senior Staff Engineer' })
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiProperty({ example: 'Tech Corp / Google' })
  @IsString()
  @IsNotEmpty()
  company: string;

  @ApiProperty({ example: 'San Francisco, CA' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  yearsExperience: number;

  @ApiProperty({ example: ['TypeScript', 'System Design', 'Mock Interview', 'CV Review'] })
  @IsArray()
  skills: string[];

  @ApiProperty({ type: [ServiceOfferedDto] })
  @IsArray()
  servicesOffered: ServiceOfferedDto[];

  @ApiProperty({ example: 'Passionate about mentoring engineers in system design and interview prep.' })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({ example: '+92 300 0000000' })
  @IsString() @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'Asia/Karachi' })
  @IsString() @IsOptional()
  timezone?: string;

  @ApiPropertyOptional({ example: ['Backend Development', 'System Design'] })
  @IsArray() @IsOptional()
  specializationFields?: string[];

  @ApiPropertyOptional({ example: ['TypeScript', 'Node.js', 'PostgreSQL'] })
  @IsArray() @IsOptional()
  languagesKnown?: string[];

  @ApiPropertyOptional({ example: ['NestJS', 'API Design'] })
  @IsArray() @IsOptional()
  skillsToTeach?: string[];

  @ApiPropertyOptional({ example: 4 })
  @IsNumber() @IsOptional()
  maxMentees?: number;

  @ApiPropertyOptional({ example: 'Monday and Wednesday, 18:00–20:00' })
  @IsString() @IsOptional()
  availabilityHours?: string;

  @ApiPropertyOptional({ example: 'https://linkedin.com/in/alex' })
  @IsString() @IsOptional()
  linkedinUrl?: string;
}

export class UpdateMentorDto extends PartialType(RegisterMentorDto) {}
