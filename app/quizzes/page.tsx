'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
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
import { ALL_SKILLS } from '@/lib/curriculum';
import { useAuth } from '@/components/providers/AuthProvider';
import { getUserQuizResults, saveQuizResult } from '@/lib/firestore-service';
import { DifficultyLevel, QuizQuestion, QuizResult } from '@/lib/types';
import { apiUrl, safeParseJsonResponse } from '@/lib/safe-api';

function QuizEngineContent() {
  const searchParams = useSearchParams();
  const { firebaseUser } = useAuth();

  const initialSkill = searchParams.get('skill') || ALL_SKILLS[0].id;
  const [selectedSkillId, setSelectedSkillId] = useState(initialSkill);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('beginner');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [quizActive, setQuizActive] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(300);
  const [initialSeconds, setInitialSeconds] = useState(300);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [history, setHistory] = useState<QuizResult[]>([]);
  const [savingResult, setSavingResult] = useState(false);

  const selectedSkill =
    ALL_SKILLS.find((s) => s.id === selectedSkillId) || ALL_SKILLS[0];

  useEffect(() => {
    if (!firebaseUser || !firebaseUser.emailVerified) return;
    getUserQuizResults(firebaseUser.uid).then(setHistory);
  }, [firebaseUser]);

  const handleSubmitQuiz = React.useCallback(async () => {
    if (submitted || questions.length === 0) return;
    setSubmitted(true);
    setQuizActive(false);

    let correct = 0;
    const topicStats: Record<string, { right: number; total: number }> = {};

    for (const q of questions) {
      const chosen = answers[q.id];
      const isRight = chosen === q.correctIndex;
      if (isRight) correct += 1;
      if (!topicStats[q.topic]) topicStats[q.topic] = { right: 0, total: 0 };
      topicStats[q.topic].total += 1;
      if (isRight) topicStats[q.topic].right += 1;
    }

    const total = questions.length;
    const incorrect = total - correct;
    const pct = Math.round((correct / total) * 100);
    const strongTopics = Object.entries(topicStats)
      .filter(([, st]) => st.right / st.total >= 0.7)
      .map(([t]) => t);
    const weakTopics = Object.entries(topicStats)
      .filter(([, st]) => st.right / st.total < 0.7)
      .map(([t]) => t);
    const recommendedTopics =
      weakTopics.length > 0 ? weakTopics : [selectedSkill.title];

    if (firebaseUser && firebaseUser.emailVerified) {
      setSavingResult(true);
      try {
        await saveQuizResult({
          uid: firebaseUser.uid,
          skillId: selectedSkill.id,
          skillTitle: selectedSkill.title,
          quizId: `${selectedSkill.id}_${difficulty}`,
          difficulty,
          totalQuestions: total,
          correctAnswers: correct,
          incorrectAnswers: incorrect,
          percentage: pct,
          strongTopics,
          weakTopics,
          recommendedTopics,
          timeSpentSeconds: Math.max(0, initialSeconds - secondsLeft),
        });
        const updated = await getUserQuizResults(firebaseUser.uid);
        setHistory(updated);
      } finally {
        setSavingResult(false);
      }
    }
  }, [
    submitted,
    questions,
    answers,
    selectedSkill.id,
    selectedSkill.title,
    difficulty,
    firebaseUser,
    initialSeconds,
    secondsLeft,
  ]);

  useEffect(() => {
    if (!quizActive || submitted) return;
    if (secondsLeft <= 0) {
      const timeoutId = setTimeout(() => {
        void handleSubmitQuiz();
      }, 0);
      return () => clearTimeout(timeoutId);
    }
    const timer = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [quizActive, submitted, secondsLeft, handleSubmitQuiz]);

  const startBuiltInQuiz = () => {
    setGenError(null);
    const matching = selectedSkill.quizQuestions.filter(
      (q) => q.difficulty === difficulty
    );
    const pool =
      matching.length >= 2 ? matching : selectedSkill.quizQuestions;
    const duration = Math.max(120, pool.length * 60);
    setQuestions(pool);
    setAnswers({});
    setSubmitted(false);
    setSecondsLeft(duration);
    setInitialSeconds(duration);
    setQuizActive(true);
  };

  const generateWithGemini = async () => {
    setGenError(null);
    setGenerating(true);
    try {
      const res = await fetch(apiUrl('/api/quiz/generate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillId: selectedSkill.id,
          skillTitle: selectedSkill.title,
          difficulty,
          count: 5,
        }),
      });
      const parsed = await safeParseJsonResponse<{ questions?: QuizQuestion[] }>(res);
      if (!parsed.ok || !parsed.data) {
        throw new Error(parsed.error || 'Failed to generate quiz questions.');
      }
      const pool: QuizQuestion[] = parsed.data.questions || [];
      const duration = Math.max(180, pool.length * 60);
      setQuestions(pool);
      setAnswers({});
      setSubmitted(false);
      setSecondsLeft(duration);
      setInitialSeconds(duration);
      setQuizActive(true);
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Quiz generation failed.');
    } finally {
      setGenerating(false);
    }
  };

  const formatClock = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Evaluate current results for display
  const evalSummary = (() => {
    if (!submitted || questions.length === 0) return null;
    let correct = 0;
    const topicStats: Record<string, { right: number; total: number }> = {};
    for (const q of questions) {
      const isRight = answers[q.id] === q.correctIndex;
      if (isRight) correct += 1;
      if (!topicStats[q.topic]) topicStats[q.topic] = { right: 0, total: 0 };
      topicStats[q.topic].total += 1;
      if (isRight) topicStats[q.topic].right += 1;
    }
    const strong = Object.entries(topicStats)
      .filter(([, st]) => st.right / st.total >= 0.7)
      .map(([t]) => t);
    const weak = Object.entries(topicStats)
      .filter(([, st]) => st.right / st.total < 0.7)
      .map(([t]) => t);
    return {
      total: questions.length,
      correct,
      incorrect: questions.length - correct,
      percentage: Math.round((correct / questions.length) * 100),
      strong,
      weak,
      recommended: weak.length > 0 ? weak : ['Continue to next difficulty tier'],
    };
  })();

  // Aggregate skill-wise averages for Recharts
  const skillChartData = ALL_SKILLS.map((sk) => {
    const attempts = history.filter((h) => h.skillId === sk.id);
    const avg =
      attempts.length > 0
        ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length)
        : 0;
    return {
      name: sk.title.split(' ')[0],
      score: avg,
      attempts: attempts.length,
    };
  }).filter((d) => d.attempts > 0);

  return (
    <AppShell
      title="Practice & Skill Assessments"
      subtitle="Timed technical, coding, MCQ, and true/false assessments with Gemini question generation"
    >
      <div className="space-y-6">
        {/* Quiz Launcher Controls */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Technical Skill Track
              </label>
              <select
                value={selectedSkillId}
                onChange={(e) => setSelectedSkillId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                {ALL_SKILLS.map((sk) => (
                  <option key={sk.id} value={sk.id}>
                    {sk.number}. {sk.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Difficulty Tier
              </label>
              <div className="grid grid-cols-3 gap-1.5 rounded-lg bg-slate-100 p-1">
                {(['beginner', 'intermediate', 'advanced'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDifficulty(lvl)}
                    className={`rounded-md py-1.5 text-xs font-semibold capitalize transition-colors ${
                      difficulty === lvl ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={startBuiltInQuiz}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[#0B1221] px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
              >
                <Play className="h-3.5 w-3.5" />
                Start Core Quiz
              </button>
              <button
                type="button"
                disabled={generating}
                onClick={generateWithGemini}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {generating ? 'Generating...' : 'AI Question Set'}
              </button>
            </div>
          </div>

          {genError && (
            <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{genError}</span>
            </div>
          )}
        </div>

        {/* Active Quiz / Evaluated Results */}
        {questions.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-blue-700 capitalize">
                  {selectedSkill.title} · {difficulty} Assessment
                </p>
                <p className="text-xs text-slate-500 tabular-nums mt-0.5">
                  {Object.keys(answers).length} of {questions.length} answered
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-mono font-semibold tabular-nums ${
                    secondsLeft <= 30 && quizActive
                      ? 'border-rose-300 bg-rose-50 text-rose-700'
                      : 'border-slate-200 bg-white text-slate-800'
                  }`}
                >
                  <Clock className="h-3.5 w-3.5" />
                  {formatClock(secondsLeft)}
                </div>
                {!submitted ? (
                  <button
                    type="button"
                    onClick={handleSubmitQuiz}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    Submit Assessment
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startBuiltInQuiz}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Retake
                  </button>
                )}
              </div>
            </div>

            {evalSummary && (
              <div className="border-b border-slate-200 bg-[#F8FAFC] p-6 space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <p className="text-xs text-slate-500">Total Questions</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900 tabular-nums">
                      {evalSummary.total}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <p className="text-xs text-slate-500">Correct Answers</p>
                    <p className="mt-1 text-2xl font-bold text-emerald-700 tabular-nums">
                      {evalSummary.correct}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <p className="text-xs text-slate-500">Incorrect</p>
                    <p className="mt-1 text-2xl font-bold text-rose-700 tabular-nums">
                      {evalSummary.incorrect}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <p className="text-xs text-slate-500">Final Score</p>
                    <p className="mt-1 text-2xl font-bold text-blue-700 tabular-nums">
                      {evalSummary.percentage}%
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <p className="font-semibold text-emerald-800">Strong Topics</p>
                    <p className="mt-1.5 text-slate-600">
                      {evalSummary.strong.length > 0 ? evalSummary.strong.join(', ') : 'None yet'}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <p className="font-semibold text-rose-800">Weak Topics</p>
                    <p className="mt-1.5 text-slate-600">
                      {evalSummary.weak.length > 0 ? evalSummary.weak.join(', ') : 'None flagged'}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <p className="font-semibold text-blue-800">Recommended to Revise</p>
                    <p className="mt-1.5 text-slate-600">{evalSummary.recommended.join(', ')}</p>
                  </div>
                </div>
                {savingResult && (
                  <p className="text-xs text-slate-500">Saving attempt to Firestore...</p>
                )}
              </div>
            )}

            <div className="divide-y divide-slate-200">
              {questions.map((q, idx) => {
                const chosen = answers[q.id];
                const isCorrect = chosen === q.correctIndex;
                return (
                  <div key={q.id} className="p-6 space-y-3">
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                      <span>
                        Question {idx + 1} · {q.topic} ·{' '}
                        <span className="uppercase font-mono">{q.kind.replace('_', '/')}</span>
                      </span>
                      {submitted && (
                        <span
                          className={`inline-flex items-center gap-1 font-semibold ${
                            isCorrect ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {isCorrect ? (
                            <>
                              <CheckCircle2 className="h-4 w-4" /> Correct
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4" /> Incorrect
                            </>
                          )}
                        </span>
                      )}
                    </div>

                    <p className="text-sm sm:text-base font-medium text-slate-900">{q.prompt}</p>

                    {q.codeSnippet && (
                      <pre className="rounded-lg bg-[#0B1221] p-4 text-xs font-mono text-slate-100 overflow-x-auto">
                        <code>{q.codeSnippet}</code>
                      </pre>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {q.options.map((opt, optIdx) => {
                        const selected = chosen === optIdx;
                        const isAnswer = q.correctIndex === optIdx;
                        let style =
                          'border-slate-200 bg-white text-slate-800 hover:bg-slate-50';
                        if (submitted) {
                          if (isAnswer) {
                            style = 'border-emerald-500 bg-emerald-50 text-emerald-950';
                          } else if (selected && !isAnswer) {
                            style = 'border-rose-400 bg-rose-50 text-rose-950';
                          }
                        } else if (selected) {
                          style = 'border-blue-600 bg-blue-50 text-blue-950';
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            disabled={submitted}
                            onClick={() =>
                              setAnswers((prev) => ({ ...prev, [q.id]: optIdx }))
                            }
                            className={`rounded-lg border px-4 py-2.5 text-left text-sm transition-colors ${style}`}
                          >
                            <span className="font-mono text-xs mr-2 text-slate-400">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {submitted && (
                      <div className="rounded-lg bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-700 leading-relaxed">
                        <strong>Explanation:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Skill-Wise Performance Chart & Previous Attempts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-base font-bold text-[#0B1221]">
              Skill-Wise Assessment Performance
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Average percentage across saved Firestore quiz attempts
            </p>
            {skillChartData.length === 0 ? (
              <div className="mt-6 rounded-lg border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500">
                Complete a quiz while signed in to visualize your skill performance chart.
              </div>
            ) : (
              <div className="mt-4 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={skillChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#475569' }} />
                    <Tooltip />
                    <Bar dataKey="score" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-base font-bold text-[#0B1221]">Previous Attempts</h2>
            <p className="mt-1 text-xs text-slate-500">
              Stored securely in your Firestore quizResults history
            </p>
            {history.length === 0 ? (
              <div className="mt-6 rounded-lg border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500">
                No previous quiz attempts recorded yet.
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="py-2 pr-3 font-medium">Skill</th>
                      <th className="py-2 pr-3 font-medium">Level</th>
                      <th className="py-2 pr-3 font-medium text-right">Score</th>
                      <th className="py-2 font-medium text-right">Correct</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {history.slice(0, 8).map((item) => (
                      <tr key={item.id}>
                        <td className="py-2.5 pr-3 font-medium text-slate-900">
                          {item.skillTitle}
                        </td>
                        <td className="py-2.5 pr-3 capitalize text-slate-600">
                          {item.difficulty}
                        </td>
                        <td className="py-2.5 pr-3 text-right font-mono font-semibold text-blue-700 tabular-nums">
                          {item.percentage}%
                        </td>
                        <td className="py-2.5 text-right font-mono text-slate-600 tabular-nums">
                          {item.correctAnswers}/{item.totalQuestions}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function QuizzesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC]" />}>
      <QuizEngineContent />
    </Suspense>
  );
}
