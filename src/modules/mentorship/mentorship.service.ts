import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { EmailService } from '../email/email.service';
import { OpenaiService } from '../openai/openai.service';
import { MentorsService } from '../mentors/mentors.service';
import { ComposeAndSendEmailDto, CreateAssignmentDto, CreateQuizDto, MentorFeedbackDto, MentorRequestDto, RegisterStudentDto, SubmitCodeDto, SubmitQuizDto, SubmitVideoDto } from './dto/mentorship.dto';

type Student = RegisterStudentDto & { id: string; mentorId?: string; progressPercentage: number; createdAt: string };
type MentorRequest = { id: string; studentId: string; mentorId: string; message?: string; status: 'pending' | 'accepted' | 'declined'; createdAt: string };
type Assignment = CreateAssignmentDto & { id: string; mentorId: string; status: 'assigned' | 'submitted' | 'reviewed'; createdAt: string };
type Submission = { id: string; assignmentId: string; studentId: string; type: 'code' | 'video'; content: string; language?: string; transcript?: string; aiScore: number; aiFeedback: string; mentorScore?: number; mentorFeedback?: string; status: 'submitted' | 'reviewed'; submittedAt: string };
type Quiz = Omit<CreateQuizDto, 'questions'> & { id: string; mentorId: string; questions: CreateQuizDto['questions']; createdAt: string };
type QuizAttempt = { id: string; quizId: string; studentId: string; answers: Record<string, string>; autoScore: number; pendingReview: boolean; submittedAt: string };

@Injectable()
export class MentorshipService {
  private readonly logger = new Logger(MentorshipService.name);
  private students: Student[] = [];
  private requests: MentorRequest[] = [];
  private assignments: Assignment[] = [];
  private submissions: Submission[] = [];
  private quizzes: Quiz[] = [];
  private quizAttempts: QuizAttempt[] = [];

  constructor(private readonly openai: OpenaiService, private readonly email: EmailService, private readonly mentors: MentorsService) {}

  async registerStudent(dto: RegisterStudentDto) {
    const existing = this.students.find((student) => student.email.toLowerCase() === dto.email.toLowerCase());
    if (existing) return existing;
    const student: Student = { ...dto, id: this.id('stu'), progressPercentage: 0, createdAt: new Date().toISOString() };
    this.students.unshift(student);
    await this.email.sendStudentWelcome(student.email, student.name).catch(() => undefined);
    return student;
  }

  getStudent(id: string) { return this.student(id); }
  getStudents() { return this.students; }

  createMentorRequest(studentId: string, dto: MentorRequestDto) {
    this.student(studentId);
    this.mentors.getMentorById(dto.mentorId);
    const existing = this.requests.find((request) => request.studentId === studentId && request.mentorId === dto.mentorId && request.status === 'pending');
    if (existing) return existing;
    const request: MentorRequest = { id: this.id('mrq'), studentId, mentorId: dto.mentorId, message: dto.message, status: 'pending', createdAt: new Date().toISOString() };
    this.requests.unshift(request);
    return request;
  }

  decideMentorRequest(mentorId: string, requestId: string, decision: 'accepted' | 'declined') {
    const request = this.requests.find((item) => item.id === requestId && item.mentorId === mentorId);
    if (!request) throw new NotFoundException('Mentor request not found.');
    request.status = decision;
    if (decision === 'accepted') this.student(request.studentId).mentorId = mentorId;
    return request;
  }

  getMentorMentees(mentorId: string) { return this.students.filter((student) => student.mentorId === mentorId); }
  getStudentMentor(studentId: string) {
    const mentorId = this.student(studentId).mentorId;
    if (!mentorId) throw new NotFoundException('Student has not been assigned a mentor yet.');
    return this.mentors.getMentorById(mentorId);
  }
  getMentorRequests(mentorId: string) { return this.requests.filter((request) => request.mentorId === mentorId); }

  async createAssignment(mentorId: string, dto: CreateAssignmentDto) {
    const student = this.student(dto.studentId);
    this.assertAssigned(mentorId, student);
    const assignment: Assignment = { ...dto, id: this.id('ass'), mentorId, status: 'assigned', createdAt: new Date().toISOString() };
    this.assignments.unshift(assignment);
    await this.email.sendAssignmentAssigned(student.email, student.name, assignment.title, assignment.deadline).catch(() => undefined);
    return assignment;
  }

  getStudentAssignments(studentId: string) { this.student(studentId); return this.assignments.filter((item) => item.studentId === studentId); }

  async submitCode(studentId: string, dto: SubmitCodeDto) {
    const assignment = this.assignment(dto.assignmentId, studentId);
    if (assignment.submissionType !== 'code') throw new BadRequestException('This assignment does not accept code submissions.');
    const review = await this.openai.reviewCode(dto.code, dto.language, assignment.description);
    const submission: Submission = { id: this.id('sub'), assignmentId: assignment.id, studentId, type: 'code', content: dto.code, language: dto.language, aiScore: review.score, aiFeedback: review.feedback, status: 'submitted', submittedAt: new Date().toISOString() };
    assignment.status = 'submitted'; this.submissions.unshift(submission);
    const student = this.student(studentId);
    await this.email.sendAiReview(student.email, student.name, 'Code', review.score, review.feedback).catch(() => undefined);
    return submission;
  }

  async submitVideo(studentId: string, dto: SubmitVideoDto) {
    const assignment = this.assignment(dto.assignmentId, studentId);
    if (assignment.submissionType !== 'video') throw new BadRequestException('This assignment does not accept video submissions.');
    const analysis = await this.openai.reviewVideo(dto.transcript || '', assignment.description);
    const submission: Submission = { id: this.id('sub'), assignmentId: assignment.id, studentId, type: 'video', content: dto.videoUrl, transcript: dto.transcript, aiScore: analysis.score, aiFeedback: analysis.feedback, status: 'submitted', submittedAt: new Date().toISOString() };
    assignment.status = 'submitted'; this.submissions.unshift(submission);
    const student = this.student(studentId);
    await this.email.sendAiReview(student.email, student.name, 'Video', analysis.score, analysis.feedback).catch(() => undefined);
    return submission;
  }

  getFeedback(studentId: string) { this.student(studentId); return this.submissions.filter((item) => item.studentId === studentId); }
  getPendingReviews(mentorId: string) { return this.submissions.filter((item) => item.status === 'submitted' && this.assignments.find((assignment) => assignment.id === item.assignmentId)?.mentorId === mentorId); }

  async addMentorFeedback(mentorId: string, submissionId: string, dto: MentorFeedbackDto) {
    const submission = this.submissions.find((item) => item.id === submissionId);
    if (!submission) throw new NotFoundException('Submission not found.');
    const assignment = this.assignment(submission.assignmentId, submission.studentId);
    if (assignment.mentorId !== mentorId) throw new NotFoundException('Submission not found for this mentor.');
    submission.mentorScore = dto.score; submission.mentorFeedback = dto.feedback; submission.status = 'reviewed'; assignment.status = 'reviewed';
    const student = this.student(submission.studentId);
    await this.email.sendMentorFeedback(student.email, student.name, dto.score ?? submission.aiScore, dto.feedback).catch(() => undefined);
    return submission;
  }

  async createQuiz(mentorId: string, dto: CreateQuizDto) {
    const student = this.student(dto.studentId); this.assertAssigned(mentorId, student);
    const quiz: Quiz = { ...dto, id: this.id('quiz'), mentorId, createdAt: new Date().toISOString() }; this.quizzes.unshift(quiz);
    await this.email.sendAssignmentAssigned(student.email, student.name, `Quiz: ${quiz.title}`, 'Complete before your next session').catch(() => undefined);
    return quiz;
  }

  getStudentQuizzes(studentId: string) { this.student(studentId); return this.quizzes.filter((quiz) => quiz.studentId === studentId); }
  submitQuiz(studentId: string, quizId: string, dto: SubmitQuizDto) {
    const quiz = this.quizzes.find((item) => item.id === quizId && item.studentId === studentId);
    if (!quiz) throw new NotFoundException('Quiz not found.');
    const gradable = quiz.questions.filter((question) => question.type !== 'essay');
    const correct = gradable.filter((question, index) => (dto.answers[String(index)] || '').trim().toLowerCase() === (question.answer || '').trim().toLowerCase()).length;
    const autoScore = gradable.length ? Math.round((correct / gradable.length) * 100) : 0;
    const attempt: QuizAttempt = { id: this.id('qat'), quizId, studentId, answers: dto.answers, autoScore, pendingReview: quiz.questions.some((question) => question.type === 'essay'), submittedAt: new Date().toISOString() };
    this.quizAttempts.unshift(attempt); return attempt;
  }

  getProgress(studentId: string) {
    const student = this.student(studentId); const work = this.assignments.filter((item) => item.studentId === studentId);
    const reviewed = work.filter((item) => item.status === 'reviewed').length;
    return { studentId, learningGoal: student.learningGoal, progressPercentage: work.length ? Math.round((reviewed / work.length) * 100) : student.progressPercentage, assignments: { total: work.length, reviewed }, submissions: this.getFeedback(studentId).length };
  }

  async composeAndSendEmail(dto: ComposeAndSendEmailDto) {
    let draft = this.composeFallbackEmail(dto);
    try {
      draft = await this.openai.composeMentorshipEmail(dto);
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'Unknown email composition error.';
      this.logger.error(`AI email composition failed for ${dto.recipientEmail}: ${detail}`);
    }
    try {
      const sent = await this.email.sendAutomatedMessage(dto.recipientEmail, draft.subject, draft.body);
      return { ...draft, recipientEmail: dto.recipientEmail, delivery: sent ? 'sent' : 'drafted—configure RESEND_API_KEY to deliver email' };
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'Email delivery failed.';
      return { ...draft, recipientEmail: dto.recipientEmail, delivery: `drafted—delivery failed (${detail})` };
    }
  }

  private composeFallbackEmail(dto: ComposeAndSendEmailDto) {
    const normalizedType = dto.type || 'work-update';
    const subject = normalizedType === 'feedback'
      ? `Feedback from ${dto.senderName}`
      : normalizedType === 'reminder'
        ? `Reminder from ${dto.senderName}`
        : normalizedType === 'general'
          ? `Message from ${dto.senderName}`
          : `Update from ${dto.senderName}`;

    return {
      subject,
      body: `Hi ${dto.recipientName},\n\n${dto.summary}\n\nBest regards,\n${dto.senderName}`,
    };
  }

  private student(id: string) { const student = this.students.find((item) => item.id === id); if (!student) throw new NotFoundException(`Student with ID "${id}" not found.`); return student; }
  private assignment(id: string, studentId: string) { const assignment = this.assignments.find((item) => item.id === id && item.studentId === studentId); if (!assignment) throw new NotFoundException('Assignment not found.'); return assignment; }
  private assertAssigned(mentorId: string, student: Student) { if (student.mentorId !== mentorId) throw new BadRequestException('Student is not assigned to this mentor.'); }
  private id(prefix: string) { return `${prefix}_${uuid().slice(0, 8)}`; }
}
