import { NestFactory } from '@nestjs/core';
import { NestExpressApplication, ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as Sentry from '@sentry/node';
import { SentryInterceptor } from '../src/modules/sentry/sentry.interceptor';
import express, { Request, Response } from 'express';
import { join } from 'path';

const server = express();
server.use(express.json({ limit: '5mb' }));

let app: NestExpressApplication;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create<NestExpressApplication>(
      AppModule,
      new ExpressAdapter(server),
      { bodyParser: false }
    );

    const configService = app.get(ConfigService);

    // Serve static frontend from public folder
    app.useStaticAssets(join(process.cwd(), 'public'));

    // Global prefix
    const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1');
    app.setGlobalPrefix(apiPrefix, { exclude: ['/', '/health'] });

    // Redirect API root to landing page
    const apiRootPath = `/${apiPrefix.replace(/^\/+|\/+$/g, '')}`;
    app.getHttpAdapter().get(apiRootPath, (_request: Request, response: Response) => 
      app.getHttpAdapter().redirect(response, 302, '/')
    );

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // Sentry initialization
    const sentryDsn = configService.get<string>('SENTRY_DSN');
    if (sentryDsn) {
      Sentry.init({
        dsn: sentryDsn,
        environment: configService.get<string>('SENTRY_ENVIRONMENT', 'production'),
        tracesSampleRate: 1.0,
      });
      app.useGlobalInterceptors(new SentryInterceptor());
    }

    // Swagger setup
    const swaggerConfig = new DocumentBuilder()
      .setTitle('MentorMatcher API')
      .setDescription(
        'AI-powered mentorship platform featuring: Auto-Interview Feedback, Weekly Progress Reports, and Skill Challenges',
      )
      .setVersion('1.0.0')
      .addTag('Interview Feedback', 'Upload interview videos and get AI-powered feedback')
      .addTag('Weekly Progress', 'Automated weekly progress tracking and motivation')
      .addTag('Skill Challenges', 'AI-generated coding challenges with auto-evaluation')
      .addTag('Mentorship Platform', 'Student onboarding, assignments, quizzes, AI reviews, and mentor feedback')
      .addTag('Health', 'System health checks')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
      customSiteTitle: 'MentorMatcher API Docs',
    });

    // Enable CORS
    app.enableCors({
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });

    await app.init();
  }
  return server;
}

export default async (req: any, res: any) => {
  // Shortcut route for Vercel deployment: return backend configuration without booting the NestJS app
  const parsedUrl = req.url ? req.url.split('?')[0] : '';
  if (parsedUrl === '/api/v1/config' || parsedUrl === '/api/config') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    res.status(200).send(JSON.stringify({
      backendUrl: process.env.BACKEND_URL || ''
    }));
    return;
  }

  const expressInstance = await bootstrap();
  expressInstance(req, res);
};
