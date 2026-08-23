import { MentorSessionService } from '../src/modules/mentor-session/mentor-session.service';

describe('MentorSessionService', () => {
  let service: MentorSessionService;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    service = new MentorSessionService();
    fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
    process.env.GROQ_API_KEY = 'test-key';
  });

  afterEach(() => {
    for (const sessionId of Array.from((service as any).sessions.keys()) as string[]) {
      service.end(sessionId, false);
    }
    delete process.env.GROQ_API_KEY;
    jest.restoreAllMocks();
  });

  it('falls back to local questions when Groq rejects JSON validation', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      text: jest.fn().mockResolvedValue(`{"error":{"message":"Failed to validate JSON. Please adjust your prompt."}}`),
    });

    service.start({ sessionId: 'session-1', studentId: 'student-1', mentorId: 'mentor-1', topic: 'React hooks' });
    const session = (service as any).session('session-1');
    session.transcripts.push('I understand useState but I still get confused about useEffect dependencies and rerenders.');

    const result = await service.analyzeAfterPause('session-1');

    expect(result.status).toBe('suggested');
    expect(session.history.length).toBeGreaterThan(0);
    expect(session.history[0]).toMatch(/\?/);
  });

  it('recovers questions from a plain-text AI response', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: '1. What should I focus on first to understand useEffect better?\n2. Can you explain how dependencies affect rerenders?',
            },
          },
        ],
      }),
    });

    service.start({ sessionId: 'session-2', studentId: 'student-1', mentorId: 'mentor-1', topic: 'React hooks' });
    const session = (service as any).session('session-2');
    session.transcripts.push('I understand useState but I still get confused about useEffect dependencies and rerenders.');

    const result = await service.analyzeAfterPause('session-2');

    expect(result.status).toBe('suggested');
    expect(session.history).toEqual([
      'What should I focus on first to understand useEffect better?',
      'Can you explain how dependencies affect rerenders?',
    ]);
  });
});
