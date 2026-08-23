import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';

type Call = {
  id: string;
  room: string;
  callerId: string;
  callerName: string;
  callerEmail?: string;
  recipientId: string;
  recipientName: string;
  recipientEmail?: string;
  topic: string;
  status: 'ringing' | 'accepted' | 'declined' | 'ended';
  createdAt: string;
  offer?: any;
  answer?: any;
  callerCandidates?: any[];
  recipientCandidates?: any[];
};

@Injectable()
export class CallsService {
  private readonly calls = new Map<string, Call>();

  create(input: Omit<Call, 'id' | 'status' | 'createdAt'>) {
    const call: Call = { id: randomUUID(), status: 'ringing', createdAt: new Date().toISOString(), callerCandidates: [], recipientCandidates: [], ...input };
    this.calls.set(call.id, call);
    // A missed incoming call must not stay at the front of the next caller's queue.
    setTimeout(() => { const current = this.calls.get(call.id); if (current?.status === 'ringing') this.calls.delete(call.id); }, 45 * 1000);
    setTimeout(() => this.calls.delete(call.id), 60 * 60 * 1000);
    return call;
  }

  getCall(id: string) {
    const call = this.calls.get(id);
    if (!call) throw new NotFoundException('Call not found.');
    return call;
  }

  incoming(recipientIdentifier: string) {
    const target = (recipientIdentifier || '').toLowerCase().trim();
    if (!target) return [];
    return [...this.calls.values()].filter(call => {
      if (call.status !== 'ringing') return false;
      const recId = (call.recipientId || '').toLowerCase().trim();
      const recEmail = (call.recipientEmail || '').toLowerCase().trim();
      const recName = (call.recipientName || '').toLowerCase().trim();
      return recId === target || (recEmail && recEmail === target) || (recName && recName === target);
    }).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  }

  setOffer(id: string, offer: any) {
    const call = this.getCall(id);
    call.offer = offer;
    return call;
  }

  setAnswer(id: string, answer: any) {
    const call = this.getCall(id);
    call.answer = answer;
    return call;
  }

  addCandidate(id: string, role: 'caller' | 'recipient', candidate: any) {
    const call = this.getCall(id);
    if (role === 'caller') {
      if (!call.callerCandidates) call.callerCandidates = [];
      call.callerCandidates.push(candidate);
    } else {
      if (!call.recipientCandidates) call.recipientCandidates = [];
      call.recipientCandidates.push(candidate);
    }
    return call;
  }

  getSignaling(id: string) {
    const call = this.getCall(id);
    return {
      status: call.status,
      offer: call.offer || null,
      answer: call.answer || null,
      callerCandidates: call.callerCandidates || [],
      recipientCandidates: call.recipientCandidates || []
    };
  }

  iceConfiguration() {
    const turnUrl = process.env.TURN_URL;
    const turnUsername = process.env.TURN_USERNAME;
    const turnCredential = process.env.TURN_CREDENTIAL;
    const iceServers: Array<Record<string, string | string[]>> = [
      { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
    ];
    if (turnUrl && turnUsername && turnCredential) iceServers.push({ urls: turnUrl, username: turnUsername, credential: turnCredential });
    return { iceServers };
  }

  update(id: string, status: 'accepted' | 'declined' | 'ended') {
    const call = this.calls.get(id);
    if (!call) throw new NotFoundException('Call not found.');
    call.status = status;
    return call;
  }
}
