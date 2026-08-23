import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as Sentry from '@sentry/node';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json } from 'express';
import { join } from 'path';
import { AppModule } from './app.module';
import { SentryInterceptor } from './modules/sentry/sentry.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false });
  // Live AI sends short WAV clips after a natural pause. Allow those audio
  // payloads without affecting the normal API request size.
  app.use(json({ limit: '5mb' }));
  const configService = app.get(ConfigService);

  // Serve static frontend from public folder
  app.useStaticAssets(join(process.cwd(), 'public'));

  // Global prefix
  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1');
  app.setGlobalPrefix(apiPrefix, { exclude: ['/', '/health'] });

  // Opening the API prefix in a browser should lead to the product, not a 404 page.
  const apiRootPath = `/${apiPrefix.replace(/^\/+|\/+$/g, '')}`;
  app.getHttpAdapter().get(apiRootPath, (_request, response) => app.getHttpAdapter().redirect(response, 302, '/'));

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
      environment: configService.get<string>('SENTRY_ENVIRONMENT', 'development'),
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

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);

  console.log(`🚀 MentorMatcher API running on: http://localhost:${port}/${apiPrefix}`);
  console.log(`📚 Swagger Docs: http://localhost:${port}/docs`);
}

bootstrap();
