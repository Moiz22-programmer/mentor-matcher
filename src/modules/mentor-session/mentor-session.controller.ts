import { Body, Controller, Get, Param, Post, Sse } from '@nestjs/common';
import { MentorSessionService } from './mentor-session.service';

@Controller('mentor-sessions')
export class MentorSessionController {
  constructor(private readonly sessions: MentorSessionService) {}
  @Post('start') start(@Body() input: { sessionId: string; studentId: string; mentorId: string; topic: string }) { return this.sessions.start(input); }
  @Sse(':sessionId/events') events(@Param('sessionId') sessionId: string) { return this.sessions.stream(sessionId); }
  @Post(':sessionId/audio') audio(@Param('sessionId') sessionId: string, @Body() input: { audioBase64: string; mimeType?: string; language?: string }) { return this.sessions.audio(sessionId, input.audioBase64, input.mimeType, input.language); }
  @Post(':sessionId/analyze') analyze(@Param('sessionId') sessionId: string) { return this.sessions.analyzeAfterPause(sessionId); }
  @Post(':sessionId/end') end(@Param('sessionId') sessionId: string) { return this.sessions.end(sessionId); }
}
