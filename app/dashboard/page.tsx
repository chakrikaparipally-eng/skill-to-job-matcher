'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Target,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  Compass,
  Award,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { AppShell } from '@/components/layout/AppShell';
import { ProtectedGate } from '@/components/common/ProtectedGate';
import { useAuth } from '@/components/providers/AuthProvider';
import { ALL_SKILLS } from '@/lib/curriculum';
import {
  getOpenJobListings,
  getUserJobApplications,
  getUserLearningProgress,
  getUserQuizResults,
  getUserResumeAnalyses,
  getUserSavedJobs,
  getUserSkillGapReports,
} from '@/lib/firestore-service';
import {
  JobApplication,
  JobListing,
  LearningProgress,
  QuizResult,
  ResumeAnalysis,
  SavedJob,
  SkillGapReport,
} from '@/lib/types';

export default function CandidateDashboardPage() {
  const { firebaseUser, userAccount, candidateProfile } = useAuth();

  const [analyses, setAnalyses] = useState<ResumeAnalysis[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [learningProgress, setLearningProgress] = useState<LearningProgress[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [gapReports, setGapReports] = useState<SkillGapReport[]>([]);
  const [openJobs, setOpenJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser || !firebaseUser.emailVerified) return;
    let active = true;
    Promise.all([
      getUserResumeAnalyses(firebaseUser.uid),
      getUserQuizResults(firebaseUser.uid),
      getUserLearningProgress(firebaseUser.uid),
      getUserSavedJobs(firebaseUser.uid),
      getUserJobApplications(firebaseUser.uid),
      getUserSkillGapReports(firebaseUser.uid),
      getOpenJobListings(),
    ])
      .then(([ana, quiz, prog, saved, apps, gaps, jobs]) => {
        if (!active) return;
        setAnalyses(ana);
        setQuizResults(quiz);
        setLearningProgress(prog);
        setSavedJobs(saved);
        setApplications(apps);
        setGapReports(gaps);
        setOpenJobs(jobs);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [firebaseUser]);

  const latestAnalysis = analyses[0];
  const resumeScore =
    latestAnalysis?.scoreBreakdown?.overall ?? candidateProfile?.resumeScore ?? null;
  const totalSkills = candidateProfile?.skills?.length ?? 0;

  const skillTracksProgress = learningProgress.filter(
    (p) => p.skillId !== 'custom_improvement_plan'
  );
  const avgLearningPct =
    skillTracksProgress.length > 0
      ? Math.round(
          skillTracksProgress.reduce((sum, p) => sum + (p.completionPercentage || 0), 0) /
            skillTracksProgress.length
        )
      : 0;

  const customPlan = learningProgress.find((p) => p.skillId === 'custom_improvement_plan');
  const latestGap = gapReports[0];

  const quizAvg =
    quizResults.length > 0
      ? Math.round(
          quizResults.reduce((sum, q) => sum + (q.percentage || 0), 0) / quizResults.length
        )
      : 0;

  const chartData = skillTracksProgress.map((p) => {
    const sk = ALL_SKILLS.find((s) => s.id === p.skillId);
    return {
      name: sk ? sk.title.split(' ')[0] : p.skillId,
      completion: p.completionPercentage,
    };
  });

  // Simple deterministic job recommendation match against open platform postings
  const candidateSkillSet = new Set(
    (candidateProfile?.skills || []).map((s) => s.toLowerCase())
  );
  const recommendedJobs = openJobs
    .map((job) => {
      const reqs = job.requiredSkills || [];
      const hits = reqs.filter((r) => candidateSkillSet.has(r.toLowerCase())).length;
      const pct = reqs.length > 0 ? Math.round((hits / reqs.length) * 100) : 0;
      return { job, pct };
    })
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 4);

  return (
    <AppShell
      title="Candidate Dashboard"
      subtitle={`Welcome back, ${userAccount?.displayName || 'Learner'}`}
    >
      <ProtectedGate>
        <div className="space-y-6">
          {/* Top Metric Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-medium text-slate-500">Resume Analysis Score</p>
              <p className="mt-1.5 text-2xl font-bold text-[#0B1221] tabular-nums">
                {resumeScore !== null ? `${resumeScore} / 100` : 'Not Uploaded'}
              </p>
              <Link
                href="/resume-analyzer"
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline"
              >
                {resumeScore !== null ? 'View Resume Report' : 'Upload PDF / DOCX'}
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-medium text-slate-500">Identified Skills</p>
              <p className="mt-1.5 text-2xl font-bold text-[#0B1221] tabular-nums">
                {totalSkills}
              </p>
              <Link
                href="/profile"
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline"
              >
                Edit Skill Profile
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-medium text-slate-500">Learning Progress</p>
              <p className="mt-1.5 text-2xl font-bold text-[#0B1221] tabular-nums">
                {avgLearningPct}%
              </p>
              <p className="mt-2 text-xs text-slate-500 tabular-nums">
                {skillTracksProgress.length} active tracks · {quizAvg}% avg quiz
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-medium text-slate-500">Jobs & Applications</p>
              <p className="mt-1.5 text-2xl font-bold text-[#0B1221] tabular-nums">
                {applications.length} Applied · {savedJobs.length} Saved
              </p>
              <Link
                href="/applications"
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline"
              >
                Open Tracker
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
              Loading your dashboard telemetry from Firestore...
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 7 cols: Charts + Skill Gap + Roadmap */}
              <div className="lg:col-span-7 space-y-6">
                <div className="rounded-xl border border-slate-200 bg-white p-6">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="text-base font-bold text-[#0B1221]">
                      Skill Track Completion
                    </h2>
                    <Link
                      href="/skills"
                      className="text-xs font-semibold text-blue-700 hover:underline"
                    >
                      Explore 10 Skills
                    </Link>
                  </div>

                  {chartData.length === 0 ? (
                    <div className="mt-4 rounded-lg border border-dashed border-slate-200 p-8 text-center">
                      <Compass className="mx-auto h-7 w-7 text-slate-400" />
                      <p className="mt-2 text-xs text-slate-600">
                        Start any learning track and mark lessons complete to track progress here.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Bar dataKey="completion" fill="#2563EB" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* Skill Gap & Personalized Roadmap Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[#0B1221]">Latest Skill Gap</h3>
                      <Target className="h-4 w-4 text-violet-700" />
                    </div>
                    {latestGap ? (
                      <>
                        <p className="text-xs text-slate-600">
                          Role: <strong>{latestGap.targetRole}</strong>
                        </p>
                        <p className="text-2xl font-bold text-blue-700 tabular-nums">
                          {latestGap.matchPercentage}% Match
                        </p>
                        <p className="text-xs text-slate-500">
                          {latestGap.matchedSkills.length} matched ·{' '}
                          {latestGap.missingSkills.length} missing
                        </p>
                      </>
                    ) : (
                      <p className="text-xs text-slate-500">
                        Run a skill-gap check against your target role.
                      </p>
                    )}
                    <Link
                      href="/skill-gap"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline"
                    >
                      Open Skill Gap Analyzer
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[#0B1221]">My Improvement Plan</h3>
                      <Award className="h-4 w-4 text-blue-700" />
                    </div>
                    {customPlan?.customRoadmap?.length ? (
                      <>
                        <p className="text-xs text-slate-600">
                          Target: <strong>{customPlan.targetRole}</strong>
                        </p>
                        <p className="text-2xl font-bold text-[#0B1221] tabular-nums">
                          {customPlan.completionPercentage}% Done
                        </p>
                        <p className="text-xs text-slate-500">
                          {customPlan.customRoadmap.length}-week tailored roadmap
                        </p>
                      </>
                    ) : (
                      <p className="text-xs text-slate-500">
                        Generate your personalized weekly improvement roadmap.
                      </p>
                    )}
                    <Link
                      href="/learning-plan"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline"
                    >
                      Open My Learning Plan
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right 5 cols: Recommended Platform Jobs + Recent Activities */}
              <div className="lg:col-span-5 space-y-6">
                <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-[#0B1221]">
                      Recommended Recruiter Postings
                    </h2>
                    <Link
                      href="/jobs"
                      className="text-xs font-semibold text-blue-700 hover:underline"
                    >
                      Search All Jobs
                    </Link>
                  </div>

                  {recommendedJobs.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
                      <Briefcase className="mx-auto h-6 w-6 text-slate-400 mb-2" />
                      No recruiter job postings published yet. Use Find Jobs to search external APIs.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {recommendedJobs.map(({ job, pct }) => (
                        <div key={job.id} className="py-3 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {job.title}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              {job.companyName} · {job.location}
                            </p>
                          </div>
                          <span className="font-mono text-xs font-semibold text-blue-700 tabular-nums shrink-0">
                            {pct}% Match
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
                  <h2 className="text-base font-bold text-[#0B1221]">Recent Activity</h2>
                  <div className="space-y-2.5 text-xs text-slate-600">
                    {latestAnalysis && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                        <span>
                          Analyzed resume <strong>{latestAnalysis.fileName}</strong> (
                          {latestAnalysis.scoreBreakdown?.overall}/100)
                        </span>
                      </div>
                    )}
                    {quizResults.slice(0, 3).map((q) => (
                      <div key={q.id} className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>
                          Scored <strong>{q.percentage}%</strong> on {q.skillTitle} ({q.difficulty})
                        </span>
                      </div>
                    ))}
                    {!latestAnalysis && quizResults.length === 0 && (
                      <p className="text-slate-400">
                        Your recent quizzes, resume analyses, and applications will appear here.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ProtectedGate>
    </AppShell>
  );
}
