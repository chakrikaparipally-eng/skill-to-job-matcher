# Skill To Job Matcher — Skill Development, Resume Intelligence & Job Matching Platform

Skill To Job Matcher is a full-stack web platform connecting beginners, learners, job seekers, and recruiters with structured engineering tracks, Gemini-powered PDF/DOCX resume analysis, transparent skill-gap roadmaps, interactive assessments, and real job search integration.

## 1. Architecture & Technologies

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Recharts, Lucide React
- **Backend**: Next.js Server Route Handlers (`/app/api/*`) with Zod payload validation
- **AI Engine**: Google Gemini API (`@google/genai`, model `gemini-4-hydrogen`) executed strictly on the server
- **Document Parsing**: `unpdf` (PDF text & encrypted/scanned error detection) and `mammoth` (DOCX raw text extraction)
- **Database & Auth**: Firebase Authentication (Google Sign-In + Email/Password) & Cloud Firestore with hardened security rules (`firestore.rules`)

## 2. Core Modules

1. **10 Technical Skill Learning Tracks (`/skills`, `/skills/[slug]`, `/courses`)**
   - Python Programming, Data Analytics, Data Science, Machine Learning, AI Engineering & Generative AI, Frontend Web Development, Backend Development, Full-Stack Development, Cloud Computing & DevOps, and Cybersecurity.
   - Each skill page includes introduction, prerequisites, roadmap phases, beginner-to-advanced lessons with code examples, video/documentation/free resource links, mini-projects, practice prompts, completion percentages, and badges.
2. **Interactive Quiz & Assessment Engine (`/quizzes`)**
   - Multiple-choice, true/false, technical, and coding challenge questions across Beginner, Intermediate, and Advanced tiers with countdown timer, explanations, strong/weak topic diagnostics, Recharts performance charts, and Gemini question generation (`/api/quiz/generate`).
3. **AI Resume Analyzer (`/resume-analyzer`)**
   - Extracts actual text from uploaded `.pdf` and `.docx` files via `/api/resume/parse`.
   - Evaluates strictly grounded profile details, 100-point rubric score breakdown, missing keywords, project rewrites, editable candidate profile sync, and downloadable report.
4. **AI Skill Gap Analyzer (`/skill-gap`)**
   - Compares candidate skills against target roles or custom job descriptions (`/api/skill-gap/analyze`) into Matched, Missing, Needs Confirmation, and Additional skills with visual charts and per-skill learning plans.
5. **Real Job Search & AI Matching (`/jobs`, `/applications`)**
   - Server-side integration with Adzuna and Jooble APIs (`/api/jobs/search`) alongside Skill To Job Matcher Recruiter postings (`jobListings`). Never fabricates vacancies when API keys are absent.
   - Compatibility scoring (`/api/jobs/match`) and application tracking (`savedJobs`, `jobApplications`).
6. **My Improvement Plan (`/learning-plan`)**
   - Personalized week-by-week learning roadmap (`/api/roadmap/generate`), weekly goals, and daily learning log.
7. **Recruiter Hub (`/recruiter`)**
   - Company profiles, job posting CRUD, opt-in candidate search (`shareWithRecruiters == true`), match percentages, and shortlists (`recruiterShortlists`).

## 3. Firestore Database Structure

Collections defined in `firebase-blueprint.json` and secured in `firestore.rules`:
- `users`, `candidateProfiles`, `recruiterProfiles`, `resumes`, `resumeAnalyses`, `skills`, `courses`, `lessons`, `quizzes`, `quizResults`, `learningProgress`, `jobListings`, `savedJobs`, `jobApplications`, `skillGapReports`, `recruiterShortlists`.

## 4. Configuration & Environment Variables

Configure secrets in `.env` or your hosting environment:
- `GEMINI_API_KEY`: Server-side Gemini API key (never exposed to browser code)
- `ADZUNA_APP_ID` & `ADZUNA_APP_KEY`: Optional credentials from `developer.adzuna.com` for live external job search
- `JOOBLE_API_KEY`: Optional credential from `jooble.org/api/about` for live external job search
- Firebase client configuration is stored in `firebase-applet-config.json`.
- **Email/Password Sign-In**: Google Sign-In works immediately; if using Email/Password sign-up/login, ensure the **Email/Password** sign-in provider is enabled in Firebase Console → Authentication → Sign-in method.

## 5. Running Locally & Deploying from GitHub

> **Important Note on GitHub Pages vs. Full-Stack Hosting:**
> Enabling **GitHub Pages** directly from the `main` branch only serves static files (and falls back to rendering this `README.md` intro because Next.js server routes and `GEMINI_API_KEY` cannot execute on static GitHub Pages). To deploy the **full interactive website** from your GitHub repository (including `/api/*` Gemini AI routes, PDF/DOCX parsing, and Firebase Auth), deploy via a Next.js-capable host connected to GitHub:

### Option A: Deploy Full Website from GitHub using Vercel (Recommended)
1. Push this repository to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import your GitHub repository (`vercel.json` is pre-configured).
3. Add environment variable `GEMINI_API_KEY` (and optional `ADZUNA_APP_ID`, `ADZUNA_APP_KEY`, `JOOBLE_API_KEY`) in Project Settings → Environment Variables.
4. Deploy.
5. In **Firebase Console → Authentication → Settings → Authorized domains**, add your deployed domain (for example, `your-project.vercel.app`) so Google Sign-In works on the live site.

### Option B: Deploy Full Website from GitHub using Docker (Cloud Run / Render / Railway)
Use the included `Dockerfile` (built around Next.js `output: 'standalone'`) and set `GEMINI_API_KEY` in your service environment variables. Add the resulting public hostname to Firebase Authorized Domains.

### Local Commands
```bash
npm install
npm run dev       # Starts development server on port 3000
npm run lint      # Runs Next.js & Firebase security rules ESLint checks
npm run build     # Builds production standalone bundle
npm run start     # Starts production server
```
