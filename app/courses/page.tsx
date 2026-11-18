'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Clock, ArrowRight, ExternalLink } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { ALL_SKILLS } from '@/lib/curriculum';

export default function CoursesPage() {
  const [levelFilter, setLevelFilter] = useState<'All' | 'Beginner' | 'Intermediate' | 'Advanced'>('All');
  const [skillFilter, setSkillFilter] = useState<string>('All');

  const courses = ALL_SKILLS.flatMap((skill) =>
    skill.modules.map((mod) => ({
      skillId: skill.id,
      skillSlug: skill.slug,
      skillTitle: skill.title,
      module: mod,
      resources: skill.resources,
    }))
  ).filter((item) => {
    const matchLevel = levelFilter === 'All' || item.module.level === levelFilter;
    const matchSkill = skillFilter === 'All' || item.skillId === skillFilter;
    return matchLevel && matchSkill;
  });

  return (
    <AppShell
      title="Tutorials & Courses"
      subtitle="Structured beginner-to-advanced course modules across all 10 engineering domains"
    >
      <div className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {(['All', 'Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setLevelFilter(lvl)}
                className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  levelFilter === lvl
                    ? 'bg-[#0B1221] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <select
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            aria-label="Filter courses by technical skill"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
          >
            <option value="All">All 10 Skills</option>
            {ALL_SKILLS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((c) => (
            <div
              key={c.module.id}
              className="rounded-xl border border-slate-200 bg-white p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-medium text-blue-700">{c.skillTitle}</span>
                  <span aria-hidden="true">·</span>
                  <span>{c.module.level}</span>
                </div>
                <h2 className="mt-2.5 text-lg font-bold text-[#0B1221]">{c.module.title}</h2>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{c.module.overview}</p>

                <div className="mt-4 flex items-center gap-4 text-xs text-slate-500 tabular-nums">
                  <span className="inline-flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    {c.module.lessons.length} lessons
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {c.module.estimatedHours} hours
                  </span>
                </div>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-4 flex items-center justify-between gap-2">
                <Link
                  href={`/skills/${c.skillSlug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:underline"
                >
                  Start Tutorial
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                {c.resources[0] && (
                  <a
                    href={c.resources[0].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900"
                  >
                    Docs
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
