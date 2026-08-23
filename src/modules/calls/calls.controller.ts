import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CallsService } from './calls.service';

@Controller('calls')
export class CallsController {
  constructor(private readonly calls: CallsService) {}

  @Post()
  create(@Body() body: any) {
    return this.calls.create({
      room: String(body?.room || `MentorMatcher-${Date.now()}`),
      callerId: String(body?.callerId || body?.callerName || 'caller'),
      callerName: String(body?.callerName || 'Caller'),
      callerEmail: body?.callerEmail ? String(body.callerEmail) : undefined,
      recipientId: String(body?.recipientId || body?.recipientName || 'recipient'),
      recipientName: String(body?.recipientName || 'Recipient'),
      recipientEmail: body?.recipientEmail ? String(body.recipientEmail) : undefined,
      topic: String(body?.topic || 'Video Call')
    });
  }

  @Get('incoming/:recipientId')
  incoming(@Param('recipientId') recipientId: string) {
    return this.calls.incoming(recipientId);
  }

  @Get(':id')
  getCall(@Param('id') id: string) {
    return this.calls.getCall(id);
  }

  @Get(':id/signaling')
  getSignaling(@Param('id') id: string) {
    return this.calls.getSignaling(id);
  }

  @Get('ice/config')
  iceConfiguration() {
    return this.calls.iceConfiguration();
  }

  @Post(':id/offer')
  setOffer(@Param('id') id: string, @Body() body: any) {
    return this.calls.setOffer(id, body?.offer || body);
  }

  @Post(':id/answer')
  setAnswer(@Param('id') id: string, @Body() body: any) {
    return this.calls.setAnswer(id, body?.answer || body);
  }

  @Post(':id/candidate')
  addCandidate(@Param('id') id: string, @Body() body: any) {
    return this.calls.addCandidate(id, body?.role || 'caller', body?.candidate || body);
  }

  @Patch(':id/:status')
  update(@Param('id') id: string, @Param('status') status: 'accepted' | 'declined' | 'ended') {
    return this.calls.update(id, status);
  }
}
