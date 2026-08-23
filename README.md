# 🚀 MentorMatcher API

> AI-powered mentorship platform with **Auto-Interview Feedback**, **Weekly Progress Reports**, and **Skill Challenges**.

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)](https://nestjs.com)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=flat&logo=openai&logoColor=white)](https://openai.com)
[![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=flat&logo=swagger&logoColor=black)](https://swagger.io)
[![Resend](https://img.shields.io/badge/Resend-000000?style=flat&logo=resend&logoColor=white)](https://resend.com)
[![Sentry](https://img.shields.io/badge/Sentry-362D59?style=flat&logo=sentry&logoColor=white)](https://sentry.io)

> [!NOTE]
> For a deep-dive into the architectural details, database schemas, frontend design templates, dynamic modules, and external integrations, please read the complete [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md).

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [5-Day Implementation Plan](#-5-day-implementation-plan)
- [Demo Checklist](#-demo-checklist)

---

## ✨ Features

### 0️⃣ Complete mentorship workflow
- Mentor and student onboarding, mentor requests, assignments, quizzes, and progress tracking
- Immediate AI code and transcript-based video feedback, with mentor override capability
- Structured email notifications that safely log locally until Resend is configured
- Interactive web demo at `http://localhost:3000` and documented API at `/docs`

### ✨ Live AI Mentor during video calls
- Student calls can enable microphone-based live transcription through AssemblyAI.
- The server sends recent conversation context to Groq and streams concise questions, concepts, gaps, and tips into the live call sidebar.
- Sessions do not store recordings; only short in-memory transcript context is retained and automatically removed within 24 hours.
- Add `ASSEMBLY_AI_KEY` plus `GROQ_API_KEY` (or `GROK_API_KEY`) to enable this feature.

### 1️⃣ Auto-Interview Feedback
- **Upload** interview transcript
- **OpenAI analyzes** delivery, tone, and content
- **Instant email** with score, strengths, and improvements
- **Time:** 2 minutes from upload to feedback

```
POST /api/v1/interview-feedback/submit
```

### 2️⃣ Weekly Progress Reports
- **Friday auto-survey** sent to mentees
- **OpenAI analyzes** responses for patterns
- **Motivation email** with achievements and recommendations
- **Keeps mentees engaged** throughout the program

```
POST /api/v1/weekly-progress/submit
POST /api/v1/weekly-progress/trigger-survey
```

### 3️⃣ Skill Challenges
- **AI generates** custom coding challenges
- **Auto-evaluates** submitted code
- **Badge system:** Bronze → Silver → Gold → Platinum
- **Real skill verification** with detailed feedback

```
POST /api/v1/skill-challenges/generate
POST /api/v1/skill-challenges/submit
GET  /api/v1/skill-challenges/badges
```

---

## 🛠 Tech Stack

| Technology | Purpose | PDF Requirement |
|-----------|---------|-----------------|
| **NestJS** | REST API Framework | ✅ Required |
| **OpenAI GPT-4o-mini** | AI Logic (3 different uses) | ✅ Required |
| **Resend** | Email Automation (7+ email templates) | ✅ Required |
| **Swagger** | API Documentation | ✅ Required |
| **Sentry** | Error Tracking & Monitoring | ✅ Required |
| **TypeScript** | Type Safety | Best Practice |
| **Jest** | Unit & E2E Testing | Best Practice |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- OpenAI API key
- Resend API key
- Sentry DSN (optional)

### 1. Clone & Install

```bash
git clone <your-repo>
cd mentor-matcher
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini

# Resend Email
RESEND_API_KEY=re_your-resend-api-key-here
RESEND_FROM_EMAIL=mentor@mentormatcher.app

# Sentry
SENTRY_DSN=https://your-sentry-dsn-here
SENTRY_ENVIRONMENT=development

# App
PORT=3000
NODE_ENV=development
API_PREFIX=api/v1
```

### 3. Run Development Server

```bash
npm run start:dev
```

**Output:**
```
🚀 MentorMatcher API running on: http://localhost:3000/api/v1
📚 Swagger Docs: http://localhost:3000/docs
```

### 4. Test the API

Open Swagger UI: `http://localhost:3000/docs`

---

## 📚 API Documentation

### Swagger UI
Access interactive API docs at: `http://localhost:3000/docs`

### Endpoints Overview

#### Interview Feedback
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/interview-feedback/submit` | Submit transcript, get AI feedback via email |

#### Weekly Progress
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/weekly-progress/submit` | Submit weekly survey, get motivation email |
| POST | `/api/v1/weekly-progress/trigger-survey` | Manually trigger survey email |

#### Skill Challenges
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/skill-challenges/generate` | Generate AI coding challenge |
| POST | `/api/v1/skill-challenges/submit` | Submit solution for evaluation |
| GET | `/api/v1/skill-challenges/badges` | Get all badge tiers |

---

## 📁 Project Structure

```
mentor-matcher/
├── public/                 # Web app (index.html + app.js)
├── src/
│   ├── config/             # Environment and app config
│   ├── modules/            # Feature APIs (accounts, calls, mentorship, AI, email)
│   ├── app.controller.ts   # Home page + health check
│   ├── app.module.ts
│   └── main.ts
├── data/                   # Saved accounts
├── test/                   # Unit and e2e tests
├── .env.example
├── nest-cli.json
├── package.json
└── README.md
```

---

## 🔐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | ✅ Yes | OpenAI API key for AI features |
| `OPENAI_MODEL` | ❌ No | Model to use (default: gpt-4o-mini) |
| `RESEND_API_KEY` | ✅ Yes | Resend API key for emails |
| `RESEND_FROM_EMAIL` | ❌ No | Sender email (default: mentor@mentormatcher.app) |
| `SENTRY_DSN` | ❌ No | Sentry DSN for error tracking |
| `SENTRY_ENVIRONMENT` | ❌ No | Sentry environment (default: development) |
| `PORT` | ❌ No | Server port (default: 3000) |
| `NODE_ENV` | ❌ No | Environment (default: development) |
| `API_PREFIX` | ❌ No | API route prefix (default: api/v1) |

---

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### Coverage
```bash
npm run test:cov
```

### E2E Tests
```bash
npm run test:e2e
```

### Watch Mode
```bash
npm run test:watch
```

---

## 🚀 Deployment

### Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel --prod
```

3. Add environment variables in Vercel Dashboard:
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env`

### Other Platforms
- **Railway**: Connect GitHub repo, add env vars
- **Render**: Web Service, Node.js runtime
- **AWS**: Elastic Beanstalk or ECS

---

## 📅 5-Day Implementation Plan

### Day 1: Setup + OpenAI Services ✅
- [x] Initialize NestJS project
- [x] Install all dependencies
- [x] Configure environment variables
- [x] Create OpenAI service (4 methods)
- [x] Create Email service (4 email templates)
- [x] Setup Sentry interceptor

### Day 2: Controllers + Services + DTOs ✅
- [x] Interview Feedback module (controller, service, DTOs)
- [x] Weekly Progress module (controller, service, DTOs)
- [x] Skill Challenges module (controller, service, DTOs)
- [x] Validation pipes and error handling

### Day 3: Swagger + Sentry ✅
- [x] Swagger UI setup with tags and descriptions
- [x] API documentation for all endpoints
- [x] DTOs with Swagger decorators
- [x] Sentry error tracking integration
- [x] Global exception filter

### Day 4: Testing ✅
- [x] Unit tests for all services
- [x] E2E tests for endpoints
- [x] Mock external services
- [x] Test coverage reporting

### Day 5: Deploy + Polish 🔄
- [ ] Deploy to Vercel/Railway
- [ ] Add health check endpoint
- [ ] Final Swagger review
- [ ] Demo preparation
- [ ] README completion

---

## ✅ Demo Checklist

### Pre-Demo Setup
- [ ] `.env` configured with real API keys
- [ ] Server running: `npm run start:dev`
- [ ] Swagger open: `http://localhost:3000/docs`
- [ ] Postman ready (or use Swagger UI)

### Demo Flow (10 minutes)

#### 1. Swagger Overview (1 min)
- Show `/docs` page
- Point out 3 feature tags
- Show organized endpoints

#### 2. Feature 1: Interview Feedback (3 min)
```json
POST /api/v1/interview-feedback/submit
{
  "menteeEmail": "demo@example.com",
  "menteeName": "Demo User",
  "transcript": "Interviewer: Tell me about yourself. Candidate: I am a software engineer..."
}
```
- Show response with score, strengths, improvements
- Mention email sent via Resend

#### 3. Feature 2: Weekly Progress (3 min)
```json
POST /api/v1/weekly-progress/submit
{
  "menteeEmail": "demo@example.com",
  "menteeName": "Demo User",
  "goalsMet": "Completed authentication module",
  "challenges": "Time management",
  "nextWeekGoals": "Learn caching",
  "morale": 8
}
```
- Show AI-generated motivation message
- Mention automated Friday emails

#### 4. Feature 3: Skill Challenges (3 min)
```json
POST /api/v1/skill-challenges/generate
{
  "skill": "JavaScript",
  "difficulty": "medium"
}
```
- Show generated challenge with test cases
```json
POST /api/v1/skill-challenges/submit
{
  "menteeEmail": "demo@example.com",
  "menteeName": "Demo User",
  "challengeId": "ch_...",
  "language": "javascript",
  "code": "function solution() { ... }"
}
```
- Show evaluation score and badge earned
- GET `/api/v1/skill-challenges/badges`

---

## 🎓 Supervisor Pitch

> "MentorMatcher is an AI-powered mentorship platform built with NestJS that solves the biggest problem in mentorship programs: **lack of structured feedback and engagement tracking**.
>
> Our **3 unique features** use OpenAI in completely different ways:
> 1. **Auto-Interview Feedback** — analyzes interview transcripts and emails instant feedback
> 2. **Weekly Progress Reports** — tracks mentee growth with AI-generated motivation
> 3. **Skill Challenges** — generates and auto-evaluates coding challenges with a badge system
>
> Every PDF requirement is met: NestJS REST API, OpenAI integration, Resend emails, Swagger docs, and Sentry error tracking. The entire system is tested and ready for deployment."

---

## 📄 License

MIT License — feel free to use for your FYP!

---

## 💪 Built With Passion

**MentorMatcher** — Making mentorship smarter with AI. 🚀
