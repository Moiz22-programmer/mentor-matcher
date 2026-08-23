import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateCallDto {
  @IsString()
  @IsNotEmpty()
  room: string;

  @IsString()
  @IsNotEmpty()
  callerId: string;

  @IsString()
  @IsNotEmpty()
  callerName: string;

  @IsOptional()
  @IsString()
  callerEmail?: string;

  @IsString()
  @IsNotEmpty()
  recipientId: string;

  @IsString()
  @IsNotEmpty()
  recipientName: string;

  @IsOptional()
  @IsString()
  recipientEmail?: string;

  @IsString()
  @IsNotEmpty()
  topic: string;
}

export class OfferDto {
  @IsObject()
  offer: any;
}

export class AnswerDto {
  @IsObject()
  answer: any;
}

export class CandidateDto {
  @IsString()
  role: 'caller' | 'recipient';

  @IsObject()
  candidate: any;
}
