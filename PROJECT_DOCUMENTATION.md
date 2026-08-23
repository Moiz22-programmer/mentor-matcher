# 🎓 MentorMatcher Project Documentation

MentorMatcher is a state-of-the-art, AI-powered mentorship studio designed to connect computer science students (mentees) with professional software engineers (mentors). The platform consolidates 1-on-1 sessions, task assignments, code evaluations, direct messaging, and live video room collaborations with AI-driven co-pilots in a single workspace.

---

## 🗂 Table of Contents
1. [Languages & Core Technologies](#1-languages--core-technologies)
2. [Aesthetic & Design System](#2-aesthetic--design-system)
3. [System Architecture & File Structure](#3-system-architecture--file-structure)
4. [Tech Stack & External Integrations](#4-tech-stack--external-integrations)
5. [Core Features Deep-Dive](#5-core-features-deep-dive)
6. [Data Persistence & Security](#6-data-persistence--security)
7. [Environment Configuration](#7-environment-configuration)
8. [Setup & Local Development](#8-setup--local-development)
9. [API Endpoints Reference](#9-api-endpoints-reference)
10. [Testing Strategy](#10-testing-strategy)
11. [Deployment Guide](#11-deployment-guide)

---

## 1. Languages & Core Technologies

MentorMatcher is built using modern web development standards on both the backend and frontend.

### Frontend (Client-side)
*   **HTML5 (Semantic)**: Used for layout and UI structure, ensuring accessibility and search engine optimization.
*   **JavaScript (ES6+)**: Custom reactive Single Page Application (SPA) architecture without bulky framework overhead. Features local state management, custom routing, dynamic template rendering, API polling, and native WebRTC media capture/streaming.
*   **CSS3 (Vanilla)**: Curated custom typography (Google Fonts *Figtree* and *Fraunces*), variables-driven responsive styling, glassmorphism elements, custom animations, transitions, and dark/light theme options.

### Backend (Server-side)
*   **TypeScript (v5.3)**: Provides static typing, decorators, and modular code architecture across the NestJS ecosystem.
*   **NestJS (v10.3)**: A progressive Node.js framework for building efficient, reliable, and scalable server-side applications. Fully modular design utilizing dependency injection, controllers, services, global validation pipes, and interceptors.
*   **Node.js**: The underlying JavaScript runtime environment.

---

## 2. Aesthetic & Design System

The frontend interface adopts a bespoke design system implemented in [atelier.css](file:///d:/mentor-matcher/public/atelier.css). 

*   **Typography**:
    *   *Display / Headers*: **Fraunces** (a premium, editorial serif font used for titles, branding, and major card headings).
    *   *Body / UI*: **Figtree** (a clean, geometric sans-serif font optimized for high legibility in workspaces, code fields, and tables).
*   **Color Palette**: A tailored HSL system supporting seamless light/dark mode transitions, featuring:
    *   `--primary` & `--secondary` base tokens.
    *   Glass-effect cards (`backdrop-filter`) for premium visual depth.
    *   Distinct status indicators (vibrant, accessible colors for pass/fail, pending/completed, and badge levels).
*   **Animations**: Custom keyframes for smooth fade-ins, scaling transitions, and tilt effects on card interactions to keep the experience feeling alive and premium.

---

## 3. System Architecture & File Structure

The project maintains a clean separation of concerns. The backend handles API routes, database operations (local storage), external service orchestration (email, AI, monitoring), and WebRTC signaling. The frontend provides the SPA user interfaces.

```
mentor-matcher/
├── data/                    # JSON file-based database store (persistence)
│   └── accounts.json        # Encrypted user accounts, roles, and profile schemas
├── public/                  # Frontend single-page app codebase
│   ├── app.js               # Main SPA application engine (routing, views, states, WebRTC)
│   ├── atelier.css          # Core CSS design system
│   └── index.html           # Core HTML skeleton
├── src/                     # Backend Source Code (NestJS)
│   ├── config/              # App config definitions
│   │   └── app.config.ts    # Central configuration schema matching .env variables
│   ├── modules/             # Modular feature logic
│   │   ├── accounts/        # User accounts management (Registration, Login, PW resets)
│   │   ├── calls/           # WebRTC signaling logic for audio/video calling
│   │   ├── email/           # Resend email client, configurations, HTML templates
│   │   ├── interview-feedback/  # Transcript analysis and interview feedback service
│   │   ├── mentor-session/  # Live AI transcriptions, audio streaming, copilot feedback
│   │   ├── mentors/         # Mentor profiles registry and service request workflows
│   │   ├── mentorship/      # Matching, assignments, student progress tracking, quizzes
│   │   ├── openai/          # AI Service provider orchestration (Groq / OpenAI wrapper)
│   │   └── sentry/          # Sentry error tracking & Exception monitoring interceptor
│   ├── app.controller.ts    # Base health-check and index redirect controller
│   ├── app.module.ts        # App modular configuration registry
│   └── main.ts              # Server bootstrap file (Cors, Swagger, Sentry, Pipes setup)
├── test/                    # Unit and End-to-End (E2E) testing suite
│   ├── app.e2e-spec.ts      # E2E controller endpoint validation tests
│   ├── interview-feedback.service.spec.ts # Unit tests for feedback service
│   ├── mentor-session.service.spec.ts     # Unit tests for video call AI session service
│   ├── skill-challenges.service.spec.ts   # Unit tests for code challenge generation
│   ├── weekly-progress.service.spec.ts    # Unit tests for weekly surveys processing
│   └── jest-e2e.json        # Jest test configurations
├── .env.example             # Setup environment variables reference template
├── nest-cli.json            # NestJS build tools CLI configuration
├── tsconfig.json            # Base TypeScript compiler preferences
└── package.json             # NPM dependencies and script instructions
```

---

## 4. Tech Stack & External Integrations

MentorMatcher integrates several top-tier industry services to power its workflows:

| Technology / Integration | Role in Platform | Key APIs / Models Used |
| :--- | :--- | :--- |
| **NestJS v10** | REST Backend Framework | Core modules, Dependency Injection, Validation Pipes |
| **Groq / OpenAI Client** | High-performance AI Engine | `openai/gpt-oss-20b` (for code feedback and email composition), `whisper-large-v3-turbo` (for audio transcription) |
| **Resend v3** | Transactional & Automated Emails | Resend Node client for sending high-fidelity HTML templates (7+ unique emails) |
| **WebRTC API** | P2P Video Call System | Browser-native `RTCPeerConnection` with STUN (Google STUN servers) and TURN configs |
| **Swagger v7** | Interactive API Documentation | `@nestjs/swagger` decorators generating Open API UI |
| **Sentry v7** | Application Error Tracking | `@sentry/node` client integrated via global Interceptors |
| **Jest & Supertest** | Automated Testing | Unit testing mocks, E2E validation |

---

## 5. Core Features Deep-Dive

### 5.1 Onboarding & Role-Based Portals
*   **Mentor Onboarding**: Custom 5-step registration covering professional backgrounds, tech stacks, timezone, maximum mentees capacity, and services offered (e.g. system design, mock interview, coding challenge).
*   **Mentee Onboarding**: Custom 5-step registration defining career goals, target roles (e.g. frontend, backend, fullstack), timezone, core needs, and preferred learning styles.
*   **Mentor Matching**: Students can browse a marketplace of available mentors, view detail cards, check ratings/reviews, and request a pairing. Mentors accept or decline requests in their pending matches queue.

### 5.2 Live AI Mentor Call Copilot (WebRTC + Groq Whisper)
*   Peer-to-peer real-time video calls with a custom ringing lobby interface.
*   The student's dashboard displays a **Live AI Mentor Call Copilot** sidebar.
*   If enabled, the client records short audio blobs locally during call pauses and streams them to the server.
*   The server transcribes the audio using **Groq Whisper Large** (supporting multiple languages, including English and Urdu script detection).
*   The transcript history is fed into the **Groq Chat Completion** engine.
*   The AI streams back real-time feedback cards containing:
    *   *Questions to Ask Next*: Concise, context-aware suggestions to deepen the discussion.
    *   *Concepts to Explore*: Key technical subjects mentioned in the conversation.
    *   *Gaps Detected*: Important topics that were missed or glossed over.
    *   *Tips & Morale*: Communication and interview behavior tips.
*   **Privacy Guard**: Call recordings are never stored; audio chunks and context are processed in-memory and purged automatically within 24 hours of call termination.

### 5.3 Auto-Interview Feedback
*   Students upload practice interview transcripts to `/api/v1/interview-feedback/submit`.
*   AI analyzes the delivery, technical detail, tone, and organization of responses.
*   Sends a summary evaluation directly to the student’s inbox via Resend, showcasing:
    *   An overall score out of 10.
    *   3 identified core strengths.
    *   3 identified areas to improve.
    *   An encouraging summary message.

### 5.4 AI Skill Challenges & Code Evaluation
*   AI generates customized, language-specific coding challenges on-the-fly based on selected difficulty (Easy, Medium, Hard) and programming language.
*   Students write their solutions directly in the built-in code editor in their portal.
*   On submission, the backend triggers an AI evaluation reviewing complexity, efficiency, style, and correctness.
*   A scoring badge is assigned dynamically:
    *   **Bronze Coder**: Score 60-74
    *   **Silver Coder**: Score 75-89
    *   **Gold Coder**: Score 90-94
    *   **Platinum Coder**: Score 95+
*   The evaluation results, complexity analysis, and badge are emailed automatically to the student.

### 5.5 Weekly Progress Reports
*   Automated weekly check-in emails are triggered to students every Friday.
*   Students fill out a short morale, achievement, and blockers report.
*   AI reviews the progress report, identifies patterns (such as time management or architectural blockers), and responds with a customized motivational strategy, a weekly progress score, and a list of milestone achievements.

### 5.6 Shared Learning Workspace & Messaging
*   **Chat Hub**: Real-time direct chat between mentors and students.
*   **Mail Center**: A structured in-app email logs terminal mimicking transactional emails for easy previewing and inbox control.
*   **Task Board**: Mentors can post custom assignments (Code type or Video explanation type) with clear deadlines. Students submit code or video links, getting immediate AI feedback alongside manual mentor reviews.
*   **Quiz Module**: Mentors create custom-designed multi-choice quizzes. Mentees take them with automatic grading.

---

## 6. Data Persistence & Security

*   **JSON Database Engine**: Storage is simplified for ease of deployment. User records are persisted in [data/accounts.json](file:///d:/mentor-matcher/data/accounts.json).
*   **Cryptographic Password Hashing**: Passwords are securely hashed with a randomized salt using the Node `crypto` module's **scrypt** key derivation function. Timing-safe equality operations (`timingSafeEqual`) prevent side-channel timing attacks.
*   **Session Authorization Tokens**: Custom session payloads (`userId.timestamp.nonce.signature`) signed via **HMAC-SHA256** using a server environment variable (`AUTH_SECRET`). This ensures session tokens are secure and lightweight without requiring a complex database session lookup on every request.

---

## 7. Environment Configuration

The application reads configuration parameters from a `.env` file at the root. The structure is registered and validated globally via `src/config/app.config.ts`.

```env
# ⚙️ Application Settings
PORT=3000
NODE_ENV=development
API_PREFIX=api/v1
AUTH_SECRET=a_very_long_secure_random_key_for_hmac_signatures

# 🤖 Groq / OpenAI Integration (Groq handles the fast model inferences)
GROQ_API_KEY=gq_your-groq-api-key-here
GROQ_MODEL=openai/gpt-oss-20b
GROQ_TRANSCRIPTION_MODEL=whisper-large-v3-turbo

# 📧 Resend Email Configuration
RESEND_API_KEY=re_your-resend-api-key-here
RESEND_FROM_EMAIL=onboarding@resend.dev

# 📊 Sentry Performance & Error Monitoring (Optional)
SENTRY_DSN=https://your-sentry-dsn-here
SENTRY_ENVIRONMENT=development
```

---

## 8. Setup & Local Development

### Prerequisites
*   Node.js (version 18 or higher)
*   NPM (installed with Node)

### Installation Steps

1.  **Clone the workspace and enter directory**:
    ```bash
    git clone <repository-url>
    cd mentor-matcher
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Prepare the environment variables file**:
    ```bash
    cp .env.example .env
    ```
    *Open the `.env` file and insert your API keys for `GROQ_API_KEY` and `RESEND_API_KEY`.*

4.  **Start the NestJS dev server**:
    ```bash
    npm run start:dev
    ```

5.  **Access the Application**:
    *   **Interactive Web App**: Open [http://localhost:3000](http://localhost:3000) in your browser.
    *   **Swagger API Docs**: Open [http://localhost:3000/docs](http://localhost:3000/docs) to explore and test the endpoints directly.

---

## 9. API Endpoints Reference

### 🔐 Authentication & Accounts
*   `POST /api/v1/accounts/register` - Create a new user account (Mentor or Mentee).
*   `POST /api/v1/accounts/login` - Authenticate credentials and receive session token.
*   `GET /api/v1/accounts/me` - Get profile metadata of current authenticated user.
*   `PUT /api/v1/accounts/profile` - Update profile data fields.
*   `POST /api/v1/accounts/forgot-password` - Request a password reset code.
*   `POST /api/v1/accounts/reset-password` - Reset password using the code received via email.

### 👥 Mentorship & Matchmaking
*   `POST /api/v1/mentorship/students/register` - Register a student's learning profile.
*   `GET /api/v1/mentorship/students/:id` - Fetch student progress and pairing.
*   `POST /api/v1/mentorship/requests` - Send a pairing request to a mentor.
*   `POST /api/v1/mentorship/requests/:id/decide` - Accept or decline a mentee's request (Mentor-only).
*   `GET /api/v1/mentorship/mentors/:id/requests` - Fetch all pairing requests received by a mentor.
*   `GET /api/v1/mentorship/mentors/:id/mentees` - List all active mentees assigned to a mentor.

### 📝 Assignments & Quizzes
*   `POST /api/v1/mentorship/assignments` - Assign learning work to a student (Mentor-only).
*   `GET /api/v1/mentorship/students/:id/assignments` - Fetch all assignments for a student.
*   `POST /api/v1/mentorship/assignments/submit-code` - Submit code solution for AI and mentor review.
*   `POST /api/v1/mentorship/assignments/submit-video` - Submit video explanation link and transcript.
*   `POST /api/v1/mentorship/submissions/:id/review` - Mentors add final grades and custom feedback.
*   `POST /api/v1/mentorship/quizzes` - Create a new multiple-choice quiz (Mentor-only).
*   `POST /api/v1/mentorship/quizzes/submit` - Student submits quiz answers for automatic grading.

### 🤖 AI Core Modules
*   `POST /api/v1/interview-feedback/submit` - Send video/audio interview transcripts for instant coaching feedback.
*   `POST /api/v1/weekly-progress/submit` - Submit Friday weekly survey for AI motivation report.
*   `POST /api/v1/weekly-progress/trigger-survey` - Manually email a survey link to a student.
*   `POST /api/v1/skill-challenges/generate` - Generate a customized coding challenge for a language.
*   `POST /api/v1/skill-challenges/submit` - Evaluate solution to dynamic coding challenges and email badge achievements.
*   `GET /api/v1/skill-challenges/badges` - Retrieve all badge tier levels (Bronze, Silver, Gold, Platinum).

### 📹 Video Call & Live AI Sessions
*   `POST /api/v1/calls` - Create a video calling room record (initiates WebRTC signal).
*   `GET /api/v1/calls/incoming` - Poll for incoming calls matching a user.
*   `PUT /api/v1/calls/:id/offer` - Send WebRTC SDP offer.
*   `PUT /api/v1/calls/:id/answer` - Send WebRTC SDP answer.
*   `POST /api/v1/calls/:id/candidate` - Exchange ICE Candidates.
*   `GET /api/v1/calls/:id/signaling` - Retrieve active WebRTC connection state.
*   `GET /api/v1/calls/ice-servers` - Retrieve STUN/TURN server details.
*   `POST /api/v1/mentor-session/start` - Initialize a Live AI Mentor Call Copilot listening session.
*   `POST /api/v1/mentor-session/audio` - Send base64 audio chunks for transcription.
*   `POST /api/v1/mentor-session/analyze` - Trigger AI analysis on current conversation transcript.
*   `POST /api/v1/mentor-session/end` - Terminate session and purge memory buffer.

### 🏥 System Status
*   `GET /health` - Returns service health confirmation, database status, and server timestamp.

---

## 10. Testing Strategy

MentorMatcher features high unit test coverage on critical business logic services and comprehensive End-to-End integration tests for controllers.

### Testing Tools
*   **Jest**: Custom test runner and mocking utilities.
*   **Supertest**: Simulates HTTP client requests for API routes testing.
*   **ts-jest**: TypeScript preprocessing for tests.

### How to Run Tests

*   **Run all unit tests**:
    ```bash
    npm test
    ```
*   **Run tests in watch mode**:
    ```bash
    npm run test:watch
    ```
*   **Check test coverage metrics**:
    ```bash
    npm run test:cov
    ```
*   **Run End-to-End API tests**:
    ```bash
    npm run test:e2e
    ```

---

## 11. Deployment Guide

### Option A: Vercel (Recommended for SPAs and Serverless Apps)
Since the app serves dynamic endpoints and standard HTML client pages, deploying on Vercel requires configuring serverless entry points.
1.  Install the Vercel CLI:
    ```bash
    npm i -g vercel
    ```
2.  Deploy via command line:
    ```bash
    vercel --prod
    ```
3.  Add all variables from your `.env` file inside the Vercel Project Settings Dashboard under **Environment Variables**.

### Option B: Railway (Recommended for State Preservation)
Since the application uses local JSON storage (`data/accounts.json`) to persist accounts without database dependencies, deploying to a service like Railway with a persistent volume is recommended to avoid losing data when container builds redeploy.
1.  Connect your GitHub repository to Railway.
2.  Add a persistent volume mounted at `/data`.
3.  Attach all necessary environment variables in the variables tab.
4.  Specify the build and start commands:
    *   Build Command: `npm run build`
    *   Start Command: `npm run start:prod`
