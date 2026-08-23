import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
  private readonly fromEmail: string;
  private readonly resendConfigured: boolean;

  constructor(private readonly configService: ConfigService) {
    const rawApiKey = this.configService.get<string>('app.resend.apiKey');
    const apiKey = this.normalizeResendApiKey(rawApiKey);
    const rawFromEmail = this.configService.get<string>('app.resend.fromEmail', 'onboarding@resend.dev');
    this.fromEmail = this.normalizeFromEmail(rawFromEmail);
    this.resendConfigured = Boolean(apiKey);

    if (!this.resendConfigured) {
      this.logger.warn('RESEND_API_KEY not set. Email features will not work.');
    }

    this.resend = new Resend(apiKey || 'dummy-key');
  }

  async sendInterviewFeedback(
    to: string,
    menteeName: string,
    feedback: {
      score: number;
      strengths: string[];
      improvements: string[];
      overallFeedback: string;
    },
  ): Promise<void> {
    const strengthsList = feedback.strengths.map((s) => `<li>✅ ${s}</li>`).join('');
    const improvementsList = feedback.improvements.map((i) => `<li>⚡ ${i}</li>`).join('');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">🎯 Your Interview Feedback is Ready!</h1>
        <p>Hi ${menteeName},</p>
        <p>Great job completing your practice interview! Here is your personalized AI feedback:</p>

        <div style="background: #f0f9ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h2 style="color: #1e40af; margin-top: 0;">Overall Score: ${feedback.score}/10</h2>
          <p style="font-style: italic;">"${feedback.overallFeedback}"</p>
        </div>

        <h3 style="color: #059669;">💪 Your Strengths</h3>
        <ul>${strengthsList}</ul>

        <h3 style="color: #d97706;">🚀 Areas to Improve</h3>
        <ul>${improvementsList}</ul>

        <p style="margin-top: 30px;">Keep practicing! Your next interview will be even better. 💪</p>
        <p>Best,<br>The MentorMatcher Team</p>
      </div>
    `;

    await this.sendEmail(to, '🎯 Your Interview Feedback is Ready!', html);
  }

  async sendWeeklyProgressReport(
    to: string,
    menteeName: string,
    report: {
      summary: string;
      achievements: string[];
      recommendations: string[];
      motivationMessage: string;
      progressScore: number;
    },
  ): Promise<void> {
    const achievementsList = report.achievements.map((a) => `<li>🏆 ${a}</li>`).join('');
    const recommendationsList = report.recommendations.map((r) => `<li>💡 ${r}</li>`).join('');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #7c3aed;">📊 Your Weekly Progress Report</h1>
        <p>Hi ${menteeName},</p>

        <div style="background: #faf5ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h2 style="color: #6d28d9; margin-top: 0;">Week Summary</h2>
          <p>${report.summary}</p>
          <p style="font-size: 18px; font-weight: bold;">Progress Score: ${report.progressScore}/10 ⭐</p>
        </div>

        <h3 style="color: #059669;">🏆 Achievements This Week</h3>
        <ul>${achievementsList}</ul>

        <h3 style="color: #2563eb;">💡 Recommendations for Next Week</h3>
        <ul>${recommendationsList}</ul>

        <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-style: italic;">💬 "${report.motivationMessage}"</p>
        </div>

        <p>Keep up the amazing work! 🚀</p>
        <p>Best,<br>The MentorMatcher Team</p>
      </div>
    `;

    await this.sendEmail(to, '📊 Your Weekly Progress Report', html);
  }

  async sendChallengeResult(
    to: string,
    menteeName: string,
    challengeTitle: string,
    result: {
      passed: boolean;
      score: number;
      feedback: string;
      improvements: string[];
      complexity: string;
    },
    badgeEarned?: string,
  ): Promise<void> {
    const status = result.passed ? '✅ Passed' : '❌ Needs Improvement';
    const improvementsList = result.improvements.map((i) => `<li>🔧 ${i}</li>`).join('');
    const badgeHtml = badgeEarned
      ? `<div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
           <h3 style="color: #d97706; margin: 0;">🏅 Badge Earned: ${badgeEarned}</h3>
         </div>`
      : '';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">💻 Challenge Results: ${challengeTitle}</h1>
        <p>Hi ${menteeName},</p>

        <div style="background: ${result.passed ? '#ecfdf5' : '#fff7ed'}; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h2 style="color: ${result.passed ? '#059669' : '#d97706'}; margin-top: 0;">${status}</h2>
          <p style="font-size: 24px; font-weight: bold;">Score: ${result.score}/100</p>
        </div>

        ${badgeHtml}

        <h3 style="color: #4b5563;">📝 Feedback</h3>
        <p>${result.feedback}</p>

        <h3 style="color: #4b5563;">📊 Complexity Analysis</h3>
        <p>${result.complexity}</p>

        <h3 style="color: #d97706;">🔧 Suggested Improvements</h3>
        <ul>${improvementsList}</ul>

        <p>Keep coding and growing! 💪</p>
        <p>Best,<br>The MentorMatcher Team</p>
      </div>
    `;

    await this.sendEmail(to, `💻 Challenge Results: ${challengeTitle}`, html);
  }

  async sendWeeklySurvey(to: string, menteeName: string, surveyLink: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #7c3aed;">📋 Weekly Check-in Time!</h1>
        <p>Hi ${menteeName},</p>
        <p>It is Friday — time to reflect on your week! 🎯</p>
        <p>Your weekly progress survey helps us track your growth and provide personalized guidance.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${surveyLink}" 
             style="background: #7c3aed; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
            Complete Weekly Survey →
          </a>
        </div>

        <p>Takes only 2 minutes! ⏱️</p>
        <p>Best,<br>The MentorMatcher Team</p>
      </div>
    `;

    await this.sendEmail(to, '📋 Weekly Check-in Time!', html);
  }

  async sendStudentWelcome(to: string, name: string): Promise<void> {
    await this.sendEmail(to, 'Welcome to MentorMatcher', `<h1>Welcome, ${name}!</h1><p>Your learning profile is ready. Choose a mentor to begin your journey.</p>`);
  }

  async sendAssignmentAssigned(to: string, name: string, title: string, deadline: string): Promise<void> {
    await this.sendEmail(to, `New learning task: ${title}`, `<h1>New task assigned</h1><p>Hi ${name},</p><p><strong>${title}</strong></p><p>Due: ${deadline}</p><p>Open MentorMatcher to view the full instructions and submit your work.</p>`);
  }

  async sendAiReview(to: string, name: string, type: string, score: number, feedback: string): Promise<void> {
    await this.sendEmail(to, `Your ${type.toLowerCase()} AI review is ready`, `<h1>Your AI feedback is ready</h1><p>Hi ${name}, your ${type.toLowerCase()} received an initial score of <strong>${score}/100</strong>.</p><p>${feedback}</p><p>Your mentor can add personalized feedback soon.</p>`);
  }

  async sendMentorFeedback(to: string, name: string, score: number, feedback: string): Promise<void> {
    await this.sendEmail(to, 'New feedback from your mentor', `<h1>Your mentor has reviewed your work</h1><p>Hi ${name},</p><p>Score: <strong>${score}/100</strong></p><p>${feedback}</p>`);
  }

  async sendAutomatedMessage(to: string, subject: string, body: string): Promise<boolean> {
    const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;line-height:1.6;white-space:pre-line;"><h2 style="color:#4f46e5;">MentorMatcher</h2>${body.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>`;
    return this.sendEmail(to, subject, html);
  }

  private async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    if (!this.resendConfigured) {
      this.logger.log(`Email skipped (RESEND_API_KEY not configured): ${subject} → ${to}`);
      return false;
    }
    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html,
      });

      if (error) {
        this.logger.error(`Email failed to ${to}: ${error.message}`);
        throw new Error(`Failed to send email: ${error.message}`);
      }

      this.logger.log(`Email sent to ${to}: ${subject} (ID: ${data?.id})`);
      return true;
    } catch (error) {
      this.logger.error(`Email error: ${error.message}`);
      throw error;
    }
  }

  private normalizeResendApiKey(apiKey?: string): string {
    const normalized = apiKey?.trim() || '';
    if (!normalized || /^re_your-/i.test(normalized)) return '';
    return normalized;
  }

  private normalizeFromEmail(fromEmail?: string): string {
    const normalized = fromEmail?.trim() || '';
    if (!normalized || normalized === 'mentor@mentormatcher.app') return 'onboarding@resend.dev';
    return normalized;
  }
}
