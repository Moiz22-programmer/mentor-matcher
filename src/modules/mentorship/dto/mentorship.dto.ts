import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterStudentDto {
  @ApiProperty({ example: 'Amina Khan' }) @IsString() @IsNotEmpty() name: string;
  @ApiProperty({ example: 'amina@example.com' }) @IsEmail() email: string;
  @ApiPropertyOptional({ example: '+92 300 0000000' }) @IsOptional() @IsString() phone?: string;
  @ApiProperty({ enum: ['student', 'working-professional', 'self-learner'] }) @IsIn(['student', 'working-professional', 'self-learner']) status: string;
  @ApiProperty({ example: 'Lahore, Pakistan' }) @IsString() @IsNotEmpty() location: string;
  @ApiProperty({ example: 'Become a backend developer and secure an internship' }) @IsString() @IsNotEmpty() learningGoal: string;
  @ApiPropertyOptional({ example: '2026-12-31' }) @IsOptional() @IsString() goalDeadline?: string;
  @ApiProperty({ enum: ['beginner', 'intermediate', 'advanced'] }) @IsIn(['beginner', 'intermediate', 'advanced']) experienceLevel: string;
  @ApiProperty({ example: ['Node.js', 'PostgreSQL'] }) @IsArray() @ArrayMinSize(1) interests: string[];
}

export class MentorRequestDto {
  @ApiProperty({ example: 'ment_123' }) @IsString() @IsNotEmpty() mentorId: string;
  @ApiPropertyOptional({ example: 'I would like help preparing for backend interviews.' }) @IsOptional() @IsString() message?: string;
}

export class ReviewMentorRequestDto {
  @ApiProperty({ enum: ['accepted', 'declined'] }) @IsIn(['accepted', 'declined']) decision: string;
}

export class CreateAssignmentDto {
  @ApiProperty({ example: 'Build a REST API' }) @IsString() @IsNotEmpty() title: string;
  @ApiProperty({ example: 'Create an API with validation and tests.' }) @IsString() @IsNotEmpty() description: string;
  @ApiProperty({ example: 'stu_123' }) @IsString() @IsNotEmpty() studentId: string;
  @ApiProperty({ enum: ['code', 'document', 'video', 'link'] }) @IsIn(['code', 'document', 'video', 'link']) submissionType: string;
  @ApiProperty({ example: '2026-09-01T17:00:00.000Z' }) @IsString() @IsNotEmpty() deadline: string;
  @ApiPropertyOptional({ example: 'Correctness, clarity, test coverage' }) @IsOptional() @IsString() rubric?: string;
}

export class QuizQuestionDto {
  @ApiProperty({ enum: ['multiple-choice', 'fill-in-blank', 'essay'] }) @IsIn(['multiple-choice', 'fill-in-blank', 'essay']) type: string;
  @ApiProperty({ example: 'Which HTTP status represents a created resource?' }) @IsString() @IsNotEmpty() prompt: string;
  @ApiPropertyOptional({ example: ['200', '201', '404'] }) @IsOptional() @IsArray() options?: string[];
  @ApiPropertyOptional({ example: '201' }) @IsOptional() @IsString() answer?: string;
  @ApiPropertyOptional({ example: 2 }) @IsOptional() @IsNumber() @Min(1) points?: number;
}

export class CreateQuizDto {
  @ApiProperty({ example: 'HTTP Essentials' }) @IsString() @IsNotEmpty() title: string;
  @ApiProperty({ example: 'stu_123' }) @IsString() @IsNotEmpty() studentId: string;
  @ApiProperty({ type: [QuizQuestionDto] }) @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => QuizQuestionDto) questions: QuizQuestionDto[];
  @ApiPropertyOptional({ example: 20 }) @IsOptional() @IsInt() @Min(1) timeLimit?: number;
  @ApiPropertyOptional({ example: 70 }) @IsOptional() @IsNumber() @Min(0) @Max(100) passingScore?: number;
}

export class SubmitCodeDto {
  @ApiProperty({ example: 'ass_123' }) @IsString() @IsNotEmpty() assignmentId: string;
  @ApiProperty({ example: 'typescript' }) @IsString() @IsNotEmpty() language: string;
  @ApiProperty({ example: 'export const add = (a: number, b: number) => a + b;' }) @IsString() @IsNotEmpty() code: string;
}

export class SubmitVideoDto {
  @ApiProperty({ example: 'ass_123' }) @IsString() @IsNotEmpty() assignmentId: string;
  @ApiProperty({ example: 'https://www.loom.com/share/example' }) @IsUrl() videoUrl: string;
  @ApiPropertyOptional({ example: 'In this walkthrough I explain the API design...' }) @IsOptional() @IsString() transcript?: string;
}

export class SubmitQuizDto {
  @ApiProperty({ example: { '0': '201', '1': 'An idempotent request can be repeated safely.' } }) answers: Record<string, string>;
}

export class MentorFeedbackDto {
  @ApiPropertyOptional({ example: 88 }) @IsOptional() @IsNumber() @Min(0) @Max(100) score?: number;
  @ApiProperty({ example: 'Great validation. Please add edge-case tests.' }) @IsString() @IsNotEmpty() feedback: string;
  @ApiPropertyOptional({ enum: ['approved', 'needs-work'] }) @IsOptional() @IsIn(['approved', 'needs-work']) status?: string;
}

export class AiCodeReviewDto {
  @ApiProperty({ example: 'typescript' }) @IsString() @IsNotEmpty() language: string;
  @ApiProperty({ example: 'const sum = (a: number, b: number) => a + b;' }) @IsString() @IsNotEmpty() code: string;
  @ApiPropertyOptional({ example: 'Evaluate for a REST API assignment.' }) @IsOptional() @IsString() context?: string;
}

export class AiVideoReviewDto {
  @ApiProperty({ example: 'I chose an indexed query because...' }) @IsString() @IsNotEmpty() transcript: string;
  @ApiPropertyOptional({ example: 'Student explains database indexing.' }) @IsOptional() @IsString() context?: string;
}

export class ComposeAndSendEmailDto {
  @ApiProperty({ enum: ['mentor', 'student'] }) @IsIn(['mentor', 'student']) senderRole: string;
  @ApiProperty({ example: 'Amina Khan' }) @IsString() @IsNotEmpty() senderName: string;
  @ApiProperty({ example: 'mentor@example.com' }) @IsEmail() recipientEmail: string;
  @ApiProperty({ example: 'Ali Ahmed' }) @IsString() @IsNotEmpty() recipientName: string;
  @ApiProperty({ example: 'I finished the REST API assignment and added tests for validation errors.' }) @IsString() @IsNotEmpty() summary: string;
  @ApiPropertyOptional({ enum: ['work-update', 'feedback', 'reminder', 'general'], default: 'work-update' }) @IsOptional() @IsIn(['work-update', 'feedback', 'reminder', 'general']) type?: string;
}

export class GenerateAiAssignmentDto {
  @ApiProperty({ example: 'React Custom Hooks & Async State' }) @IsString() @IsNotEmpty() topic: string;
  @ApiPropertyOptional({ example: 'Junior Frontend Developer' }) @IsOptional() @IsString() targetRole?: string;
  @ApiPropertyOptional({ enum: ['assignment', 'quiz', 'snippet', 'material'], default: 'assignment' }) @IsOptional() @IsString() type?: string;
}

