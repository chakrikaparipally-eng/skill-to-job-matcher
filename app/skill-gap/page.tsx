'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Target,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Plus,
  X,
  ExternalLink,
  Calendar,
  AlertCircle,
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
import { TARGET_ROLE_BENCHMARKS } from '@/lib/curriculum';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  saveSkillGapReport,
  upsertLearningProgress,
  getUserSkillGapReports,
} from '@/lib/firestore-service';
import { MissingSkillPlan, RoadmapWeekItem, SkillGapReport } from '@/lib/types';

interface GapAnalysisOutput {
  targetRole: string;
  matchedSkills: string[];
  missingSkills: string[];
  uncertainSkills: string[];
  additionalSkills: string[];
  matchPercentage: number;
  matchFormulaNote: string;
  missingSkillPlans: MissingSkillPlan[];
  personalizedRoadmap: RoadmapWeekItem[];
}

export default function SkillGapPage() {
  const { firebaseUser, candidateProfile } = useAuth();
  const profileKey = candidateProfile
    ? `${candidateProfile.uid}_${candidateProfile.skills.join('|')}_${candidateProfile.targetRole || ''}`
    : 'anonymous';

  return (
    <SkillGapWorkspace
      key={profileKey}
      firebaseUser={firebaseUser}
      initialSkills={candidateProfile?.skills || []}
      initialTargetRole={candidateProfile?.targetRole || TARGET_ROLE_BENCHMARKS[0].role}
    />
  );
}

function SkillGapWorkspace({
  firebaseUser,
  initialSkills,
  initialTargetRole,
}: {
  firebaseUser: ReturnType<typeof useAuth>['firebaseUser'];
  initialSkills: string[];
  initialTargetRole: string;
}) {
  const [candidateSkills, setCandidateSkills] = useState<string[]>(initialSkills);
  const [confirmedSkills, setConfirmedSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  const [targetRole, setTargetRole] = useState(initialTargetRole);
  const [jobDescription, setJobDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [result, setResult] = useState<GapAnalysisOutput | null>(null);
  const [savedReports, setSavedReports] = useState<SkillGapReport[]>([]);

  useEffect(() => {
    if (!firebaseUser || !firebaseUser.emailVerified) return;
    getUserSkillGapReports(firebaseUser.uid).then(setSavedReports);
  }, [firebaseUser]);

  const selectedBenchmark = TARGET_ROLE_BENCHMARKS.find((b) => b.role === targetRole);

  const addManualSkill = () => {
    const val = skillInput.trim();
    if (!val) return;
    setCandidateSkills((prev) => Array.from(new Set([...prev, val])));
    setSkillInput('');
  };

  const runAnalysis = async (overrideConfirmed?: string[]) => {
    setError(null);
    setNotice(null);
    setAnalyzing(true);
    try {
      const res = await fetch('/api/skill-gap/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateSkills,
          confirmedSkills: overrideConfirmed ?? confirmedSkills,
          targetRole,
          jobDescription,
          requiredSkills: selectedBenchmark?.requiredSkills || [],
          preferredSkills: selectedBenchmark?.preferredSkills || [],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to compute skill gap.');
      setResult(data);

      if (firebaseUser && firebaseUser.emailVerified) {
        await saveSkillGapReport({
          uid: firebaseUser.uid,
          targetRole: data.targetRole,
          matchedSkills: data.matchedSkills,
          missingSkills: data.missingSkills,
          uncertainSkills: data.uncertainSkills,
          additionalSkills: data.additionalSkills,
          matchPercentage: data.matchPercentage,
          missingSkillPlans: data.missingSkillPlans,
        });
        const updated = await getUserSkillGapReports(firebaseUser.uid);
        setSavedReports(updated);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Skill gap analysis failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  const confirmUncertainSkill = async (skill: string) => {
    const updatedConfirmed = Array.from(new Set([...confirmedSkills, skill]));
    setConfirmedSkills(updatedConfirmed);
    setCandidateSkills((prev) => Array.from(new Set([...prev, skill])));
    await runAnalysis(updatedConfirmed);
  };

  const sendRoadmapToLearningPlan = async () => {
    if (!result || !firebaseUser || !firebaseUser.emailVerified) {
      setError('Sign in with a verified email to save your personalized roadmap.');
      return;
    }
    await upsertLearningProgress(firebaseUser.uid, 'custom_improvement_plan', {
      targetRole: result.targetRole,
      customRoadmap: result.personalizedRoadmap,
      completedLessonIds: [],
      completionPercentage: 0,
      badgeEarned: false,
    });
    setNotice('Personalized improvement roadmap saved to My Learning Plan.');
  };

  const chartData = result
    ? [
        { category: 'Matched', count: result.matchedSkills.length },
        { category: 'Missing', count: result.missingSkills.length },
        { category: 'Needs Confirm', count: result.uncertainSkills.length },
        { category: 'Additional', count: result.additionalSkills.length },
      ]
    : [];

  return (
    <AppShell
      title="AI Skill Gap Analyzer"
      subtitle="Compare your resume and confirmed skills against target role or job description requirements"
    >
      <div className="space-y-6">
        {/* Input Builder */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Target Job Role
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                >
                  {TARGET_ROLE_BENCHMARKS.map((b) => (
                    <option key={b.role} value={b.role}>
                      {b.role}
                    </option>
                  ))}
                </select>
                {selectedBenchmark && (
                  <p className="mt-1.5 text-xs text-slate-500">
                    Benchmark required skills: {selectedBenchmark.requiredSkills.join(', ')}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Optional Custom Job Description (Paste any real JD to override/refine)
                </label>
                <textarea
                  rows={4}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste job requirements here to analyze exact required & preferred skills..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-700">
                  Your Evidenced & Manually Added Skills ({candidateSkills.length})
                </label>
                <Link href="/resume-analyzer" className="text-xs font-semibold text-blue-700 hover:underline">
                  Import from Resume
                </Link>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addManualSkill())}
                  placeholder="Add skill (e.g. Python, NumPy, Pandas, SQL)..."
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addManualSkill}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </button>
              </div>

              <div className="min-h-[100px] rounded-lg border border-slate-200 bg-slate-50 p-3 flex flex-wrap gap-2 content-start">
                {candidateSkills.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    No skills added yet. Upload a resume or type skills above (e.g., Python, NumPy, Pandas, SQL, Matplotlib).
                  </p>
                ) : (
                  candidateSkills.map((sk) => (
                    <span
                      key={sk}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-800"
                    >
                      {sk}
                      <button
                        type="button"
                        onClick={() =>
                          setCandidateSkills((prev) => prev.filter((item) => item !== sk))
                        }
                        aria-label={`Remove ${sk}`}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              <button
                type="button"
                disabled={analyzing}
                onClick={() => runAnalysis()}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                <Target className="h-4 w-4" />
                {analyzing ? 'Calculating Skill Gap...' : 'Run Skill Gap Analysis'}
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

        {/* Analysis Output */}
        {result && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-6 space-y-4">
                <p className="text-xs font-medium text-slate-500">
                  Role Readiness · {result.targetRole}
                </p>
                <p className="text-4xl font-bold text-[#0B1221] tabular-nums">
                  {result.matchPercentage}%
                  <span className="text-sm font-medium text-slate-500 ml-2">Match</span>
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">{result.matchFormulaNote}</p>

                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#6D28D9" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <button
                  type="button"
                  onClick={sendRoadmapToLearningPlan}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#0B1221] px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  <Calendar className="h-4 w-4" />
                  Save Roadmap to My Learning Plan
                </button>
              </div>

              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2.5">
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
                    <CheckCircle2 className="h-4 w-4" />
                    1. Matched Skills ({result.matchedSkills.length})
                  </div>
                  <p className="text-xs text-slate-500">
                    Already demonstrated in your resume or confirmed skills.
                  </p>
                  <ul className="space-y-1 text-xs text-slate-800 pt-1">
                    {result.matchedSkills.length > 0 ? (
                      result.matchedSkills.map((s) => <li key={s}>· {s}</li>)
                    ) : (
                      <li className="text-slate-400">No direct matches yet</li>
                    )}
                  </ul>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2.5">
                  <div className="flex items-center gap-2 text-rose-700 font-semibold text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    2. Missing Skills ({result.missingSkills.length})
                  </div>
                  <p className="text-xs text-slate-500">
                    Required by the target role and not yet evidenced.
                  </p>
                  <ul className="space-y-1 text-xs text-slate-800 pt-1">
                    {result.missingSkills.length > 0 ? (
                      result.missingSkills.map((s) => <li key={s}>· {s}</li>)
                    ) : (
                      <li className="text-emerald-700">Zero missing skills!</li>
                    )}
                  </ul>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2.5">
                  <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm">
                    <HelpCircle className="h-4 w-4" />
                    Needs Confirmation ({result.uncertainSkills.length})
                  </div>
                  <p className="text-xs text-slate-500">
                    Unmentioned skills adjacent to your stack—confirm if you already know them.
                  </p>
                  <div className="space-y-2 pt-1">
                    {result.uncertainSkills.length > 0 ? (
                      result.uncertainSkills.map((s) => (
                        <div key={s} className="flex items-center justify-between gap-2 text-xs">
                          <span className="text-slate-800">{s}</span>
                          <button
                            type="button"
                            onClick={() => confirmUncertainSkill(s)}
                            className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 font-semibold text-blue-700 hover:bg-blue-100"
                          >
                            Confirm I Know
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400">No ambiguous skills detected</p>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2.5">
                  <div className="flex items-center gap-2 text-blue-700 font-semibold text-sm">
                    <Plus className="h-4 w-4" />
                    3. Additional Skills ({result.additionalSkills.length})
                  </div>
                  <p className="text-xs text-slate-500">
                    Valuable capabilities you hold beyond the role baseline.
                  </p>
                  <ul className="space-y-1 text-xs text-slate-800 pt-1">
                    {result.additionalSkills.length > 0 ? (
                      result.additionalSkills.map((s) => <li key={s}>· {s}</li>)
                    ) : (
                      <li className="text-slate-400">None beyond core requirements</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Detailed Missing Skill Plans */}
            {result.missingSkillPlans.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-[#0B1221]">
                  Missing Skill Learning Plans & Free Resources
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {result.missingSkillPlans.map((plan) => (
                    <div
                      key={plan.skill}
                      className="rounded-xl border border-slate-200 bg-white p-6 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base font-bold text-[#0B1221]">{plan.skill}</h3>
                        <span className="text-xs font-mono text-blue-700">
                          Est. {plan.estimatedLearningTime}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{plan.whyRequired}</p>

                      <div>
                        <p className="text-xs font-semibold text-slate-800">Beginner Roadmap</p>
                        <ol className="mt-1 space-y-1 text-xs text-slate-600 list-decimal pl-4">
                          {(plan.roadmapSteps || []).map((st, idx) => (
                            <li key={idx}>{st}</li>
                          ))}
                        </ol>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-slate-800">Practice & Mini-Project</p>
                        <p className="mt-1 text-xs text-slate-600">{plan.miniProjectSuggestion}</p>
                      </div>

                      {(plan.freeResources || []).length > 0 && (
                        <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-3">
                          {plan.freeResources.map((r) => (
                            <a
                              key={r.url}
                              href={r.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline"
                            >
                              {r.title}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Saved Gap Reports */}
        {savedReports.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
            <h2 className="text-base font-bold text-[#0B1221]">Recent Skill Gap Reports</h2>
            <div className="divide-y divide-slate-100 text-xs">
              {savedReports.slice(0, 5).map((r) => (
                <div key={r.id} className="py-2.5 flex items-center justify-between gap-4">
                  <span className="font-semibold text-slate-900">{r.targetRole}</span>
                  <span className="text-slate-500">
                    Matched {r.matchedSkills.length} · Missing {r.missingSkills.length} ·{' '}
                    <strong className="text-blue-700 tabular-nums">{r.matchPercentage}%</strong>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
