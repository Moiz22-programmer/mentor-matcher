import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenaiService {
  private readonly logger = new Logger(OpenaiService.name);
  private readonly openai: OpenAI;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('app.groq.apiKey');
    this.model = this.configService.get<string>('app.groq.model', 'openai/gpt-oss-20b');

    if (!apiKey) {
      this.logger.warn('GROQ_API_KEY not set. AI features will not work.');
    }

    this.openai = new OpenAI({
      apiKey: apiKey || 'dummy-key',
      baseURL: this.configService.get<string>('app.groq.baseUrl'),
    });
  }

  async reviewCode(code: string, language: string, context = ''): Promise<{ score: number; feedback: string; suggestions: string[] }> {
    if (!this.configService.get<string>('app.groq.apiKey')) {
      return { score: 0, feedback: 'AI review is unavailable until GROQ_API_KEY is configured.', suggestions: ['Configure GROQ_API_KEY to enable automatic review.'] };
    }
    const prompt = `Review this ${language} submission for a student. Context: ${context}\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\`\nReturn JSON: {"score": number 0-100, "feedback": "concise detailed feedback", "suggestions": ["actionable suggestion"]}`;
    try {
      const response = await this.openai.chat.completions.create({ model: this.model, messages: [{ role: 'system', content: 'You are a precise senior code reviewer. Respond with valid JSON only.' }, { role: 'user', content: prompt }], temperature: 0.3, max_tokens: 1000 });
      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      this.logger.error(`Code review failed: ${error.message}`);
      throw new Error('Failed to review code. Please try again.');
    }
  }

  async reviewVideo(transcript: string, context = ''): Promise<{ score: number; feedback: string; suggestions: string[] }> {
    if (!transcript.trim()) return { score: 0, feedback: 'Please include a transcript so the AI can assess the video. The submitted link is ready for your mentor to review.', suggestions: ['Add a transcript from Loom, YouTube, or another transcription tool.'] };
    if (!this.configService.get<string>('app.groq.apiKey')) {
      return { score: 0, feedback: 'AI video analysis is unavailable until GROQ_API_KEY is configured.', suggestions: ['Configure GROQ_API_KEY to enable automatic analysis.'] };
    }
    const prompt = `Assess this student video transcript for clarity, technical accuracy, and explanation quality. Context: ${context}\n\nTranscript:\n${transcript}\n\nReturn JSON: {"score": number 0-100, "feedback": "concise detailed feedback", "suggestions": ["actionable suggestion"]}`;
    try {
      const response = await this.openai.chat.completions.create({ model: this.model, messages: [{ role: 'system', content: 'You are a technical communication coach. Respond with valid JSON only.' }, { role: 'user', content: prompt }], temperature: 0.3, max_tokens: 1000 });
      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      this.logger.error(`Video review failed: ${error.message}`);
      throw new Error('Failed to analyze video. Please try again.');
    }
  }

  async composeMentorshipEmail(input: { senderRole: string; senderName: string; recipientName: string; summary: string; type?: string }): Promise<{ subject: string; body: string }> {
    const fallback = {
      subject: input.type === 'feedback' ? `Feedback from ${input.senderName}` : `Update from ${input.senderName}`,
      body: `Hi ${input.recipientName},\n\n${input.summary}\n\nBest regards,\n${input.senderName}`,
    };
    if (!this.configService.get<string>('app.groq.apiKey')) return fallback;
    const prompt = `Write a concise, warm professional email for a mentorship platform. Sender is ${input.senderName}, a ${input.senderRole}. Recipient is ${input.recipientName}. Purpose: ${input.type || 'work-update'}. Notes to express: ${input.summary}. Return valid JSON only: {"subject":"...","body":"..."}. Do not invent achievements or commitments.`;
    try {
      const response = await this.openai.chat.completions.create({ model: this.model, messages: [{ role: 'system', content: 'You write concise, supportive mentorship emails. Return valid JSON only.' }, { role: 'user', content: prompt }], temperature: 0.5, max_tokens: 500 });
      const parsed = JSON.parse(response.choices[0].message.content || '{}');
      return { subject: parsed.subject || fallback.subject, body: parsed.body || fallback.body };
    } catch (error) {
      this.logger.error(`Email composition failed: ${error.message}`);
      return fallback;
    }
  }

  /**
   * Analyze interview video transcript and provide feedback
   */
  async analyzeInterview(transcript: string): Promise<{
    score: number;
    strengths: string[];
    improvements: string[];
    overallFeedback: string;
  }> {
    const prompt = `You are an expert interview coach. Analyze the following interview transcript and provide structured feedback.

Transcript:
"""${transcript}"""

Provide your response in this exact JSON format:
{
  "score": <number 1-10>,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "overallFeedback": "2-3 sentence summary"
}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: 'You are a professional interview coach. Always respond with valid JSON.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      this.logger.error(`Interview analysis failed: ${error.message}`);
      throw new Error('Failed to analyze interview. Please try again.');
    }
  }

  /**
   * Analyze weekly progress survey responses
   */
  async analyzeWeeklyProgress(responses: {
    goalsMet: string;
    challenges: string;
    nextWeekGoals: string;
    morale: number;
  }): Promise<{
    summary: string;
    achievements: string[];
    recommendations: string[];
    motivationMessage: string;
    progressScore: number;
  }> {
    const prompt = `You are a supportive mentorship coach. Analyze this weekly progress report and provide encouraging feedback.

Weekly Report:
- Goals Met: ${responses.goalsMet}
- Challenges Faced: ${responses.challenges}
- Next Week Goals: ${responses.nextWeekGoals}
- Morale (1-10): ${responses.morale}

Provide your response in this exact JSON format:
{
  "summary": "Brief overview of the week",
  "achievements": ["achievement 1", "achievement 2"],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "motivationMessage": "Personalized encouraging message (2-3 sentences)",
  "progressScore": <number 1-10>
}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: 'You are an encouraging mentorship coach. Always respond with valid JSON.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.8,
        max_tokens: 1000,
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      this.logger.error(`Weekly progress analysis failed: ${error.message}`);
      throw new Error('Failed to analyze weekly progress. Please try again.');
    }
  }

  /**
   * Generate a coding skill challenge
   */
  async generateChallenge(skill: string, difficulty: 'easy' | 'medium' | 'hard'): Promise<{
    title: string;
    description: string;
    requirements: string[];
    starterCode: string;
    testCases: { input: string; expectedOutput: string }[];
    hints: string[];
    timeLimit: number;
  }> {
    const prompt = `You are a technical interviewer. Generate a ${difficulty} coding challenge for ${skill}.

Provide your response in this exact JSON format:
{
  "title": "Challenge title",
  "description": "Detailed problem description with examples",
  "requirements": ["requirement 1", "requirement 2", "requirement 3"],
  "starterCode": "function solution() { \
  // Your code here \
}",
  "testCases": [
    { "input": "test input 1", "expectedOutput": "expected output 1" },
    { "input": "test input 2", "expectedOutput": "expected output 2" }
  ],
  "hints": ["hint 1", "hint 2"],
  "timeLimit": <minutes, e.g., 30>
}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: 'You are a technical interviewer. Always respond with valid JSON.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      this.logger.error(`Challenge generation failed: ${error.message}`);
      throw new Error('Failed to generate challenge. Please try again.');
    }
  }

  /**
   * Evaluate submitted code against challenge
   */
  async evaluateCode(
    challengeDescription: string,
    code: string,
    language: string,
  ): Promise<{
    passed: boolean;
    score: number;
    feedback: string;
    improvements: string[];
    complexity: string;
  }> {
    const prompt = `You are a code reviewer. Evaluate the following ${language} solution.

Challenge:
${challengeDescription}

Submitted Code:
\`\`\`${language}
${code}
\`\`\`

Provide your response in this exact JSON format:
{
  "passed": <boolean>,
  "score": <number 0-100>,
  "feedback": "Detailed feedback on the solution",
  "improvements": ["improvement 1", "improvement 2"],
  "complexity": "Time/space complexity analysis"
}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: 'You are a senior code reviewer. Always respond with valid JSON.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 1500,
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      this.logger.error(`Code evaluation failed: ${error.message}`);
      throw new Error('Failed to evaluate code. Please try again.');
    }
  }

  /**
   * AI Assignment Generator for Mentors
   */
  async generateAssignment(
    topic: string,
    role: string = 'Junior Developer',
    type: string = 'assignment',
  ): Promise<{
    title: string;
    description: string;
    codeSnippet?: string;
    suggestedDeadlineDays: number;
  }> {
    const fallback = {
      title: `${topic} Challenge`,
      description: `Complete the ${topic} task by writing clean code and verifying edge cases for a ${role}.`,
      codeSnippet: `// Starter code for ${topic}\nfunction solution() {\n  // Implement your logic here\n}`,
      suggestedDeadlineDays: 3,
    };

    if (!this.configService.get<string>('app.groq.apiKey')) {
      return fallback;
    }

    const prompt = `Generate a realistic learning ${type} for a mentee with the target role "${role}".
Topic: "${topic}".

Return ONLY valid JSON in this exact structure:
{
  "title": "Clear concise title",
  "description": "Step by step instructions and requirements for the mentee",
  "codeSnippet": "Starter boilerplate code or solution reference",
  "suggestedDeadlineDays": 3
}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: 'You are a senior tech lead creating student assignments. Return valid JSON only.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.6,
        max_tokens: 1000,
      });

      const content = response.choices[0].message.content || '{}';
      const parsed = JSON.parse(content);
      return {
        title: parsed.title || fallback.title,
        description: parsed.description || fallback.description,
        codeSnippet: parsed.codeSnippet || fallback.codeSnippet,
        suggestedDeadlineDays: parsed.suggestedDeadlineDays || fallback.suggestedDeadlineDays,
      };
    } catch (error) {
      this.logger.error(`Assignment generation failed: ${error.message}`);
      return fallback;
    }
  }
}

