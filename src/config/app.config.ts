import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  groq: {
    // OPENAI_API_KEY is retained only as a temporary fallback for existing local setups.
    apiKey: process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY,
    model: process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
    baseUrl: 'https://api.groq.com/openai/v1',
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
  },
  sentry: {
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT || 'development',
  },
}));
