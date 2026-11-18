'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, Award, BookOpen } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { ALL_SKILLS, getTotalLessonsForSkill } from '@/lib/curriculum';
import { useAuth } from '@/components/providers/AuthProvider';
import { getUserLearningProgress } from '@/lib/firestore-service';
import { LearningProgress } from '@/lib/types';

export default function ExploreSkillsPage() {
  const { firebaseUser } = useAuth();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [progressMap, setProgressMap] = useState<Record<string, LearningProgress>>({});

  useEffect(() => {
    if (!firebaseUser || !firebaseUser.emailVerified) return;
    getUserLearningProgress(firebaseUser.uid).then((items) => {
      const map: Record<string, LearningProgress> = {};
      for (const item of items) {
        map[item.skillId] = item;
      }
      setProgressMap(map);
    });
  }, [firebaseUser]);

  const categories = ['All', ...Array.from(new Set(ALL_SKILLS.map((s) => s.category)))];

  const filtered = ALL_SKILLS.filter((skill) => {
    const matchesCat = category === 'All' || skill.category === category;
    const q = search.trim().toLowerCase();
    const matchesQuery =
      !q ||
      skill.title.toLowerCase().includes(q) ||
      skill.tagline.toLowerCase().includes(q) ||
      skill.category.toLowerCase().includes(q) ||
      skill.modules.some((m) => m.title.toLowerCase().includes(q));
    return matchesCat && matchesQuery;
  });

  return (
    <AppShell
      title="Explore Technical Skills"
      subtitle="10 structured engineering domains with tutorials, code examples, mini-projects, and assessments"
    >
      <div className="space-y-6">
        {/* Search & Filters */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search skills, modules, or topics (e.g. Python, RAG, Docker)..."
                className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
            <p className="text-xs font-medium text-slate-500 tabular-nums">
              Showing {filtered.length} of {ALL_SKILLS.length} technical skills
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  category === cat
                    ? 'bg-[#0B1221] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Skills Grid */}
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <BookOpen className="mx-auto h-8 w-8 text-slate-400" />
            <h2 className="mt-3 text-base font-semibold text-slate-900">
              No matching skill tracks found
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Try clearing your search query or selecting All categories.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setCategory('All');
              }}
              className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map((skill) => {
              const totalLessons = getTotalLessonsForSkill(skill);
              const prog = progressMap[skill.id];
              const pct = prog?.completionPercentage ?? 0;

              return (
                <div
                  key={skill.id}
                  className="rounded-xl border border-slate-200 bg-white p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-blue-700 tabular-nums">
                          {skill.number}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{skill.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{totalLessons} lessons</span>
                      </div>
                      {prog?.badgeEarned && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                          <Award className="h-3.5 w-3.5" />
                          Certified
                        </span>
                      )}
                    </div>

                    <h2 className="mt-3 text-xl font-bold text-[#0B1221]">{skill.title}</h2>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">{skill.tagline}</p>

                    <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-xs text-slate-600">
                      <div>
                        <span className="block text-slate-400">Modules</span>
                        <span className="font-semibold text-slate-900 tabular-nums">
                          {skill.modules.length} Levels
                        </span>
                      </div>
                      <div>
                        <span className="block text-slate-400">Projects</span>
                        <span className="font-semibold text-slate-900 tabular-nums">
                          {skill.miniProjects.length} Hands-on
                        </span>
                      </div>
                      <div>
                        <span className="block text-slate-400">Completion</span>
                        <span className="font-semibold text-blue-700 tabular-nums">{pct}%</span>
                      </div>
                    </div>

                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full bg-blue-600 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3 pt-2">
                    <Link
                      href={`/skills/${skill.slug}`}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#0B1221] px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
                    >
                      Open Learning Track
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <Link
                      href={`/quizzes?skill=${skill.id}`}
                      className="text-xs font-semibold text-blue-700 hover:underline"
                    >
                      Take Assessment
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
