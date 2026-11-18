import { SkillDomain } from './types';

export const SKILLS_PART_2: SkillDomain[] = [
  {
    id: 'frontend-web-development',
    slug: 'frontend-web-development',
    number: '06',
    title: 'Frontend Web Development',
    category: 'Web & Product Engineering',
    tagline: 'Craft accessible, responsive, high-performance interfaces using HTML5, CSS, TypeScript, React, and Tailwind.',
    introduction:
      'Frontend Engineers shape everything users see and interact with in the browser. You will learn semantic HTML, modern CSS layout systems, TypeScript safety, React component architecture, state management, and Web Accessibility (WCAG).',
    prerequisites: [
      'Basic computer literacy and curiosity for visual layout and interaction',
    ],
    roadmapPhases: [
      {
        phase: 'Phase 1 · Weeks 1–2',
        title: 'Semantic HTML, CSS Grid/Flexbox & Responsive Design',
        milestones: ['Build accessible forms and landmark layouts', 'Master Flexbox, Grid, and mobile-first breakpoints'],
      },
      {
        phase: 'Phase 2 · Weeks 3–4',
        title: 'Modern JavaScript & TypeScript',
        milestones: ['Async/await fetch flows and DOM events', 'Strict TypeScript interfaces and generics'],
      },
      {
        phase: 'Phase 3 · Weeks 5–6',
        title: 'React & Tailwind CSS Architecture',
        milestones: ['Hooks, controlled forms, and custom hooks', 'Performance profiling and keyboard accessibility'],
      },
    ],
    modules: [
      {
        id: 'fe-mod-1',
        title: 'Semantic HTML, Flexbox & CSS Grid',
        level: 'Beginner',
        estimatedHours: 6,
        overview: 'Build fluid responsive layouts and accessible navigation patterns from first principles.',
        lessons: [
          {
            id: 'fe-l1',
            title: 'Accessible Landmarks & Responsive Grids',
            durationMinutes: 30,
            summary: 'Use <main>, <nav>, <button>, and CSS Grid auto-fit layouts cleanly.',
            steps: [
              'Always use native <button> for actions and <a href> for navigation.',
              'Ensure >= 4.5:1 text contrast and visible :focus-visible outlines.',
              'Build responsive grids with grid-cols-1 md:grid-cols-2 lg:grid-cols-3.',
            ],
            practicalExample: 'Structuring a responsive course directory card grid with keyboard focus support.',
            codeExample: {
              language: 'tsx',
              code: `export function SkillCard({ title, summary, onSelect }: { title: string; summary: string; onSelect: () => void }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{summary}</p>
      <button
        type="button"
        onClick={onSelect}
        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600"
      >
        Open Module
      </button>
    </article>
  );
}`,
            },
          },
        ],
      },
      {
        id: 'fe-mod-2',
        title: 'React State, Hooks & Async Data',
        level: 'Intermediate',
        estimatedHours: 8,
        overview: 'Manage loading, error, and empty states cleanly in React components.',
        lessons: [
          {
            id: 'fe-l2',
            title: 'Controlled Forms & Predictable Async States',
            durationMinutes: 35,
            summary: 'Eliminate race conditions and unhandled promise rejections in UI data fetching.',
            steps: [
              'Represent async UI state explicitly: idle, loading, success, and error.',
              'Use AbortController inside useEffect when fetching on filter/search changes.',
              'Validate form fields client-side before invoking API routes.',
            ],
            practicalExample: 'Building a live job search filter bar with loading skeletons and error recovery.',
          },
        ],
      },
      {
        id: 'fe-mod-3',
        title: 'Core Web Vitals & Testing',
        level: 'Advanced',
        estimatedHours: 8,
        overview: 'Optimize bundle size, rendering performance, and component reliability.',
        lessons: [
          {
            id: 'fe-l3',
            title: 'Preventing Layout Shift & Unnecessary Re-renders',
            durationMinutes: 30,
            summary: 'Keep Cumulative Layout Shift (CLS) near zero and isolate expensive list renders.',
            steps: [
              'Reserve explicit aspect-ratio containers for images and charts.',
              'Use stable unique keys on dynamic lists (never array index when items reorder).',
              'Memoize heavy derived calculations with useMemo.',
            ],
            practicalExample: 'Optimizing a 200-row candidate matching table with zero layout jitter.',
          },
        ],
      },
    ],
    miniProjects: [
      {
        id: 'fe-proj-1',
        title: 'Interactive Markdown Documentation Reader',
        difficulty: 'Beginner',
        description: 'Build a responsive 2-column technical reader with live keyword search, dark/light contrast, and keyboard navigation.',
        deliverables: ['Responsive React layout', 'Accessible sidebar navigation', 'Live search filtering'],
        skillsPracticed: ['React', 'Tailwind CSS', 'Accessibility'],
      },
    ],
    resources: [
      { title: 'MDN Web Docs: Learn Web Development', provider: 'Mozilla', type: 'Documentation', url: 'https://developer.mozilla.org/en-US/docs/Learn' },
      { title: 'React Official Documentation', provider: 'React.dev', type: 'Documentation', url: 'https://react.dev/learn' },
      { title: 'Web.dev Learn Accessibility', provider: 'Google Web.dev', type: 'Free Resource', url: 'https://web.dev/learn/accessibility' },
      { title: 'Frontend Web Development Bootcamp', provider: 'freeCodeCamp', type: 'Video', url: 'https://www.youtube.com/watch?v=zJSY8tbf_ys' },
    ],
    practicePrompts: [
      'Build a custom `useDebounce` hook in TypeScript to delay search API calls until the user pauses typing for 300ms.',
      'Explain why clickable `<div>` elements harm keyboard and screen-reader users compared to native `<button>` elements.',
    ],
    quizQuestions: [
      {
        id: 'fe-q1',
        kind: 'mcq',
        topic: 'React Rendering',
        difficulty: 'beginner',
        prompt: 'Why should React list items receive a stable unique `key` instead of the array index when items can be filtered or reordered?',
        options: [
          'Array indices cause TypeScript syntax errors',
          'Using indices causes React to misassociate component state and DOM nodes when order changes',
          'Keys encrypt component props',
          'Indices disable Tailwind classes',
        ],
        correctIndex: 1,
        explanation: 'React uses `key` to match elements across renders; shifting array indices causes stale input/component state to bind to the wrong item.',
      },
      {
        id: 'fe-q2',
        kind: 'true_false',
        topic: 'Accessibility',
        difficulty: 'beginner',
        prompt: 'True or False: Standard WCAG AA compliance requires at least a 4.5:1 contrast ratio for normal body text.',
        options: ['True', 'False'],
        correctIndex: 0,
        explanation: 'WCAG 2.1 Level AA specifies 4.5:1 minimum contrast for normal text and 3:1 for large text (18pt+ or 14pt+ bold).',
      },
      {
        id: 'fe-q3',
        kind: 'coding',
        topic: 'TypeScript',
        difficulty: 'intermediate',
        prompt: 'In TypeScript, what does `Partial<User>` produce?',
        options: [
          'Removes all methods from User',
          'Makes every property of User optional',
          'Makes every property of User readonly',
          'Converts User into a union of keys',
        ],
        correctIndex: 1,
        explanation: 'The built-in `Partial<T>` utility type marks all top-level properties of `T` as optional (`?`), useful for patch updates.',
      },
    ],
  },
  {
    id: 'backend-development',
    slug: 'backend-development',
    number: '07',
    title: 'Backend Development',
    category: 'Systems & APIs',
    tagline: 'Design secure REST APIs, relational and NoSQL data models, authentication flows, and resilient server services.',
    introduction:
      'Backend Engineers power business logic, data integrity, authentication, and integrations behind the scenes. You will master Node.js/TypeScript API design, schema validation, database indexing, rate limiting, and error handling.',
    prerequisites: [
      'Basic JavaScript/TypeScript or Python programming',
      'Understanding of HTTP requests and JSON',
    ],
    roadmapPhases: [
      {
        phase: 'Phase 1 · Weeks 1–2',
        title: 'HTTP, RESTful APIs & Validation',
        milestones: ['Design clean resource endpoints and status codes', 'Validate every incoming payload with Zod'],
      },
      {
        phase: 'Phase 2 · Weeks 3–4',
        title: 'Databases, Auth & Security',
        milestones: ['Model one-to-many and many-to-many relations', 'Verify JWTs/OAuth tokens and enforce authorization rules'],
      },
      {
        phase: 'Phase 3 · Weeks 5–6',
        title: 'Caching, Queues & Observability',
        milestones: ['Handle retries, timeouts, and structured error logging', 'Write integration tests for critical API routes'],
      },
    ],
    modules: [
      {
        id: 'be-mod-1',
        title: 'RESTful API Design & Schema Validation',
        level: 'Beginner',
        estimatedHours: 7,
        overview: 'Build deterministic API endpoints with strict input parsing and meaningful HTTP status codes.',
        lessons: [
          {
            id: 'be-l1',
            title: 'Validating Request Payloads with Zod',
            durationMinutes: 30,
            summary: 'Reject malformed payloads early at the API boundary with clear 400 error responses.',
            steps: [
              'Define a Zod schema specifying types, min/max lengths, and enums.',
              'Use safeParse() so invalid payloads return structured validation details.',
              'Never trust client-supplied user IDs or roles; derive identity from verified auth tokens.',
            ],
            practicalExample: 'Validating a recruiter job-posting request on a Node.js endpoint.',
            codeExample: {
              language: 'typescript',
              code: `import { z } from "zod";

const JobSchema = z.object({
  title: z.string().min(2).max(160),
  workMode: z.enum(["Remote", "Hybrid", "Onsite"]),
  requiredSkills: z.array(z.string().min(1)).min(1).max(30),
});

export function validateJobPayload(body: unknown) {
  const parsed = JobSchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false as const, issues: parsed.error.flatten() };
  }
  return { ok: true as const, data: parsed.data };
}`,
            },
          },
        ],
      },
      {
        id: 'be-mod-2',
        title: 'Database Modeling & Query Performance',
        level: 'Intermediate',
        estimatedHours: 9,
        overview: 'Avoid N+1 query bottlenecks and design composite indexes for fast filtering.',
        lessons: [
          {
            id: 'be-l2',
            title: 'Indexing, Pagination & Idempotency',
            durationMinutes: 35,
            summary: 'Keep list endpoints fast at scale using cursor pagination and idempotent writes.',
            steps: [
              'Use cursor-based or bounded page limits instead of fetching unbounded collections.',
              'Index fields used together in WHERE and ORDER BY clauses.',
              'Design write endpoints to handle duplicate retries safely.',
            ],
            practicalExample: 'Paginating job search queries cleanly across thousands of listings.',
          },
        ],
      },
      {
        id: 'be-mod-3',
        title: 'External Integrations & Resilience',
        level: 'Advanced',
        estimatedHours: 8,
        overview: 'Integrate third-party APIs safely with timeouts, exponential backoff, and secret isolation.',
        lessons: [
          {
            id: 'be-l3',
            title: 'Server-Side API Proxies & Error Propagation',
            durationMinutes: 30,
            summary: 'Keep partner credentials strictly on the server and surface actionable failures.',
            steps: [
              'Read API keys exclusively from process.env inside server handlers.',
              'Apply AbortSignal.timeout() to upstream fetch calls so hung APIs do not exhaust workers.',
              'Normalize upstream payloads into a stable internal DTO before sending to the client.',
            ],
            practicalExample: 'Proxying external job-board search APIs with structured error diagnostics.',
          },
        ],
      },
    ],
    miniProjects: [
      {
        id: 'be-proj-1',
        title: 'Validated Job Board REST Service',
        difficulty: 'Intermediate',
        description: 'Build CRUD API routes with Zod validation, pagination, filtering, and automated route tests.',
        deliverables: ['Zod schema layer', 'Paginated search endpoint', 'Error-handling middleware'],
        skillsPracticed: ['Node.js', 'TypeScript', 'Zod', 'REST APIs'],
      },
    ],
    resources: [
      { title: 'Node.js Official Documentation', provider: 'Node.js', type: 'Documentation', url: 'https://nodejs.org/en/docs' },
      { title: 'Roadmap.sh Backend Developer Guide', provider: 'Roadmap.sh', type: 'Free Resource', url: 'https://roadmap.sh/backend' },
      { title: 'APIs for Beginners', provider: 'freeCodeCamp', type: 'Video', url: 'https://www.youtube.com/watch?v=GZvSYJDk-us' },
      { title: 'OWASP REST Security Cheat Sheet', provider: 'OWASP', type: 'Documentation', url: 'https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html' },
    ],
    practicePrompts: [
      'Design a rate limiter middleware pattern that caps requests per IP or authenticated UID cleanly.',
      'Explain the difference between HTTP 401 Unauthorized and 403 Forbidden.',
    ],
    quizQuestions: [
      {
        id: 'be-q1',
        kind: 'mcq',
        topic: 'HTTP Semantics',
        difficulty: 'beginner',
        prompt: 'Which HTTP status code is most appropriate when an authenticated user tries to edit another user’s private document?',
        options: ['400 Bad Request', '401 Unauthorized', '403 Forbidden', '404 Not Modified'],
        correctIndex: 2,
        explanation: '401 indicates missing/invalid authentication; 403 indicates the caller is authenticated but lacks permission for the resource.',
      },
      {
        id: 'be-q2',
        kind: 'true_false',
        topic: 'API Security',
        difficulty: 'beginner',
        prompt: 'True or False: Client-side form validation eliminates the need for server-side payload validation.',
        options: ['True', 'False'],
        correctIndex: 1,
        explanation: 'Attackers can call HTTP endpoints directly with curl or scripts, bypassing browser validation completely.',
      },
      {
        id: 'be-q3',
        kind: 'technical',
        topic: 'Database Performance',
        difficulty: 'intermediate',
        prompt: 'What is the "N+1 query problem"?',
        options: [
          'Running 1 query to fetch N parent records, then N separate queries in a loop to fetch child records',
          'Adding 1 extra column to a database table',
          'A syntax error in SQL COUNT(*)',
          'Running a database backup during peak hours',
        ],
        correctIndex: 0,
        explanation: 'N+1 queries multiply round-trip latency; batching with JOINs or `IN` clauses resolves it.',
      },
    ],
  },
  {
    id: 'full-stack-development',
    slug: 'full-stack-development',
    number: '08',
    title: 'Full-Stack Development',
    category: 'Web & Product Engineering',
    tagline: 'Unite React/Next.js frontends, server API routes, authentication, and real-time cloud databases.',
    introduction:
      'Full-Stack Engineers own complete product slices from database schema and security rules to server APIs and responsive user interfaces. You will learn how Next.js App Router, Firebase Auth/Firestore, and TypeScript fit together seamlessly.',
    prerequisites: [
      'Basic familiarity with HTML/CSS and either React or Node.js',
    ],
    roadmapPhases: [
      {
        phase: 'Phase 1 · Weeks 1–2',
        title: 'Next.js App Router & Shared Type Contracts',
        milestones: ['Structure Server vs. Client components', 'Share TypeScript DTOs between API routes and UI'],
      },
      {
        phase: 'Phase 2 · Weeks 3–4',
        title: 'Authentication & Cloud Persistence',
        milestones: ['Implement OAuth & session persistence', 'Enforce database-level security rules'],
      },
      {
        phase: 'Phase 3 · Weeks 5–6',
        title: 'Production Deployment & E2E Flows',
        milestones: ['File uploads, server parsing, and error boundaries', 'Build, lint, and deploy a full-stack SaaS workflow'],
      },
    ],
    modules: [
      {
        id: 'fs-mod-1',
        title: 'Full-Stack Architecture with Next.js & TypeScript',
        level: 'Beginner',
        estimatedHours: 8,
        overview: 'Connect React UI views directly to typed Next.js Route Handlers.',
        lessons: [
          {
            id: 'fs-l1',
            title: 'Server Boundaries & Shared Type Contracts',
            durationMinutes: 30,
            summary: 'Keep secrets and heavy file parsing on the server while streaming typed JSON to React.',
            steps: [
              'Place server-only secrets and SDKs strictly inside app/api/*/route.ts.',
              'Share request and response interfaces in lib/types.ts.',
              'Handle non-2xx API responses gracefully with inline user-recoverable alerts.',
            ],
            practicalExample: 'Uploading a PDF resume from React to a Next.js multipart API route.',
            codeExample: {
              language: 'typescript',
              code: `// Client-side upload call to Next.js API route
async function uploadResume(file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/resume/parse", { method: "POST", body: form });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to parse resume");
  }
  return res.json();
}`,
            },
          },
        ],
      },
      {
        id: 'fs-mod-2',
        title: 'Authentication & Database Security Rules',
        level: 'Intermediate',
        estimatedHours: 8,
        overview: 'Enforce role-based permissions both in UI guards and Firestore security rules.',
        lessons: [
          {
            id: 'fs-l2',
            title: 'Defense in Depth: UI Guards + Firestore Rules',
            durationMinutes: 35,
            summary: 'Ensure client route guards improve UX while backend rules guarantee true authorization.',
            steps: [
              'Wait for auth readiness before attaching Firestore onSnapshot listeners.',
              'Isolate PII fields in owner-only documents.',
              'Validate document keys, types, and server timestamps inside security rules.',
            ],
            practicalExample: 'Separating candidate-private resumes from recruiter-discoverable opted-in profiles.',
          },
        ],
      },
      {
        id: 'fs-mod-3',
        title: 'Production Readiness & Error Boundaries',
        level: 'Advanced',
        estimatedHours: 8,
        overview: 'Handle offline states, build optimization, and strict TypeScript verification.',
        lessons: [
          {
            id: 'fs-l3',
            title: 'Graceful Degradation & Production Builds',
            durationMinutes: 30,
            summary: 'Ensure zero uncaught exceptions in production builds.',
            steps: [
              'Wrap root layouts in React ErrorBoundaries.',
              'Run TypeScript typecheck, ESLint, and next build before shipping.',
              'Provide explicit configuration guidance whenever optional third-party keys are absent.',
            ],
            practicalExample: 'Shipping a zero-crash full-stack platform with standalone Next.js output.',
          },
        ],
      },
    ],
    miniProjects: [
      {
        id: 'fs-proj-1',
        title: 'Full-Stack Bookmark & Application Tracker',
        difficulty: 'Intermediate',
        description: 'Build an authenticated CRUD workspace persisting user bookmarks and status updates to Firestore.',
        deliverables: ['Auth context provider', 'Firestore security rules', 'Responsive tracker table'],
        skillsPracticed: ['Next.js', 'TypeScript', 'Firebase', 'Tailwind CSS'],
      },
    ],
    resources: [
      { title: 'Next.js App Router Documentation', provider: 'Vercel / Next.js', type: 'Documentation', url: 'https://nextjs.org/docs' },
      { title: 'Firebase Web Fundamentals', provider: 'Firebase', type: 'Documentation', url: 'https://firebase.google.com/docs/web/setup' },
      { title: 'Full Stack Open', provider: 'University of Helsinki', type: 'Course', url: 'https://fullstackopen.com/en/' },
      { title: 'Full-Stack Next.js Course', provider: 'freeCodeCamp', type: 'Video', url: 'https://www.youtube.com/watch?v=ZVnjOPwW4ZA' },
    ],
    practicePrompts: [
      'Trace the full lifecycle of an authenticated POST request from browser button click to persisted Firestore document.',
      'Explain why UI route protection alone is insufficient without database-level security rules.',
    ],
    quizQuestions: [
      {
        id: 'fs-q1',
        kind: 'mcq',
        topic: 'Next.js Architecture',
        difficulty: 'beginner',
        prompt: 'Where should environment secrets like `GEMINI_API_KEY` or `ADZUNA_APP_KEY` be accessed in Next.js?',
        options: [
          'Inside "use client" React components',
          'Inside server-side Route Handlers (app/api/*) or Server Components',
          'Inside localStorage',
          'Inside CSS variables',
        ],
        correctIndex: 1,
        explanation: 'Only server-executed files keep `process.env` secrets private; anything imported into `"use client"` code is bundled to the browser.',
      },
      {
        id: 'fs-q2',
        kind: 'true_false',
        topic: 'Security',
        difficulty: 'intermediate',
        prompt: 'True or False: Hiding a "Delete" button in React UI prevents an attacker from deleting records in Firestore.',
        options: ['True', 'False'],
        correctIndex: 1,
        explanation: 'True authorization must be enforced on the backend / Firestore Security Rules because anyone can invoke the Firestore client API directly.',
      },
      {
        id: 'fs-q3',
        kind: 'technical',
        topic: 'Real-Time Sync',
        difficulty: 'intermediate',
        prompt: 'What should happen when a React component holding a Firestore `onSnapshot` listener unmounts?',
        options: [
          'Call the unsubscribe function returned by onSnapshot in the useEffect cleanup',
          'Reload the entire browser window',
          'Delete the Firestore collection',
          'Nothing; listeners automatically never consume memory',
        ],
        correctIndex: 0,
        explanation: 'Returning the `unsubscribe` callback from `useEffect` closes the listener cleanly and prevents memory leaks and stale state updates.',
      },
    ],
  },
  {
    id: 'cloud-computing-devops',
    slug: 'cloud-computing-devops',
    number: '09',
    title: 'Cloud Computing and DevOps',
    category: 'Infrastructure & Reliability',
    tagline: 'Containerize apps with Docker, automate CI/CD pipelines, manage Linux/cloud infrastructure, and monitor uptime.',
    introduction:
      'Cloud & DevOps Engineers bridge software development and reliable production operations. You will learn Linux shell workflows, Docker containerization, CI/CD pipelines, Kubernetes concepts, Infrastructure as Code, and observability.',
    prerequisites: [
      'Basic command-line familiarity (cd, ls, git)',
      'Basic understanding of web servers and ports',
    ],
    roadmapPhases: [
      {
        phase: 'Phase 1 · Weeks 1–2',
        title: 'Linux, Networking & Git Workflows',
        milestones: ['Navigate Linux permissions, processes, and SSH', 'Understand DNS, TLS, reverse proxies, and ports'],
      },
      {
        phase: 'Phase 2 · Weeks 3–4',
        title: 'Docker Containers & CI/CD Automation',
        milestones: ['Write multi-stage Dockerfiles for lean images', 'Automate lint, test, and build checks with GitHub Actions'],
      },
      {
        phase: 'Phase 3 · Weeks 5–6',
        title: 'Cloud Deployment, Kubernetes & Observability',
        milestones: ['Deploy containerized apps to Cloud Run or Kubernetes', 'Configure health checks, structured logs, and alerts'],
      },
    ],
    modules: [
      {
        id: 'cd-mod-1',
        title: 'Docker Containerization Fundamentals',
        level: 'Beginner',
        estimatedHours: 7,
        overview: 'Package applications deterministically so they run identically across laptops and cloud servers.',
        lessons: [
          {
            id: 'cd-l1',
            title: 'Writing Clean Multi-Stage Dockerfiles',
            durationMinutes: 35,
            summary: 'Minimize image size and attack surface by separating build dependencies from runtime artifacts.',
            steps: [
              'Start from pinned minimal base images (e.g., node:20-alpine).',
              'Copy package.json and lockfile first to maximize Docker layer caching.',
              'Run the final container process as a non-root user.',
            ],
            practicalExample: 'Containerizing a standalone Next.js full-stack application.',
            codeExample: {
              language: 'dockerfile',
              code: `FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
USER node
EXPOSE 3000
CMD ["node", "server.js"]`,
            },
          },
        ],
      },
      {
        id: 'cd-mod-2',
        title: 'CI/CD Pipelines & Automated Gates',
        level: 'Intermediate',
        estimatedHours: 7,
        overview: 'Catch regressions automatically on every pull request using automated CI workflows.',
        lessons: [
          {
            id: 'cd-l2',
            title: 'GitHub Actions Build & Test Pipelines',
            durationMinutes: 30,
            summary: 'Configure fast, reproducible CI checks running TypeScript, ESLint, and unit tests.',
            steps: [
              'Trigger workflows on push and pull_request to main.',
              'Cache npm dependencies to cut build times in half.',
              'Block merges whenever lint, typecheck, or tests fail.',
            ],
            practicalExample: 'Automating CI verification for a full-stack TypeScript repository.',
          },
        ],
      },
      {
        id: 'cd-mod-3',
        title: 'Cloud Orchestration & Observability',
        level: 'Advanced',
        estimatedHours: 9,
        overview: 'Scale containers horizontally, manage environment secrets, and trace production latency.',
        lessons: [
          {
            id: 'cd-l3',
            title: 'Health Probes, Autoscaling & Structured Logging',
            durationMinutes: 35,
            summary: 'Distinguish liveness vs. readiness probes and emit queryable JSON logs.',
            steps: [
              'Expose a lightweight /api/health endpoint verifying runtime readiness.',
              'Inject runtime secrets via Cloud Secret Manager rather than baking into images.',
              'Monitor p95 latency and 5xx error rates with clear alert thresholds.',
            ],
            practicalExample: 'Deploying a stateless web service to Cloud Run with zero-downtime revisions.',
          },
        ],
      },
    ],
    miniProjects: [
      {
        id: 'cd-proj-1',
        title: 'Multi-Stage Container + GitHub Actions CI',
        difficulty: 'Intermediate',
        description: 'Dockerize a Node.js web service with non-root runtime user and add a working CI workflow.',
        deliverables: ['Multi-stage Dockerfile', '.dockerignore', 'GitHub Actions YAML pipeline'],
        skillsPracticed: ['Docker', 'CI/CD', 'Linux'],
      },
    ],
    resources: [
      { title: 'Docker Official Getting Started', provider: 'Docker', type: 'Documentation', url: 'https://docs.docker.com/get-started/' },
      { title: 'Kubernetes Basics Tutorial', provider: 'Kubernetes.io', type: 'Documentation', url: 'https://kubernetes.io/docs/tutorials/kubernetes-basics/' },
      { title: 'DevOps Roadmap & Guides', provider: 'Roadmap.sh', type: 'Free Resource', url: 'https://roadmap.sh/devops' },
      { title: 'Docker & Kubernetes Complete Course', provider: 'TechWorld with Nana', type: 'Video', url: 'https://www.youtube.com/watch?v=3c-iBn73dDE' },
    ],
    practicePrompts: [
      'Why should `COPY package*.json` and `RUN npm ci` appear BEFORE `COPY . .` in a Dockerfile?',
      'Explain the difference between a Kubernetes livenessProbe and readinessProbe.',
    ],
    quizQuestions: [
      {
        id: 'cd-q1',
        kind: 'mcq',
        topic: 'Docker',
        difficulty: 'beginner',
        prompt: 'What is the main benefit of a multi-stage Dockerfile build?',
        options: [
          'It installs twice as many compilers into production',
          'It excludes build tools and source bloat from the final runtime image, shrinking image size and attack surface',
          'It automatically creates a Kubernetes cluster',
          'It disables container networking',
        ],
        correctIndex: 1,
        explanation: 'Multi-stage builds copy only compiled runtime artifacts into a lean final base image.',
      },
      {
        id: 'cd-q2',
        kind: 'true_false',
        topic: 'Secrets Management',
        difficulty: 'beginner',
        prompt: 'True or False: Baking API keys directly into a Dockerfile `ENV` instruction is safe if the container is private.',
        options: ['True', 'False'],
        correctIndex: 1,
        explanation: 'Values baked into image layers remain inspectable via `docker history` or image pulls; inject secrets at runtime.',
      },
      {
        id: 'cd-q3',
        kind: 'technical',
        topic: 'Orchestration',
        difficulty: 'intermediate',
        prompt: 'What happens if a container’s readiness probe fails while its liveness probe passes?',
        options: [
          'The orchestrator immediately kills and restarts the container',
          'The orchestrator stops routing new traffic to the pod until it recovers without killing it',
          'The database is wiped',
          'The container is scaled to 100 replicas',
        ],
        correctIndex: 1,
        explanation: 'Readiness controls traffic routing (load balancer membership), whereas liveness triggers container restarts.',
      },
    ],
  },
  {
    id: 'cybersecurity',
    slug: 'cybersecurity',
    number: '10',
    title: 'Cybersecurity',
    category: 'Security & Defensive Engineering',
    tagline: 'Protect applications and infrastructure through OWASP secure coding, authentication hardening, and threat modeling.',
    introduction:
      'Cybersecurity Engineers defend software, networks, and user data from real-world threats. You will learn the OWASP Top 10 vulnerabilities, cryptography fundamentals, least-privilege IAM, threat modeling, and defensive log analysis.',
    prerequisites: [
      'Basic networking concepts (HTTP, DNS, IP addresses)',
      'Basic familiarity with web applications or command line',
    ],
    roadmapPhases: [
      {
        phase: 'Phase 1 · Weeks 1–2',
        title: 'Security Foundations & Cryptography',
        milestones: ['CIA Triad, symmetric vs. asymmetric encryption, hashing vs. encryption', 'TLS handshake and certificate verification'],
      },
      {
        phase: 'Phase 2 · Weeks 3–4',
        title: 'Application Security (OWASP Top 10)',
        milestones: ['Prevent SQL/NoSQL injection, XSS, CSRF, and SSRF', 'Implement secure session cookies and RBAC authorization'],
      },
      {
        phase: 'Phase 3 · Weeks 5–6',
        title: 'Threat Modeling & Cloud Defense',
        milestones: ['Conduct STRIDE threat modeling on web architectures', 'Audit IAM permissions and detect anomalous logs'],
      },
    ],
    modules: [
      {
        id: 'sec-mod-1',
        title: 'Cryptography & Identity Fundamentals',
        level: 'Beginner',
        estimatedHours: 6,
        overview: 'Understand password hashing, salted digests, TLS, and token verification.',
        lessons: [
          {
            id: 'sec-l1',
            title: 'Hashing vs. Encryption & Password Storage',
            durationMinutes: 30,
            summary: 'Choose the right cryptographic primitive for passwords, transport, and integrity.',
            steps: [
              'Never encrypt or store plaintext passwords; use slow adaptive hashing (Argon2id/bcrypt) with unique salts.',
              'Use SHA-256 for integrity verification, not password hashing.',
              'Enforce HTTPS/TLS everywhere to protect credentials and tokens in transit.',
            ],
            practicalExample: 'Comparing fast SHA-256 checksums vs. memory-hard Argon2 password hashing.',
            codeExample: {
              language: 'python',
              code: `import hashlib, hmac

def verify_webhook_signature(payload: bytes, secret: bytes, signature: str) -> bool:
    expected = hmac.new(secret, payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)`,
            },
          },
        ],
      },
      {
        id: 'sec-mod-2',
        title: 'OWASP Top 10 & Secure Web Coding',
        level: 'Intermediate',
        estimatedHours: 9,
        overview: 'Eliminate broken access control, injection flaws, and cross-site scripting.',
        lessons: [
          {
            id: 'sec-l2',
            title: 'Broken Access Control & Injection Prevention',
            durationMinutes: 35,
            summary: 'Stop IDOR vulnerabilities and parameter tampering at the data-access layer.',
            steps: [
              'Always verify object ownership (`resource.uid == auth.uid`) on every read/update/delete.',
              'Use parameterized queries or strict schema validators — never concatenate untrusted strings into SQL.',
              'Escape or sanitize untrusted HTML and avoid dangerouslySetInnerHTML.',
            ],
            practicalExample: 'Auditing a multi-tenant SaaS endpoint against Insecure Direct Object Reference (IDOR).',
          },
        ],
      },
      {
        id: 'sec-mod-3',
        title: 'Threat Modeling & Incident Readiness',
        level: 'Advanced',
        estimatedHours: 8,
        overview: 'Identify architectural blind spots proactively using STRIDE.',
        lessons: [
          {
            id: 'sec-l3',
            title: 'Applying STRIDE to Cloud Applications',
            durationMinutes: 30,
            summary: 'Systematically audit Spoofing, Tampering, Repudiation, Information Disclosure, DoS, and Elevation of Privilege.',
            steps: [
              'Diagram trust boundaries between browser, API server, third-party APIs, and database.',
              'Check each boundary for missing auth, shadow fields, or unbounded payload sizes.',
              'Log security-sensitive events without logging raw secrets or PII.',
            ],
            practicalExample: 'Running a Red Team payload audit on Firestore security rules.',
          },
        ],
      },
    ],
    miniProjects: [
      {
        id: 'sec-proj-1',
        title: 'OWASP Vulnerability Audit & Remediation Report',
        difficulty: 'Intermediate',
        description: 'Inspect a sample web API for IDOR, XSS, and missing rate limits, and produce patched code with verification tests.',
        deliverables: ['STRIDE threat matrix', 'Patched API snippets', 'Regression test checklist'],
        skillsPracticed: ['OWASP Top 10', 'Access Control', 'Threat Modeling'],
      },
    ],
    resources: [
      { title: 'OWASP Top 10 Web Application Security Risks', provider: 'OWASP', type: 'Documentation', url: 'https://owasp.org/www-project-top-ten/' },
      { title: 'PortSwigger Web Security Academy', provider: 'PortSwigger', type: 'Free Resource', url: 'https://portswigger.net/web-security' },
      { title: 'CS50 Cybersecurity Lectures', provider: 'Harvard CS50', type: 'Video', url: 'https://www.youtube.com/watch?v=9HOem0amlyg' },
      { title: 'Cybersecurity Roadmap', provider: 'Roadmap.sh', type: 'Course', url: 'https://roadmap.sh/cyber-security' },
    ],
    practicePrompts: [
      'Why does `hmac.compare_digest` matter when verifying webhook signatures instead of `==`?',
      'Explain how Broken Access Control (IDOR) works and how server-side ownership checks stop it.',
    ],
    quizQuestions: [
      {
        id: 'sec-q1',
        kind: 'mcq',
        topic: 'OWASP Top 10',
        difficulty: 'beginner',
        prompt: 'What does an Insecure Direct Object Reference (IDOR) vulnerability allow an attacker to do?',
        options: [
          'Bypass TLS encryption in the browser',
          'Access or modify another user’s record by changing an ID parameter when authorization is missing',
          'Exhaust server CPU using CSS animations',
          'Automatically guess an Argon2 hash in 1 millisecond',
        ],
        correctIndex: 1,
        explanation: 'IDOR occurs when an application exposes an internal identifier without verifying that the authenticated user is authorized to access that specific record.',
      },
      {
        id: 'sec-q2',
        kind: 'true_false',
        topic: 'Cryptography',
        difficulty: 'beginner',
        prompt: 'True or False: Plain SHA-256 without salt or key stretching is recommended for storing user passwords.',
        options: ['True', 'False'],
        correctIndex: 1,
        explanation: 'SHA-256 is optimized for speed, making brute-force GPU cracking trivial; passwords require salted, slow, memory-hard algorithms like Argon2id or bcrypt.',
      },
      {
        id: 'sec-q3',
        kind: 'technical',
        topic: 'Web Security',
        difficulty: 'intermediate',
        prompt: 'Which HTTP cookie flags protect session cookies from JavaScript theft (XSS) and cross-site request forgery?',
        options: [
          'Public and Max-Age',
          'HttpOnly, Secure, and SameSite',
          'Allow-Origin and Content-Type',
          'Cache-Control and ETag',
        ],
        correctIndex: 1,
        explanation: '`HttpOnly` blocks `document.cookie` access, `Secure` restricts transmission to HTTPS, and `SameSite` mitigates CSRF.',
      },
    ],
  },
];
