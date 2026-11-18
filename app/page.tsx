'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, FileText, Briefcase, Compass, Layers } from 'lucide-react';
import { ALL_SKILLS } from '@/lib/curriculum';
import { useAuth } from '@/components/providers/AuthProvider';
import { LANDING_IMAGES } from '@/components/landing/LandingAssets';

const SAMPLE_TESTIMONIALS = [
  {
    name: 'Priya Nair',
    role: 'Junior Data Analyst',
    organization: 'Northstar Logistics',
    statement:
      'Before Skill To Job Matcher, my resume missed SQL window functions and data-cleaning metrics. After running the resume rubric and completing the 4-week Analytics roadmap, I raised my job match score from 54% to 86% and landed three interviews.',
  },
  {
    name: 'Marcus Chen',
    role: 'Backend Engineer',
    organization: 'Cloudline Systems',
    statement:
      'I transitioned from general Python scripting to production APIs by following the Backend & DevOps mini-projects. The skill-gap analyzer flagged Docker and Zod validation early so I focused study hours on what hiring teams actually tested.',
  },
  {
    name: 'Elena Rostova',
    role: 'Technical Recruiter',
    organization: 'Veridian Labs',
    statement:
      'Reviewing candidates who opt into Skill To Job Matcher discovery saves our engineering leads hours. Seeing verified assessment scores alongside structured skills and project summaries lets us shortlist qualified talent transparently.',
  },
];

export default function LandingPage() {
  const { firebaseUser, userAccount } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const categories = ['All', ...Array.from(new Set(ALL_SKILLS.map((s) => s.category)))];
  const visibleSkills =
    selectedCategory === 'All'
      ? ALL_SKILLS
      : ALL_SKILLS.filter((s) => s.category === selectedCategory);

  const workspaceHref =
    userAccount?.accountType === 'recruiter' ? '/recruiter' : '/dashboard';

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-slate-900">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-4">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-[#0B1221] whitespace-nowrap shrink-0"
          >
            Skill To Job Matcher
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link
              href="/skills"
              className="hover:text-[#0B1221] transition-colors whitespace-nowrap shrink-0"
            >
              Explore Skills
            </Link>
            <Link
              href="/resume-analyzer"
              className="hover:text-[#0B1221] transition-colors whitespace-nowrap shrink-0"
            >
              Resume Analyzer
            </Link>
            <Link
              href="/skill-gap"
              className="hover:text-[#0B1221] transition-colors whitespace-nowrap shrink-0"
            >
              Skill Gap
            </Link>
            <Link
              href="/jobs"
              className="hover:text-[#0B1221] transition-colors whitespace-nowrap shrink-0"
            >
              Find Jobs
            </Link>
            <Link
              href="/quizzes"
              className="hover:text-[#0B1221] transition-colors whitespace-nowrap shrink-0"
            >
              Practice Quizzes
            </Link>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href={firebaseUser ? workspaceHref : '/auth'}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0B1221] px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              {firebaseUser ? 'Open Dashboard' : 'Get Started'}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-slate-200 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-6 py-14 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center">
              <p className="text-xs font-medium tracking-wide text-blue-700">
                Career Readiness · Resume Intelligence · Live Job Matching
              </p>
              <h1
                className="mt-4 font-bold tracking-tight text-[#0B1221] text-balance"
                style={{ fontSize: 'clamp(2.25rem, 4vw, 3.5rem)', lineHeight: 1.1 }}
              >
                Build real technical skills and match directly with real jobs.
              </h1>
              <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                Skill To Job Matcher connects beginners, learners, job seekers, and recruiters on one unified platform—combining structured tutorials across 10 core engineering disciplines, Gemini-powered PDF/DOCX resume scoring, transparent skill-gap roadmaps, and verified job search.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href={firebaseUser ? workspaceHref : '/auth'}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  {firebaseUser ? 'Go to Workspace' : 'Get Started Free'}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={firebaseUser ? '/skills' : '/auth?mode=login'}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-800 hover:bg-slate-50 transition-colors whitespace-nowrap"
                >
                  {firebaseUser ? 'Explore 10 Skills' : 'Sign In'}
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative h-72 sm:h-96 lg:h-full min-h-[340px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-[#0B1221]">
                {!imgErrors.hero ? (
                  <img
                    src={LANDING_IMAGES.heroWorkspace}
                    alt="Engineer analyzing technical skill readiness metrics on a workstation"
                    referrerPolicy="no-referrer"
                    onError={() => setImgErrors((p) => ({ ...p, hero: true }))}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center text-slate-300">
                    <Compass className="h-10 w-10 text-blue-400" />
                    <p className="mt-3 text-sm font-medium">Skill To Job Matcher Engineering Studio</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Full-width 4-column capability strip */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-t border-slate-200 pt-8">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-medium text-slate-500">Skill Curriculum</p>
              <p className="mt-1 text-lg font-semibold text-[#0B1221] tabular-nums">
                10 Core Tech Tracks
              </p>
              <p className="mt-1 text-xs text-slate-600">
                Beginner-to-advanced lessons, runnable code, and mini-projects.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-medium text-slate-500">Document Parsing</p>
              <p className="mt-1 text-lg font-semibold text-[#0B1221] tabular-nums">
                PDF & DOCX Extraction
              </p>
              <p className="mt-1 text-xs text-slate-600">
                100-point rubric evaluation grounded strictly in your actual resume.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-medium text-slate-500">Gap Diagnostics</p>
              <p className="mt-1 text-lg font-semibold text-[#0B1221] tabular-nums">
                Matched vs. Missing
              </p>
              <p className="mt-1 text-xs text-slate-600">
                Transparent percentages plus week-by-week improvement plans.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-medium text-slate-500">Talent Discovery</p>
              <p className="mt-1 text-lg font-semibold text-[#0B1221] tabular-nums">
                Live Jobs & Recruiters
              </p>
              <p className="mt-1 text-xs text-slate-600">
                External Adzuna/Jooble vacancies alongside opt-in recruiter hiring.
              </p>
            </div>
          </div>

          {/* Direct Platform Directory */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: 'Candidate Dashboard', href: '/dashboard', desc: 'Progress & scores' },
              { label: 'Tutorials & Courses', href: '/courses', desc: 'Beginner to advanced' },
              { label: 'Practice Quizzes', href: '/quizzes', desc: 'Timed tests & AI Qs' },
              { label: 'AI Resume Analyzer', href: '/resume-analyzer', desc: 'PDF & DOCX scoring' },
              { label: 'Skill Gap Analyzer', href: '/skill-gap', desc: 'Role & JD matching' },
              { label: 'Find Jobs', href: '/jobs', desc: 'Real search & match' },
              { label: 'My Improvement Plan', href: '/learning-plan', desc: 'Weekly AI roadmap' },
              { label: 'My Applications', href: '/applications', desc: 'Bookmarks & status' },
              { label: 'Recruiter Hub', href: '/recruiter', desc: 'Post jobs & shortlist' },
              { label: 'Profile & Privacy', href: '/profile', desc: 'Skills & opt-in' },
            ].map((mod) => (
              <Link
                key={mod.href}
                href={mod.href}
                className="group rounded-lg border border-slate-200 bg-white px-4 py-3 hover:border-blue-400 transition-colors"
              >
                <p className="text-xs font-semibold text-[#0B1221] group-hover:text-blue-700 truncate">
                  {mod.label}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500 truncate">{mod.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Explore 10 Skills Section */}
      <section className="py-16 lg:py-20 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1221]">
                Explore 10 Core Technical Skills
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl">
                Every discipline includes prerequisites, structured modules, step-by-step code examples, verified documentation, mini-projects, and timed assessments.
              </p>
            </div>
            <Link
              href="/skills"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-800 whitespace-nowrap shrink-0"
            >
              View full catalog
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-[#0B1221] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {visibleSkills.map((skill) => {
              const lessonCount = skill.modules.reduce((acc, m) => acc + m.lessons.length, 0);
              return (
                <Link
                  key={skill.id}
                  href={`/skills/${skill.slug}`}
                  className="group rounded-xl border border-slate-200 bg-white p-6 hover:border-blue-400 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-mono font-semibold text-blue-700 tabular-nums">
                        {skill.number}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{skill.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{lessonCount} lessons</span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-[#0B1221] group-hover:text-blue-700 transition-colors">
                      {skill.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                      {skill.tagline}
                    </p>
                  </div>
                  <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-blue-700">
                    Start learning track
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 lg:py-20 border-b border-slate-200 bg-[#0B1221] text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 aspect-[4/3]">
                {!imgErrors.arch ? (
                  <img
                    src={LANDING_IMAGES.learningArchitecture}
                    alt="Modular staircase progression illustrating structured skill development"
                    referrerPolicy="no-referrer"
                    onError={() => setImgErrors((p) => ({ ...p, arch: true }))}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center p-8 text-slate-400">
                    <Layers className="h-10 w-10 text-violet-400" />
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-7">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                How Skill To Job Matcher Works
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl">
                Every workflow connects verifiable evidence—from the text inside your uploaded resume to real hiring requirements.
              </p>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
                  <p className="font-mono text-xs text-blue-400">01. Upload & Parse</p>
                  <h3 className="mt-2 text-base font-semibold text-white">
                    Extract Verified Resume Data
                  </h3>
                  <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                    Upload a PDF or DOCX resume. Server parsers extract raw text and Gemini structures skills, degrees, projects, and experience into an editable profile.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
                  <p className="font-mono text-xs text-violet-400">02. Diagnose Gaps</p>
                  <h3 className="mt-2 text-base font-semibold text-white">
                    Compare Against Target Roles
                  </h3>
                  <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                    See exact matched skills, missing requirements, and ambiguous skills needing confirmation—never fabricated claims.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
                  <p className="font-mono text-xs text-blue-400">03. Learn & Test</p>
                  <h3 className="mt-2 text-base font-semibold text-white">
                    Follow Your Improvement Plan
                  </h3>
                  <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                    Complete structured lessons across 10 domains, track weekly goals, and validate knowledge with timed coding & technical quizzes.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
                  <p className="font-mono text-xs text-violet-400">04. Match & Apply</p>
                  <h3 className="mt-2 text-base font-semibold text-white">
                    Apply to Real Opportunities
                  </h3>
                  <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                    Search live job APIs and recruiter postings, score compatibility transparently, bookmark vacancies, and track applications.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resume Analysis & Skill Gap Section */}
      <section className="py-16 lg:py-20 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <p className="text-xs font-medium text-violet-700">
              Resume Intelligence · 100-Point Rubric
            </p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1221]">
              Transparent resume scoring built from your actual document.
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
              We parse PDF and DOCX files directly on the server, evaluate six weighted dimensions (technical skills, projects, education, practical experience, certifications, and clarity), identify missing keywords, and generate a downloadable analysis report.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                <span>Clear error reporting for unreadable, scanned, or password-protected files</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                <span>Editable candidate profile synced directly to Firestore</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                <span>Actionable rewrites for weak project bullet points</span>
              </li>
            </ul>
            <div className="mt-8">
              <Link
                href="/resume-analyzer"
                className="inline-flex items-center gap-2 rounded-lg bg-[#0B1221] px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
              >
                <FileText className="h-4 w-4" />
                Analyze Your Resume
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 aspect-[4/3]">
              {!imgErrors.resume ? (
                <img
                  src={LANDING_IMAGES.resumeAnalyticsDesk}
                  alt="Printed technical resume beside skill gap analysis charts on tablet"
                  referrerPolicy="no-referrer"
                  onError={() => setImgErrors((p) => ({ ...p, resume: true }))}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center p-8 text-slate-400">
                  <FileText className="h-10 w-10 text-blue-600" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Job Matching & Recruiter Section */}
      <section className="py-16 lg:py-20 border-b border-slate-200 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 aspect-[4/3]">
              {!imgErrors.recruiter ? (
                <img
                  src={LANDING_IMAGES.recruiterReview}
                  alt="Technical recruiter reviewing candidate skill profiles on widescreen monitor"
                  referrerPolicy="no-referrer"
                  onError={() => setImgErrors((p) => ({ ...p, recruiter: true }))}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center p-8 text-slate-400">
                  <Briefcase className="h-10 w-10 text-violet-700" />
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2">
            <p className="text-xs font-medium text-blue-700">
              Job Matching · Opt-In Recruiter Discovery
            </p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1221]">
              Real job listings paired with transparent compatibility scoring.
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
              Search live vacancies from configured external job APIs (Adzuna & Jooble) alongside recruiter-published roles on Skill To Job Matcher. Candidates control whether their profile is visible to recruiters at all times.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                <Briefcase className="h-4 w-4" />
                Search Real Jobs
              </Link>
              <Link
                href="/auth?role=recruiter"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 transition-colors"
              >
                Recruiter Portal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Clearly Labeled Sample Testimonials */}
      <section className="py-16 lg:py-20 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl">
            <p className="text-xs font-medium text-slate-500">
              Sample User Stories (Illustrative Examples)
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1221]">
              Built for learners, job seekers, and hiring teams
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {SAMPLE_TESTIMONIALS.map((item) => (
              <figure
                key={item.name}
                className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-6 flex flex-col justify-between"
              >
                <blockquote className="text-sm text-slate-700 leading-relaxed">
                  &ldquo;{item.statement}&rdquo;
                </blockquote>
                <figcaption className="mt-6 border-t border-slate-200 pt-4">
                  <p className="text-sm font-semibold text-[#0B1221]">{item.name}</p>
                  <p className="text-xs text-slate-500">
                    {item.role} · {item.organization} (Sample)
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Quiet Footer */}
      <footer className="bg-[#0B1221] text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <p className="text-base font-bold text-white">Skill To Job Matcher</p>
            <p className="mt-1 text-xs text-slate-400">
              Skill Development, Resume Intelligence & Real Job Matching Platform
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-400">
            <Link href="/skills" className="hover:text-white">Explore Skills</Link>
            <Link href="/courses" className="hover:text-white">Tutorials & Courses</Link>
            <Link href="/quizzes" className="hover:text-white">Practice & Quizzes</Link>
            <Link href="/resume-analyzer" className="hover:text-white">Resume Analyzer</Link>
            <Link href="/skill-gap" className="hover:text-white">Skill Gap Analyzer</Link>
            <Link href="/jobs" className="hover:text-white">Find Jobs</Link>
            <Link href="/learning-plan" className="hover:text-white">My Learning Plan</Link>
            <Link href="/applications" className="hover:text-white">My Applications</Link>
            <Link href="/profile" className="hover:text-white">Profile</Link>
          </nav>
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Skill To Job Matcher
          </p>
        </div>
      </footer>
    </div>
  );
}
