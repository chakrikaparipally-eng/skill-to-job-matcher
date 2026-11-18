'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  ExternalLink,
  Award,
  Code2,
  Copy,
  Check,
  PlayCircle,
  FolderGit2,
  ClipboardCheck,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { getSkillBySlug, getTotalLessonsForSkill } from '@/lib/curriculum';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  getUserLearningProgress,
  getUserQuizResults,
  upsertLearningProgress,
} from '@/lib/firestore-service';
import { QuizResult } from '@/lib/types';

export function SkillDetailClient({ slug }: { slug: string }) {
  const skill = getSkillBySlug(slug);
  const { firebaseUser, userAccount } = useAuth();

  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [quizHistory, setQuizHistory] = useState<QuizResult[]>([]);
  const [activeTab, setActiveTab] = useState<'lessons' | 'roadmap' | 'projects' | 'resources'>(
    'lessons'
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savingLesson, setSavingLesson] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!skill || !firebaseUser || !firebaseUser.emailVerified) return;
    getUserLearningProgress(firebaseUser.uid).then((items) => {
      const found = items.find((i) => i.skillId === skill.id);
      if (found) setCompletedLessons(found.completedLessonIds || []);
    });
    getUserQuizResults(firebaseUser.uid).then((results) => {
      setQuizHistory(results.filter((r) => r.skillId === skill.id));
    });
  }, [skill, firebaseUser]);

  if (!skill) {
    return (
      <AppShell title="Skill Not Found">
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <h2 className="text-lg font-semibold text-slate-900">Skill track not found</h2>
          <Link
            href="/skills"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#0B1221] px-4 py-2 text-xs font-semibold text-white"
          >
            Back to Explore Skills
          </Link>
        </div>
      </AppShell>
    );
  }

  const totalLessons = getTotalLessonsForSkill(skill);
  const completionPct =
    totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0;
  const bestQuiz = quizHistory.reduce((max, r) => Math.max(max, r.percentage), 0);
  const badgeEarned = completionPct === 100 || bestQuiz >= 70;

  const toggleLessonComplete = async (lessonId: string) => {
    const next = completedLessons.includes(lessonId)
      ? completedLessons.filter((id) => id !== lessonId)
      : [...completedLessons, lessonId];

    setCompletedLessons(next);
    const pct = totalLessons > 0 ? Math.round((next.length / totalLessons) * 100) : 0;
    const earned = pct === 100 || bestQuiz >= 70;

    if (!firebaseUser || !firebaseUser.emailVerified) {
      setStatusNotice('Sign in with a verified email to save lesson completion permanently.');
      return;
    }

    setSavingLesson(lessonId);
    try {
      await upsertLearningProgress(firebaseUser.uid, skill.id, {
        completedLessonIds: next,
        completionPercentage: pct,
        badgeEarned: earned,
      });
      setStatusNotice(null);
    } finally {
      setSavingLesson(null);
    }
  };

  const copyCode = async (id: string, code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <AppShell title={`${skill.number}. ${skill.title}`} subtitle={skill.category}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/skills"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            All 10 Skills
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/quizzes?skill=${skill.id}`}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              <ClipboardCheck className="h-4 w-4" />
              Take Final / Topic Quiz
            </Link>
          </div>
        </div>

        {statusNotice && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-900">
            {statusNotice}
          </div>
        )}

        {/* Overview & Completion Progress Header */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8">
              <p className="text-xs font-medium text-blue-700">
                Beginner-to-Advanced Curriculum · {skill.modules.length} Modules · {totalLessons} Lessons
              </p>
              <h2 className="mt-2 text-2xl font-bold text-[#0B1221]">{skill.title}</h2>
              <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                {skill.introduction}
              </p>

              <div className="mt-5">
                <h3 className="text-xs font-semibold text-slate-900">Prerequisites</h3>
                <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
                  {skill.prerequisites.map((pre) => (
                    <li key={pre} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                      <span>{pre}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-[#F8FAFC] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600">Track Completion</span>
                <span className="text-lg font-bold text-[#0B1221] tabular-nums">
                  {completionPct}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full bg-blue-600 transition-all"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
              <p className="text-xs text-slate-600 tabular-nums">
                {completedLessons.length} of {totalLessons} lessons completed · Best quiz:{' '}
                <strong>{bestQuiz}%</strong>
              </p>

              {badgeEarned ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs">
                    <Award className="h-4 w-4" />
                    Completion Badge Earned
                  </div>
                  <p className="mt-1 text-xs text-emerald-900">
                    Awarded to{' '}
                    <strong>{userAccount?.displayName || 'Verified Learner'}</strong> for{' '}
                    {skill.title}.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Complete all lessons or score 70%+ on the assessment to earn your completion badge.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Segmented Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          {(
            [
              { id: 'lessons', label: 'Modules & Lessons' },
              { id: 'roadmap', label: 'Learning Roadmap' },
              { id: 'projects', label: 'Mini-Projects & Practice' },
              { id: 'resources', label: 'Videos, Docs & Courses' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                activeTab === tab.id
                  ? 'bg-[#0B1221] text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Modules & Interactive Step-by-Step Lessons */}
        {activeTab === 'lessons' && (
          <div className="space-y-6">
            {skill.modules.map((mod, mIdx) => (
              <section
                key={mod.id}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden"
              >
                <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Module 0{mIdx + 1} · {mod.level} · {mod.estimatedHours} hrs
                    </p>
                    <h3 className="mt-0.5 text-base font-bold text-[#0B1221]">{mod.title}</h3>
                  </div>
                  <p className="text-xs text-slate-600 max-w-md">{mod.overview}</p>
                </div>

                <div className="divide-y divide-slate-200">
                  {mod.lessons.map((lesson) => {
                    const done = completedLessons.includes(lesson.id);
                    return (
                      <div key={lesson.id} className="p-6 space-y-4">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <h4 className="text-base font-semibold text-slate-900">
                              {lesson.title}
                            </h4>
                            <p className="mt-1 text-xs text-slate-500 tabular-nums">
                              {lesson.durationMinutes} min · {lesson.summary}
                            </p>
                          </div>
                          <button
                            type="button"
                            disabled={savingLesson === lesson.id}
                            onClick={() => toggleLessonComplete(lesson.id)}
                            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                              done
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            {done ? (
                              <>
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                Completed
                              </>
                            ) : (
                              <>
                                <Circle className="h-4 w-4 text-slate-400" />
                                Mark Complete
                              </>
                            )}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                          <div className="lg:col-span-6 space-y-3">
                            <p className="text-xs font-semibold text-slate-700">
                              Step-by-Step Guide
                            </p>
                            <ol className="space-y-2 text-sm text-slate-700 list-decimal pl-5">
                              {lesson.steps.map((step, i) => (
                                <li key={i}>{step}</li>
                              ))}
                            </ol>
                            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3.5">
                              <p className="text-xs font-semibold text-slate-800">
                                Practical Example
                              </p>
                              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                                {lesson.practicalExample}
                              </p>
                            </div>
                          </div>

                          {lesson.codeExample && (
                            <div className="lg:col-span-6 rounded-xl bg-[#0B1221] text-slate-100 overflow-hidden border border-slate-800">
                              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 text-xs text-slate-400">
                                <span className="inline-flex items-center gap-1.5 font-mono">
                                  <Code2 className="h-3.5 w-3.5 text-blue-400" />
                                  {lesson.codeExample.language}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    copyCode(lesson.id, lesson.codeExample?.code || '')
                                  }
                                  className="inline-flex items-center gap-1 text-slate-300 hover:text-white"
                                >
                                  {copiedId === lesson.id ? (
                                    <>
                                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                                      Copied
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3.5 w-3.5" />
                                      Copy
                                    </>
                                  )}
                                </button>
                              </div>
                              <pre className="p-4 text-xs font-mono overflow-x-auto leading-relaxed">
                                <code>{lesson.codeExample.code}</code>
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Tab 2: Roadmap */}
        {activeTab === 'roadmap' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {skill.roadmapPhases.map((phase) => (
              <div
                key={phase.phase}
                className="rounded-xl border border-slate-200 bg-white p-6 space-y-3"
              >
                <p className="font-mono text-xs font-semibold text-blue-700">{phase.phase}</p>
                <h3 className="text-lg font-bold text-[#0B1221]">{phase.title}</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  {phase.milestones.map((ms) => (
                    <li key={ms} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                      <span>{ms}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Mini-Projects & Practice Questions */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {skill.miniProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="rounded-xl border border-slate-200 bg-white p-6 space-y-3"
                >
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <FolderGit2 className="h-4 w-4 text-violet-700" />
                    <span>{proj.difficulty} Mini-Project</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#0B1221]">{proj.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{proj.description}</p>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Deliverables</p>
                    <ul className="mt-1.5 space-y-1 text-xs text-slate-600 list-disc pl-4">
                      {proj.deliverables.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                  </div>
                  <p className="text-xs text-slate-500 pt-1">
                    Skills practiced: {proj.skillsPracticed.join(' · ')}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
              <h3 className="text-base font-bold text-[#0B1221]">
                Practice Exercises & Self-Check Prompts
              </h3>
              <ul className="space-y-2.5 text-sm text-slate-700 list-disc pl-5">
                {skill.practicePrompts.map((prompt) => (
                  <li key={prompt}>{prompt}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Tab 4: External Resources */}
        {activeTab === 'resources' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skill.resources.map((res) => (
              <a
                key={res.url}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-slate-200 bg-white p-5 hover:border-blue-400 transition-colors flex items-start justify-between gap-4"
              >
                <div>
                  <p className="text-xs font-medium text-blue-700">
                    {res.type} · {res.provider}
                  </p>
                  <h3 className="mt-1 text-sm font-semibold text-[#0B1221]">{res.title}</h3>
                </div>
                {res.type === 'Video' ? (
                  <PlayCircle className="h-5 w-5 text-slate-400 shrink-0" />
                ) : (
                  <ExternalLink className="h-4 w-4 text-slate-400 shrink-0" />
                )}
              </a>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
