import { Injectable, NotFoundException } from '@nestjs/common';
import { RegisterMentorDto, UpdateMentorDto } from './dto/register-mentor.dto';
import { RegisterCandidateDto } from './dto/register-candidate.dto';
import { RequestServiceDto } from './dto/request-service.dto';
import { v4 as uuidv4 } from 'uuid';

export interface Mentor {
  id: string;
  name: string;
  email: string;
  role: string;
  company: string;
  location: string;
  yearsExperience: number;
  skills: string[];
  servicesOffered: Array<{ id: string; title: string; category: string; description: string }>;
  bio?: string;
  phone?: string;
  timezone?: string;
  specializationFields?: string[];
  languagesKnown?: string[];
  skillsToTeach?: string[];
  maxMentees?: number;
  availabilityHours?: string;
  linkedinUrl?: string;
  rating: number;
  reviewsCount: number;
  available: boolean;
  registeredAt: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  targetRole: string;
  bio?: string;
  registeredAt: string;
}

export interface ServiceRequest {
  id: string;
  candidateName: string;
  candidateEmail: string;
  mentorId: string;
  mentorName: string;
  serviceTitle: string;
  notes?: string;
  status: string;
  requestedAt: string;
}

@Injectable()
export class MentorsService {
  private mentors: Mentor[] = [];
  private candidates: Candidate[] = [];
  private serviceRequests: ServiceRequest[] = [];

  registerMentor(dto: RegisterMentorDto): Mentor {
    const newMentor: Mentor = {
      id: `ment_${uuidv4().substring(0, 8)}`,
      name: dto.name,
      email: dto.email,
      role: dto.role,
      company: dto.company,
      location: dto.location,
      yearsExperience: dto.yearsExperience,
      skills: dto.skills || [],
      servicesOffered: (dto.servicesOffered || []).map((s) => ({
        id: `srv_${uuidv4().substring(0, 8)}`,
        title: s.title,
        category: s.category,
        description: s.description,
      })),
      bio: dto.bio,
      phone: dto.phone,
      timezone: dto.timezone,
      specializationFields: dto.specializationFields || [],
      languagesKnown: dto.languagesKnown || [],
      skillsToTeach: dto.skillsToTeach || [],
      maxMentees: dto.maxMentees || 3,
      availabilityHours: dto.availabilityHours,
      linkedinUrl: dto.linkedinUrl,
      rating: 5.0,
      reviewsCount: 0,
      available: true,
      registeredAt: new Date().toISOString(),
    };

    this.mentors.unshift(newMentor);
    return newMentor;
  }

  getAllMentors(): Mentor[] {
    return this.mentors;
  }

  getMentorById(id: string): Mentor {
    const mentor = this.mentors.find((m) => m.id === id);
    if (!mentor) {
      throw new NotFoundException(`Mentor with ID "${id}" not found.`);
    }
    return mentor;
  }

  updateMentor(id: string, dto: UpdateMentorDto): Mentor {
    const mentor = this.getMentorById(id);
    Object.assign(mentor, dto);
    return mentor;
  }

  getAllServices() {
    const servicesMap = new Map<string, any>();

    this.mentors.forEach((mentor) => {
      mentor.servicesOffered.forEach((srv) => {
        const key = srv.title.toLowerCase();
        if (!servicesMap.has(key)) {
          servicesMap.set(key, {
            id: srv.id,
            title: srv.title,
            category: srv.category,
            description: srv.description,
            mentorNames: [mentor.name],
            mentorsCount: 1,
          });
        } else {
          const existing = servicesMap.get(key);
          if (!existing.mentorNames.includes(mentor.name)) {
            existing.mentorNames.push(mentor.name);
            existing.mentorsCount += 1;
          }
        }
      });
    });

    return Array.from(servicesMap.values());
  }

  registerCandidate(dto: RegisterCandidateDto): Candidate {
    const existing = this.candidates.find((c) => c.email.toLowerCase() === dto.email.toLowerCase());
    if (existing) {
      return existing;
    }

    const newCandidate: Candidate = {
      id: `cand_${uuidv4().substring(0, 8)}`,
      name: dto.name,
      email: dto.email,
      targetRole: dto.targetRole,
      bio: dto.bio,
      registeredAt: new Date().toISOString(),
    };

    this.candidates.unshift(newCandidate);
    return newCandidate;
  }

  getAllCandidates(): Candidate[] {
    return this.candidates;
  }

  requestService(dto: RequestServiceDto): ServiceRequest {
    const mentor = this.getMentorById(dto.mentorId);

    const request: ServiceRequest = {
      id: `req_${uuidv4().substring(0, 8)}`,
      candidateName: dto.candidateName,
      candidateEmail: dto.candidateEmail,
      mentorId: mentor.id,
      mentorName: mentor.name,
      serviceTitle: dto.serviceTitle,
      notes: dto.notes,
      status: 'MATCHED_AND_ASSIGNED',
      requestedAt: new Date().toISOString(),
    };

    this.serviceRequests.unshift(request);
    return request;
  }

  getServiceRequests(): ServiceRequest[] {
    return this.serviceRequests;
  }
}
