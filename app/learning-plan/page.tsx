'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  CheckCircle2,
  Circle,
  Plus,
  Calendar,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { ProtectedGate } from '@/components/common/ProtectedGate';
import { useAuth } from '@/components/providers/AuthProvider';
import { TARGET_ROLE_BENCHMARKS } from '@/lib/curriculum';
import {
  getUserLearningProgress,
  getUserQuizResults,
  getUserSkillGapReports,
  upsertLearningProgress,
} from '@/lib/firestore-service';
import { DailyActivityItem, RoadmapWeekItem, WeeklyGoalItem } from '@/lib/types';
import { apiUrl, safeParseJsonResponse } from '@/lib/safe-api';

export default function LearningPlanPage() {
  const { firebaseUser, candidateProfile } = useAuth();

  const [targetRole, setTargetRole] = useState(TARGET_ROLE_BENCHMARKS[0].role);
  const [weeksCount, setWeeksCount] = useState(8);
  const [roadmap, setRoadmap] = useState<RoadmapWeekItem[]>([]);
  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoalItem[]>([]);
  const [dailyActivities, setDailyActivities] = useState<DailyActivityItem[]>([]);

  const [goalInput, setGoalInput] = useState('');
  const [activityInput, setActivityInput] = useState('');
  const [activityMinutes, setActivityMinutes] = useState(45);

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseUser || !firebaseUser.emailVerified) return;
    let active = true;

    getUserLearningProgress(firebaseUser.uid).then((items) => {
      if (!active) return;
      const plan = items.find((i) => i.skillId === 'custom_improvement_plan');
      if (plan) {
        if (plan.targetRole) {
          setTargetRole(plan.targetRole);
        } else if (candidateProfile?.targetRole) {
          setTargetRole(candidateProfile.targetRole);
        }
        setRoadmap(plan.customRoadmap || []);
        setWeeklyGoals(plan.weeklyGoals || []);
        setDailyActivities(plan.dailyActivities || []);
      } else if (candidateProfile?.targetRole) {
        setTargetRole(candidateProfile.targetRole);
      }
    });

    return () => {
      active = false;
    };
  }, [firebaseUser, candidateProfile]);

  const persistPlan = async (
    nextRoadmap: RoadmapWeekItem[],
    nextGoals: WeeklyGoalItem[],
    nextActivities: DailyActivityItem[],
    roleStr: string
  ) => {
    if (!firebaseUser) return;
    const completedCount = nextRoadmap.filter((w) => w.completed).length;
    const pct =
      nextRoadmap.length > 0 ? Math.round((completedCount / nextRoadmap.length) * 100) : 0;

    await upsertLearningProgress(firebaseUser.uid, 'custom_improvement_plan', {
      targetRole: roleStr,
      customRoadmap: nextRoadmap,
      weeklyGoals: nextGoals,
      dailyActivities: nextActivities,
      completedLessonIds: nextRoadmap.filter((w) => w.completed).map((w) => `week_${w.week}`),
      completionPercentage: pct,
      badgeEarned: pct === 100 && nextRoadmap.length > 0,
    });
  };

  const handleGenerateRoadmap = async () => {
    if (!firebaseUser) return;
    setGenerating(true);
    setError(null);
    setNotice(null);

    try {
      const [quizResults, gapReports] = await Promise.all([
        getUserQuizResults(firebaseUser.uid),
        getUserSkillGapReports(firebaseUser.uid),
      ]);

      const weakTopics = Array.from(new Set(quizResults.flatMap((q) => q.weakTopics || [])));
      const missingSkills = gapReports[0]?.missingSkills || [];

      const res = await fetch(apiUrl('/api/roadmap/generate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole,
          currentSkills: candidateProfile?.skills || [],
          missingSkills,
          weakTopics,
          weeksCount,
        }),
      });
      const parsed = await safeParseJsonResponse<{ roadmap?: RoadmapWeekItem[] }>(res);
      if (!parsed.ok || !parsed.data) {
        throw new Error(parsed.error || 'Failed to generate improvement plan.');
      }

      const newRoadmap: RoadmapWeekItem[] = parsed.data.roadmap || [];
      setRoadmap(newRoadmap);
      await persistPlan(newRoadmap, weeklyGoals, dailyActivities, targetRole);
      setNotice('Personalized improvement roadmap generated and saved to Firestore.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Roadmap generation failed.');
    } finally {
      setGenerating(false);
    }
  };

  const toggleWeek = async (weekNum: number) => {
    const next = roadmap.map((w) =>
      w.week === weekNum ? { ...w, completed: !w.completed } : w
    );
    setRoadmap(next);
    await persistPlan(next, weeklyGoals, dailyActivities, targetRole);
  };

  const addWeeklyGoal = async () => {
    if (!goalInput.trim()) return;
    const next = [
      ...weeklyGoals,
      {
        id: `g_${Date.now()}`,
        weekLabel: `Week ${weeklyGoals.length + 1}`,
        title: goalInput.trim(),
        completed: false,
      },
    ];
    setWeeklyGoals(next);
    setGoalInput('');
    await persistPlan(roadmap, next, dailyActivities, targetRole);
  };

  const toggleGoal = async (id: string) => {
    const next = weeklyGoals.map((g) =>
      g.id === id ? { ...g, completed: !g.completed } : g
    );
    setWeeklyGoals(next);
    await persistPlan(roadmap, next, dailyActivities, targetRole);
  };

  const logDailyActivity = async () => {
    if (!activityInput.trim()) return;
    const next = [
      {
        id: `act_${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        activity: activityInput.trim(),
        minutesSpent: Math.max(5, activityMinutes),
      },
      ...dailyActivities,
    ].slice(0, 50);
    setDailyActivities(next);
    setActivityInput('');
    await persistPlan(roadmap, weeklyGoals, next, targetRole);
  };

  const completedWeeks = roadmap.filter((w) => w.completed).length;
  const planPct = roadmap.length > 0 ? Math.round((completedWeeks / roadmap.length) * 100) : 0;

  return (
    <AppShell
      title="My Improvement Plan"
      subtitle="Personalized learning roadmap adapted to your resume skills, target role, and assessment results"
    >
      <ProtectedGate>
        <div className="space-y-6">
          {/* Generator Bar */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-5">
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Target Role
                </label>
                <input
                  type="text"
                  list="target-roles"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                />
                <datalist id="target-roles">
                  {TARGET_ROLE_BENCHMARKS.map((b) => (
                    <option key={b.role} value={b.role} />
                  ))}
                </datalist>
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Plan Duration
                </label>
                <select
                  value={weeksCount}
                  onChange={(e) => setWeeksCount(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                >
                  <option value={4}>4 Weeks</option>
                  <option value={6}>6 Weeks</option>
                  <option value={8}>8 Weeks</option>
                  <option value={12}>12 Weeks</option>
                </select>
              </div>

              <div className="md:col-span-4">
                <button
                  type="button"
                  disabled={generating}
                  onClick={handleGenerateRoadmap}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  <Sparkles className="h-4 w-4" />
                  {generating ? 'Building Plan...' : 'Generate / Update Plan with Gemini'}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {notice && (
              <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{notice}</span>
              </div>
            )}
          </div>

          {/* Completion Summary */}
          {roadmap.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">Roadmap Progress · {targetRole}</p>
                  <p className="mt-1 text-2xl font-bold text-[#0B1221] tabular-nums">
                    {planPct}% Completed ({completedWeeks}/{roadmap.length} weeks)
                  </p>
                </div>
                <Link
                  href="/quizzes"
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Take Assessment
                </Link>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full bg-blue-600 transition-all"
                  style={{ width: `${planPct}%` }}
                />
              </div>
            </div>
          )}

          {/* Weekly Roadmap Cards */}
          {roadmap.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center space-y-3">
              <Calendar className="mx-auto h-8 w-8 text-slate-400" />
              <h2 className="text-base font-semibold text-slate-900">
                No personalized roadmap saved yet
              </h2>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Click Generate / Update Plan above to create a custom week-by-week plan grounded in your resume skills, missing gaps, and quiz performance.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roadmap.map((week) => (
                <div
                  key={week.week}
                  className={`rounded-xl border p-5 space-y-3 ${
                    week.completed
                      ? 'border-emerald-200 bg-emerald-50/40'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs font-semibold text-blue-700">
                        Week {week.week}
                      </p>
                      <h3 className="mt-0.5 text-base font-bold text-[#0B1221]">{week.title}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleWeek(week.week)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                        week.completed
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {week.completed ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" /> Done
                        </>
                      ) : (
                        <>
                          <Circle className="h-3.5 w-3.5" /> Complete
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-slate-500">
                    Focus: {week.focusSkills.join(' · ')}
                  </p>
                  <ul className="space-y-1 text-xs text-slate-700 list-disc pl-4">
                    {week.tasks.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                  {week.milestone && (
                    <p className="text-xs font-medium text-slate-800 border-t border-slate-100 pt-2">
                      Milestone: {week.milestone}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Weekly Goals & Daily Activity Log */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
              <h2 className="text-base font-bold text-[#0B1221]">Weekly Goals</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  placeholder="Set a weekly goal (e.g. Finish 3 Scikit-learn lessons)"
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
                />
                <button
                  type="button"
                  onClick={addWeeklyGoal}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#0B1221] px-3.5 py-2 text-xs font-semibold text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {weeklyGoals.length === 0 ? (
                  <p className="text-xs text-slate-500">No weekly goals added yet.</p>
                ) : (
                  weeklyGoals.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => toggleGoal(g.id)}
                      className="w-full flex items-center gap-2.5 rounded-lg border border-slate-200 px-3.5 py-2.5 text-left text-xs hover:bg-slate-50"
                    >
                      {g.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-slate-400 shrink-0" />
                      )}
                      <span className={g.completed ? 'line-through text-slate-400' : 'text-slate-800'}>
                        {g.title}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
              <h2 className="text-base font-bold text-[#0B1221]">Daily Learning Log</h2>
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  value={activityInput}
                  onChange={(e) => setActivityInput(e.target.value)}
                  placeholder="What did you practice today?"
                  className="flex-1 min-w-[180px] rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
                />
                <input
                  type="number"
                  min={5}
                  max={600}
                  value={activityMinutes}
                  onChange={(e) => setActivityMinutes(Number(e.target.value))}
                  className="w-20 rounded-lg border border-slate-300 px-2.5 py-2 text-xs text-slate-900 tabular-nums"
                />
                <button
                  type="button"
                  onClick={logDailyActivity}
                  className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white"
                >
                  Log
                </button>
              </div>
              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto text-xs">
                {dailyActivities.length === 0 ? (
                  <p className="text-slate-500 py-2">No daily sessions logged yet.</p>
                ) : (
                  dailyActivities.map((act) => (
                    <div key={act.id} className="py-2.5 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">{act.activity}</p>
                        <p className="text-slate-400 font-mono">{act.date}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 font-mono text-blue-700 tabular-nums shrink-0">
                        <Clock className="h-3 w-3" />
                        {act.minutesSpent}m
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </ProtectedGate>
    </AppShell>
  );
}
