import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AiCodeReviewDto, AiVideoReviewDto, ComposeAndSendEmailDto, CreateAssignmentDto, CreateQuizDto, GenerateAiAssignmentDto, MentorFeedbackDto, MentorRequestDto, RegisterStudentDto, ReviewMentorRequestDto, SubmitCodeDto, SubmitQuizDto, SubmitVideoDto } from './dto/mentorship.dto';
import { OpenaiService } from '../openai/openai.service';
import { MentorshipService } from './mentorship.service';

@ApiTags('Mentorship Platform')
@Controller()
export class MentorshipController {
  constructor(private readonly service: MentorshipService, private readonly openai: OpenaiService) {}

  @Post('ai/review-code') @ApiOperation({ summary: 'Review code directly with AI' }) reviewCode(@Body() dto: AiCodeReviewDto) { return this.openai.reviewCode(dto.code, dto.language, dto.context); }
  @Post('ai/review-video') @ApiOperation({ summary: 'Analyze a supplied video transcript with AI' }) reviewVideo(@Body() dto: AiVideoReviewDto) { return this.openai.reviewVideo(dto.transcript, dto.context); }
  @Post('ai/generate-assignment') @ApiOperation({ summary: 'Auto-generate learning work with AI for mentors' }) generateAssignment(@Body() dto: GenerateAiAssignmentDto) { return this.openai.generateAssignment(dto.topic, dto.targetRole, dto.type); }
  @Post('communications/compose-and-send') @ApiOperation({ summary: 'Use AI to compose and send a mentorship email' }) composeAndSendEmail(@Body() dto: ComposeAndSendEmailDto) { return this.service.composeAndSendEmail(dto); }


  @Post('students/register') @ApiOperation({ summary: 'Register a student and start their learning profile' }) @ApiResponse({ status: 201, description: 'Student created.' })
  registerStudent(@Body() dto: RegisterStudentDto) { return this.service.registerStudent(dto); }
  @Get('students') @ApiOperation({ summary: 'List registered students' }) getStudents() { return this.service.getStudents(); }
  @Get('students/:id') @ApiOperation({ summary: 'Get a student profile' }) getStudent(@Param('id') id: string) { return this.service.getStudent(id); }
  @Get('students/:id/mentor') @ApiOperation({ summary: 'Get the mentor assigned to a student' }) mentor(@Param('id') id: string) { return this.service.getStudentMentor(id); }
  @Post('students/:id/mentor-requests') @ApiOperation({ summary: 'Request mentorship from a mentor' }) requestMentor(@Param('id') id: string, @Body() dto: MentorRequestDto) { return this.service.createMentorRequest(id, dto); }
  @Get('students/:id/assignments') @ApiOperation({ summary: 'List a student’s assignments' }) assignments(@Param('id') id: string) { return this.service.getStudentAssignments(id); }
  @Get('students/:id/quizzes') @ApiOperation({ summary: 'List quizzes assigned to a student' }) quizzes(@Param('id') id: string) { return this.service.getStudentQuizzes(id); }
  @Post('students/:id/submit-code') @ApiOperation({ summary: 'Submit code and receive immediate AI feedback' }) submitCode(@Param('id') id: string, @Body() dto: SubmitCodeDto) { return this.service.submitCode(id, dto); }
  @Post('students/:id/submit-video') @ApiOperation({ summary: 'Submit a video URL and transcript for AI analysis' }) submitVideo(@Param('id') id: string, @Body() dto: SubmitVideoDto) { return this.service.submitVideo(id, dto); }
  @Get('students/:id/feedback') @ApiOperation({ summary: 'Get AI and mentor feedback' }) feedback(@Param('id') id: string) { return this.service.getFeedback(id); }
  @Get('students/:id/progress') @ApiOperation({ summary: 'Get learning progress summary' }) progress(@Param('id') id: string) { return this.service.getProgress(id); }
  @Post('students/:id/quizzes/:quizId/submit') @ApiOperation({ summary: 'Submit a quiz; objective questions are automatically graded' }) submitQuiz(@Param('id') id: string, @Param('quizId') quizId: string, @Body() dto: SubmitQuizDto) { return this.service.submitQuiz(id, quizId, dto); }

  @Get('mentors/:id/mentees') @ApiOperation({ summary: 'Get students assigned to a mentor' }) mentees(@Param('id') id: string) { return this.service.getMentorMentees(id); }
  @Get('mentors/:id/mentor-requests') @ApiOperation({ summary: 'Get pending and past mentorship requests' }) mentorRequests(@Param('id') id: string) { return this.service.getMentorRequests(id); }
  @Post('mentors/:id/mentor-requests/:requestId') @ApiOperation({ summary: 'Accept or decline a mentorship request' }) decideRequest(@Param('id') id: string, @Param('requestId') requestId: string, @Body() dto: ReviewMentorRequestDto) { return this.service.decideMentorRequest(id, requestId, dto.decision as 'accepted' | 'declined'); }
  @Post('mentors/:id/create-assignment') @ApiOperation({ summary: 'Create and assign learning work' }) createAssignment(@Param('id') id: string, @Body() dto: CreateAssignmentDto) { return this.service.createAssignment(id, dto); }
  @Post('mentors/:id/create-quiz') @ApiOperation({ summary: 'Create and assign a quiz' }) createQuiz(@Param('id') id: string, @Body() dto: CreateQuizDto) { return this.service.createQuiz(id, dto); }
  @Get('mentors/:id/pending-reviews') @ApiOperation({ summary: 'Get submissions awaiting mentor review' }) pendingReviews(@Param('id') id: string) { return this.service.getPendingReviews(id); }
  @Post('mentors/:id/submissions/:submissionId/feedback') @ApiOperation({ summary: 'Add or override AI feedback' }) mentorFeedback(@Param('id') id: string, @Param('submissionId') submissionId: string, @Body() dto: MentorFeedbackDto) { return this.service.addMentorFeedback(id, submissionId, dto); }
}
