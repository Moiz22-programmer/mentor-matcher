import { Controller, Post, Get, Put, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { MentorsService } from './mentors.service';
import { RegisterMentorDto, UpdateMentorDto } from './dto/register-mentor.dto';
import { RegisterCandidateDto } from './dto/register-candidate.dto';
import { RequestServiceDto } from './dto/request-service.dto';

@ApiTags('Mentors & Candidates')
@Controller()
export class MentorsController {
  constructor(private readonly mentorsService: MentorsService) {}

  @Post('mentors/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new mentor',
    description: 'Mentor registers their profile and offered career services. Dynamically appears on the platform.',
  })
  @ApiBody({ type: RegisterMentorDto })
  @ApiResponse({ status: 201, description: 'Mentor registered successfully.' })
  registerMentor(@Body() dto: RegisterMentorDto) {
    return this.mentorsService.registerMentor(dto);
  }

  @Get('mentors')
  @ApiOperation({
    summary: 'Get all registered mentors',
    description: 'Retrieves all active real mentors registered on MentorMatcher.',
  })
  @ApiResponse({ status: 200, description: 'List of mentors retrieved successfully.' })
  getAllMentors() {
    return this.mentorsService.getAllMentors();
  }

  @Get('mentors/:id')
  @ApiOperation({ summary: 'Get mentor details by ID' })
  getMentorById(@Param('id') id: string) {
    return this.mentorsService.getMentorById(id);
  }

  @Put('mentors/:id')
  @ApiOperation({ summary: 'Update a mentor profile' })
  @ApiBody({ type: UpdateMentorDto })
  updateMentor(@Param('id') id: string, @Body() dto: UpdateMentorDto) {
    return this.mentorsService.updateMentor(id, dto);
  }

  @Get('services')
  @ApiOperation({
    summary: 'Get all available career services',
    description: 'Returns all career services dynamically generated from registered mentor skills.',
  })
  getAllServices() {
    return this.mentorsService.getAllServices();
  }

  @Post('candidates/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register or login candidate',
    description: 'Candidates register to browse mentors, select career services, and trigger AI automations.',
  })
  @ApiBody({ type: RegisterCandidateDto })
  @ApiResponse({ status: 201, description: 'Candidate registered/logged in successfully.' })
  registerCandidate(@Body() dto: RegisterCandidateDto) {
    return this.mentorsService.registerCandidate(dto);
  }

  @Get('candidates')
  @ApiOperation({ summary: 'Get all registered candidates' })
  getAllCandidates() {
    return this.mentorsService.getAllCandidates();
  }

  @Post('services/request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request a career service / book mentor',
    description: 'Candidate requests a specific service provided by a mentor.',
  })
  @ApiBody({ type: RequestServiceDto })
  requestService(@Body() dto: RequestServiceDto) {
    return this.mentorsService.requestService(dto);
  }

  @Get('services/requests')
  @ApiOperation({ summary: 'Get all service requests' })
  getServiceRequests() {
    return this.mentorsService.getServiceRequests();
  }
}
