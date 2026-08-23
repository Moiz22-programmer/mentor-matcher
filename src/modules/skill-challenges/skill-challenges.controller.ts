import { Controller, Post, Body, HttpCode, HttpStatus, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { SkillChallengesService } from './skill-challenges.service';
import { GenerateChallengeDto } from './dto/generate-challenge.dto';
import { SubmitSolutionDto } from './dto/submit-solution.dto';
import { ChallengeResponseDto } from './dto/challenge-response.dto';
import { EvaluationResponseDto } from './dto/evaluation-response.dto';

@ApiTags('Skill Challenges')
@Controller('skill-challenges')
export class SkillChallengesController {
  constructor(private readonly skillChallengesService: SkillChallengesService) {}

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate AI-powered coding challenge',
    description: 'AI generates a custom coding challenge based on skill and difficulty level.',
  })
  @ApiBody({ type: GenerateChallengeDto })
  @ApiResponse({
    status: 200,
    description: 'Challenge generated successfully.',
    type: ChallengeResponseDto,
  })
  async generateChallenge(@Body() dto: GenerateChallengeDto): Promise<ChallengeResponseDto> {
    return this.skillChallengesService.generateChallenge(dto);
  }

  @Post('submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Submit solution for auto-evaluation',
    description: 'Submit code solution. OpenAI evaluates correctness, efficiency, and style. Results emailed with badge if passed.',
  })
  @ApiBody({ type: SubmitSolutionDto })
  @ApiResponse({
    status: 200,
    description: 'Solution evaluated. Results sent via email.',
    type: EvaluationResponseDto,
  })
  async submitSolution(@Body() dto: SubmitSolutionDto): Promise<EvaluationResponseDto> {
    return this.skillChallengesService.evaluateSolution(dto);
  }

  @Get('badges')
  @ApiOperation({
    summary: 'Get available badge tiers',
    description: 'Returns all available skill badges and their requirements.',
  })
  @ApiResponse({ status: 200, description: 'Badge tiers retrieved successfully.' })
  getBadgeTiers() {
    return this.skillChallengesService.getBadgeTiers();
  }
}
