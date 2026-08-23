import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiExcludeEndpoint } from '@nestjs/swagger';
import { Response } from 'express';
import { join } from 'path';

@ApiTags('Health')
@Controller()
export class AppController {
  @Get('/')
  @ApiExcludeEndpoint()
  getHome(@Res() res: Response) {
    return res.sendFile(join(process.cwd(), 'public', 'index.html'));
  }

  @Get('/health')
  @ApiOperation({ summary: 'Check system health status' })
  @ApiResponse({ status: 200, description: 'System is healthy' })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'MentorMatcher API',
    };
  }
}
