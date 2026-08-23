import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Subject } from 'rxjs';

export type AiSuggestion = { questions_to_ask: string[]; concepts_to_explore: string[]; gaps_detected: string[]; tips: string[]; confidence: number; reason?: string; timestamp: string };
type Session = { id: string; studentId: string; mentorId: string; topic: string; createdAt: number; transcripts: string[]; history: string[]; lastAnalysis: number; lastAnalyzedTranscriptCount: number; events: Subject<MessageEvent>; cleanup: ReturnType<typeof setTimeout> };

@Injectable()
export class MentorSessionService {
  private readonly sessions = new Map<string, Session>();

  start(input: { sessionId: string; studentId: string; mentorId: string; topic: string }) {
    if (!input.sessionId || !input.topic) throw new BadRequestException('A session ID and topic are required.');
    this.end(input.sessionId, false);
    const session: Session = { id: input.sessionId, studentId: input.studentId, mentorId: input.mentorId, topic: input.topic, createdAt: Date.now(), transcripts: [], history: [], lastAnalysis: 0, lastAnalyzedTranscriptCount: 0, events: new Subject<MessageEvent>(), cleanup: setTimeout(() => this.end(input.sessionId, false), 24 * 60 * 60 * 1000) };
    this.sessions.set(input.sessionId, session);
    session.events.next({ data: JSON.stringify({ type: 'session-started', status: 'listening', message: 'AI mentor is listening securely.' }) } as MessageEvent);
    return { status: 'started', sessionId: input.sessionId };
  }

  stream(sessionId: string) { return this.session(sessionId).events.asObservable(); }

  async audio(sessionId: string, audioBase64: string, mimeType = 'audio/webm', language?: string) {
    const session = this.session(sessionId);
    if (!audioBase64) throw new BadRequestException('Audio data is required.');
    try {
      const transcript = await this.transcribe(audioBase64, mimeType, language);

      if (transcript && transcript.trim()) {
        session.transcripts.push(transcript);
        session.transcripts = session.transcripts.slice(-8);
        session.events.next({ data: JSON.stringify({ type: 'transcript', text: transcript, timestamp: new Date().toISOString() }) } as MessageEvent);

      }
      return { status: 'processed', hasTranscript: Boolean(transcript) };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Audio processing failed.';
      session.events.next({ data: JSON.stringify({ type: 'error', error_message: message }) } as MessageEvent);
      return { status: 'error', message };
    }
  }

  async analyzeAfterPause(sessionId: string) {
    const session = this.session(sessionId);
    if (session.transcripts.length === session.lastAnalyzedTranscriptCount) return { status: 'waiting-for-transcript' };
    if (Date.now() - session.lastAnalysis < 2500) return { status: 'debounced' };
    session.lastAnalysis = Date.now();
    const transcriptCount = session.transcripts.length;
    try {
      const suggestion = await this.analyze(session);
      session.lastAnalyzedTranscriptCount = transcriptCount;
      if (!suggestion) return { status: 'not-enough-context' };
      session.history.push(...suggestion.questions_to_ask);
      session.history = session.history.slice(-30);
      session.events.next({ data: JSON.stringify({ type: 'ai-suggestions', ...suggestion }) } as MessageEvent);
      return { status: 'suggested' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'AI analysis failed.';
      session.events.next({ data: JSON.stringify({ type: 'error', error_message: message }) } as MessageEvent);
      return { status: 'error', message };
    }
  }

  end(sessionId: string, notify = true) {
    const session = this.sessions.get(sessionId); if (!session) return { status: 'already-ended' };
    if (notify) session.events.next({ data: JSON.stringify({ type: 'session-ended', status: 'ended', message: 'AI mentor session ended.' }) } as MessageEvent);
    clearTimeout(session.cleanup); session.events.complete(); this.sessions.delete(sessionId); return { status: 'ended' };
  }

  private async transcribe(audioBase64: string, mimeType: string, language?: string) {
    const rawKey = process.env.GROQ_API_KEY || process.env.GROK_API_KEY;
    const key = rawKey ? rawKey.trim() : '';
    if (!key || key.includes('your-groq-api-key')) return '';
    const bytes = Buffer.from(audioBase64.replace(/^data:.*;base64,/, ''), 'base64');
    // Chrome labels MediaRecorder chunks as "audio/webm;codecs=opus". Groq
    // expects the container MIME type, while the .webm filename identifies it.
    const normalizedMime = (mimeType || 'audio/webm').split(';')[0].trim() || 'audio/webm';
    const form = new FormData();
    form.append('file', new Blob([bytes], { type: normalizedMime }), 'session-audio.webm');
    form.append('model', process.env.GROQ_TRANSCRIPTION_MODEL || 'whisper-large-v3-turbo');
    form.append('response_format', 'json');
    // Support Urdu and other languages - 'ur' is the ISO 639-1 code for Urdu
    if (language && language.length === 2) {
      form.append('language', language);
    }
    try {
      const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', { method: 'POST', headers: { authorization: `Bearer ${key}` }, body: form });
      if (!response.ok) {
        const errText = await response.text();
        console.error('Groq Whisper Transcription error:', response.status, errText);
        throw new Error('Groq transcription failed. Check GROQ_API_KEY and GROQ_TRANSCRIPTION_MODEL.');
      }
      const result = await response.json() as { text?: string };
      return result.text?.trim() || '';
    } catch (err) {
      console.error('Transcription exception:', err);
      throw err;
    }
  }

  private async analyze(session: Session): Promise<AiSuggestion | null> {
    if (!session.transcripts.length) return null;

    const rawKey = process.env.GROQ_API_KEY || process.env.GROK_API_KEY;
    const key = rawKey ? rawKey.trim() : '';
    const recentConvo = session.transcripts.join(' ').trim();
    if (recentConvo.length < 25) return null;

    // Detect if conversation is in Urdu/Hindi
    const urduRegex = /[\u0600-\u06FF]/;
    const hasUrduScript = urduRegex.test(recentConvo);

    if (!key || key.includes('your-groq-api-key')) throw new Error('Live AI needs a configured GROQ_API_KEY on the server.');
    const prompt = `You are a silent mentor-meeting copilot. Review only the actual recent conversation below between a mentor and mentee.

Session topic: ${session.topic}
Recent conversation: ${recentConvo}
Previously suggested questions: ${session.history.join(' | ') || 'None'}

${hasUrduScript ? 'IMPORTANT: The conversation is in Urdu (اردو). Generate your questions in Urdu language using Urdu script.' : ''}

Generate 1 to 3 concise, natural questions the mentee can ask next. Questions must deepen the current discussion, must not repeat previous suggestions, and must not invent facts. If there is not enough meaningful context, return an empty array. Do not answer the topic yourself.

Return ONLY valid JSON in this exact shape:
{"questions_to_ask":["question"],"concepts_to_explore":[],"gaps_detected":[],"tips":[],"confidence":0}`;
    const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST', signal: controller.signal,
        headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          model: process.env.GROQ_MODEL || process.env.GROK_MODEL || 'openai/gpt-oss-20b',
          temperature: 0.2,
          max_tokens: 250,
          messages: [
            { role: 'system', content: 'Return only a JSON object with concise follow-up questions. Do not use Markdown or code fences.' },
            { role: 'user', content: prompt },
          ],
        })
      });
      if (response.ok) {
        const body = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
        const raw = body.choices?.[0]?.message?.content?.trim() || '';
        const parsed = this.parseAiSuggestion(raw, session.history);
        if (parsed) return parsed;
        console.warn('Groq returned unparsable mentor suggestions, using fallback questions.');
        return this.buildFallbackSuggestion(session, recentConvo, hasUrduScript);
      }
      const detail = await response.text();
      console.error(`Groq AI analysis failed (${response.status}): ${detail.slice(0, 240)}`);
      return this.buildFallbackSuggestion(session, recentConvo, hasUrduScript);
    } catch (err) {
      console.error('Groq LLM completion error:', err);
      return this.buildFallbackSuggestion(session, recentConvo, hasUrduScript);
    } finally { clearTimeout(timeout); }
    return null;
  }

  private parseAiSuggestion(raw: string, history: string[]): AiSuggestion | null {
    if (!raw) return null;

    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]) as Partial<AiSuggestion>;
        return this.normalizeSuggestion(parsed, history);
      } catch (error) {
        console.warn('Failed to parse AI mentor JSON response:', error);
      }
    }

    const questions = this.uniqueQuestions(this.extractQuestions(raw), history);
    if (!questions.length) return null;
    return {
      questions_to_ask: questions,
      concepts_to_explore: [],
      gaps_detected: [],
      tips: [],
      confidence: 0.55,
      reason: 'Recovered questions from a non-JSON AI response.',
      timestamp: new Date().toISOString(),
    };
  }

  private normalizeSuggestion(parsed: Partial<AiSuggestion>, history: string[]): AiSuggestion | null {
    const questions = this.uniqueQuestions(Array.isArray(parsed.questions_to_ask) ? parsed.questions_to_ask : [], history);
    if (!questions.length) return null;
    const toList = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim())).slice(0, 3) : [];
    const confidence = typeof parsed.confidence === 'number' && Number.isFinite(parsed.confidence)
      ? Math.min(1, Math.max(0, parsed.confidence))
      : 0.7;

    return {
      questions_to_ask: questions,
      concepts_to_explore: toList(parsed.concepts_to_explore),
      gaps_detected: toList(parsed.gaps_detected),
      tips: toList(parsed.tips),
      confidence,
      reason: typeof parsed.reason === 'string' ? parsed.reason.trim() : undefined,
      timestamp: new Date().toISOString(),
    };
  }

  private buildFallbackSuggestion(session: Session, recentConvo: string, hasUrduScript: boolean): AiSuggestion {
    const keyword = this.extractTopicKeyword(recentConvo, hasUrduScript);
    const promptKeyword = keyword || session.topic || 'this topic';
    const candidates = hasUrduScript
      ? [
        `کیا آپ ${promptKeyword} کے بارے میں مرکزی نکتہ تھوڑا مزید واضح کر سکتے ہیں`,
        'جو ہم نے ابھی بات کی ہے، اس کے بعد میرے لیے بہترین اگلا قدم کیا ہے',
        'اس موضوع میں میری سمجھ کی سب سے بڑی کمی کیا لگتی ہے',
      ]
      : [
        `Can you explain the main point about ${promptKeyword} a bit more clearly`,
        'What should I focus on first to improve this part',
        'What would be the best next step for me after this discussion',
      ];
    const questions = this.uniqueQuestions(candidates, session.history);

    return {
      questions_to_ask: questions.length ? questions : this.uniqueQuestions(hasUrduScript
        ? ['کیا آپ اس نکتے کو ایک سادہ مثال کے ساتھ دوبارہ سمجھا سکتے ہیں']
        : ['Can you walk me through that point again with a simple example'], session.history),
      concepts_to_explore: [],
      gaps_detected: [],
      tips: [],
      confidence: 0.35,
      reason: 'Local fallback used because the AI response was unavailable or malformed.',
      timestamp: new Date().toISOString(),
    };
  }

  private extractQuestions(raw: string): string[] {
    const cleaned = raw.replace(/```json|```/gi, ' ').replace(/\r/g, ' ');
    const inlineMatches = cleaned.match(/[^.!?\n]*[?؟]/g) || [];
    const lineMatches = cleaned.split('\n').map(line => line.trim()).filter(line => /[?؟]$/.test(line));
    return [...inlineMatches, ...lineMatches]
      .map(question => question.replace(/^[-*•\d.)\s]+/, '').trim())
      .filter(Boolean);
  }

  private uniqueQuestions(candidates: string[], history: string[]): string[] {
    const seen = new Set(history.map(item => item.trim().toLocaleLowerCase()));
    const questions: string[] = [];

    for (const candidate of candidates) {
      const normalized = candidate.replace(/^[-*•\d.)\s]+/, '').replace(/\s+/g, ' ').trim();
      if (!normalized) continue;
      const isUrdu = /[\u0600-\u06FF]/.test(normalized);
      const question = /[?؟]$/.test(normalized) ? normalized : `${normalized}${isUrdu ? '؟' : '?'}`;
      const dedupeKey = question.trim().toLocaleLowerCase();
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);
      questions.push(question);
      if (questions.length === 3) break;
    }

    return questions;
  }

  private extractTopicKeyword(text: string, hasUrduScript: boolean): string {
    if (hasUrduScript) {
      const matches = text.match(/[\u0600-\u06FF]{3,}/g) || [];
      const stopWords = new Set(['اور', 'میں', 'یہ', 'وہ', 'کی', 'کے', 'کا', 'ہے', 'ہیں', 'سے', 'کو', 'پر', 'ایک', 'ہم', 'آپ']);
      return matches.find(word => !stopWords.has(word)) || '';
    }

    const matches = text.match(/[A-Za-z][A-Za-z0-9+-]{3,}/g) || [];
    const stopWords = new Set(['this', 'that', 'with', 'from', 'have', 'what', 'when', 'where', 'which', 'about', 'would', 'should', 'could', 'after', 'before', 'mentor', 'mentee']);
    return (matches.find(word => !stopWords.has(word.toLowerCase())) || '').toLowerCase();
  }

  private session(id: string) { const session = this.sessions.get(id); if (!session) throw new NotFoundException('Live session not found. Start a session first.'); return session; }
}
