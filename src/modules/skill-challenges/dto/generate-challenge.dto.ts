import { IsString, IsNotEmpty, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateChallengeDto {
  @ApiProperty({
    description: 'Programming skill or technology',
    example: 'JavaScript',
    enum: ['JavaScript', 'Python', 'Java', 'TypeScript', 'React', 'Node.js', 'SQL', 'Algorithms'],
  })
  @IsString()
  @IsNotEmpty()
  skill: string;

  @ApiProperty({
    description: 'Challenge difficulty level',
    example: 'medium',
    enum: ['easy', 'medium', 'hard'],
  })
  @IsString()
  @IsIn(['easy', 'medium', 'hard'])
  difficulty: 'easy' | 'medium' | 'hard';
}
