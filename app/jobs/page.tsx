'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Search,
  Bookmark,
  ExternalLink,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  getOpenJobListings,
  getUserSavedJobs,
  saveJobBookmark,
  trackJobApplication,
} from '@/lib/firestore-service';
import { JobMatchEvaluation, UnifiedJobItem } from '@/lib/types';

export default function FindJobsPage() {
  const { firebaseUser, candidateProfile } = useAuth();

  const [queryText, setQueryText] = useState('');
  const [skillsFilter, setSkillsFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [country, setCountry] = useState('us');
  const [workMode, setWorkMode] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [hasExternalApi, setHasExternalApi] = useState<boolean | null>(null);
  const [externalJobs, setExternalJobs] = useState<UnifiedJobItem[]>([]);
  const [recruiterJobs, setRecruiterJobs] = useState<UnifiedJobItem[]>([]);
  const [totalExternal, setTotalExternal] = useState(0);
  const [providerErrors, setProviderErrors] = useState<string[]>([]);

  const [matchMap, setMatchMap] = useState<Record<string, JobMatchEvaluation>>({});
  const [matching, setMatching] = useState(false);
  const [tierFilter, setTierFilter] = useState<
    'all' | 'highly_suitable' | 'partially_suitable' | 'additional_skills_required'
  >('all');
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(
    async (targetPage = 1) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (queryText.trim()) params.set('q', queryText.trim());
        if (skillsFilter.trim()) params.set('skills', skillsFilter.trim());
        if (companyFilter.trim()) params.set('company', companyFilter.trim());
        if (locationFilter.trim()) params.set('location', locationFilter.trim());
        params.set('country', country);
        if (workMode) params.set('workMode', workMode);
        if (employmentType) params.set('employmentType', employmentType);
        if (minSalary.trim()) params.set('minSalary', minSalary.trim());
        params.set('page', String(targetPage));

        const res = await fetch(`/api/jobs/search?${params.toString()}`);
        const data = await res.json();
        setHasExternalApi(Boolean(data.hasExternalApi));
        setExternalJobs(data.jobs || []);
        setTotalExternal(data.totalResults || 0);
        setProviderErrors(data.providerErrors || []);

        if (firebaseUser && firebaseUser.emailVerified) {
          const internal = await getOpenJobListings();
          const mappedInternal: UnifiedJobItem[] = internal
            .filter((j) => {
              const q = queryText.trim().toLowerCase();
              const sk = skillsFilter.trim().toLowerCase();
              const co = companyFilter.trim().toLowerCase();
              const loc = locationFilter.trim().toLowerCase();
              const matchQ =
                !q ||
                j.title.toLowerCase().includes(q) ||
                j.description.toLowerCase().includes(q);
              const matchSk =
                !sk ||
                j.requiredSkills.some((r) => r.toLowerCase().includes(sk)) ||
                (j.preferredSkills || []).some((p) => p.toLowerCase().includes(sk));
              const matchCo = !co || j.companyName.toLowerCase().includes(co);
              const matchLoc = !loc || j.location.toLowerCase().includes(loc);
              const matchMode = !workMode || j.workMode === workMode;
              const matchExp = !experienceLevel || j.experienceLevel === experienceLevel;
              const matchEmp = !employmentType || j.employmentType === employmentType;
              return (
                matchQ &&
                matchSk &&
                matchCo &&
                matchLoc &&
                matchMode &&
                matchExp &&
                matchEmp
              );
            })
            .map((j) => ({
              jobKey: `sb-${j.id}`,
              title: j.title,
              company: j.companyName,
              location: j.location,
              workMode: j.workMode,
              employmentType: j.employmentType,
              experienceLevel: j.experienceLevel,
              salary: j.salaryRange || undefined,
              requiredSkills: j.requiredSkills,
              preferredSkills: j.preferredSkills,
              description: j.description,
              source: 'Skill To Job Matcher Recruiter',
              applyUrl: j.applyUrl || '',
              isInternalRecruiterJob: true,
            }));
          setRecruiterJobs(mappedInternal);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch job listings.');
      } finally {
        setLoading(false);
      }
    },
    [
      queryText,
      skillsFilter,
      companyFilter,
      locationFilter,
      country,
      workMode,
      experienceLevel,
      employmentType,
      minSalary,
      firebaseUser,
    ]
  );

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({ country: 'us', page: '1' });

    fetch(`/api/jobs/search?${params.toString()}`)
      .then((res) => res.json())
      .then(async (data) => {
        if (!active) return;
        setHasExternalApi(Boolean(data.hasExternalApi));
        setExternalJobs(data.jobs || []);
        setTotalExternal(data.totalResults || 0);
        setProviderErrors(data.providerErrors || []);

        if (firebaseUser && firebaseUser.emailVerified) {
          const internal = await getOpenJobListings();
          if (!active) return;
          setRecruiterJobs(
            internal.map((j) => ({
              jobKey: `sb-${j.id}`,
              title: j.title,
              company: j.companyName,
              location: j.location,
              workMode: j.workMode,
              employmentType: j.employmentType,
              experienceLevel: j.experienceLevel,
              salary: j.salaryRange || undefined,
              requiredSkills: j.requiredSkills,
              preferredSkills: j.preferredSkills,
              description: j.description,
              source: 'Skill To Job Matcher Recruiter',
              applyUrl: j.applyUrl || '',
              isInternalRecruiterJob: true,
            }))
          );
        }
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to fetch job listings.');
        }
      });

    return () => {
      active = false;
    };
  }, [firebaseUser]);

  useEffect(() => {
    if (!firebaseUser || !firebaseUser.emailVerified) return;
    getUserSavedJobs(firebaseUser.uid).then((items) => {
      setSavedKeys(new Set(items.map((i) => i.jobKey)));
    });
  }, [firebaseUser]);

  const combinedJobs = [...recruiterJobs, ...externalJobs];

  const handleRunAiMatch = async () => {
    if (combinedJobs.length === 0) return;
    if (!candidateProfile || !candidateProfile.skills?.length) {
      setError(
        'Add your skills in Profile or analyze your Resume first so Gemini can score your compatibility.'
      );
      return;
    }

    setMatching(true);
    setError(null);
    try {
      const res = await fetch('/api/jobs/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateSummary: {
            skills: candidateProfile.skills,
            education: (candidateProfile.education || [])
              .map((e) => `${e.degree} ${e.fieldOfStudy} (${e.institution})`)
              .join('; '),
            experience: (candidateProfile.workExperience || [])
              .map((w) => `${w.role} at ${w.organization} (${w.duration})`)
              .join('; '),
            targetRole: candidateProfile.targetRole || '',
          },
          jobs: combinedJobs.slice(0, 12).map((j) => ({
            jobKey: j.jobKey,
            title: j.title,
            company: j.company,
            requiredSkills: j.requiredSkills,
            preferredSkills: j.preferredSkills || [],
            description: j.description,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI job matching failed.');
      const nextMap: Record<string, JobMatchEvaluation> = {};
      for (const ev of data.evaluations || []) {
        nextMap[ev.jobKey] = ev;
      }
      setMatchMap(nextMap);
      setFeedback('AI compatibility scores calculated from your resume and skills.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI job matching failed.');
    } finally {
      setMatching(false);
    }
  };

  const handleBookmark = async (job: UnifiedJobItem) => {
    if (!firebaseUser || !firebaseUser.emailVerified) {
      setError('Sign in with a verified email to bookmark jobs.');
      return;
    }
    await saveJobBookmark({
      uid: firebaseUser.uid,
      jobKey: job.jobKey,
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary,
      source: job.source,
      applyUrl: job.applyUrl,
      description: job.description.slice(0, 4500),
      matchScore: matchMap[job.jobKey]?.overallCompatibility,
    });
    setSavedKeys((prev) => new Set([...prev, job.jobKey]));
    setFeedback(`Saved "${job.title}" to My Applications.`);
  };

  const handleTrackApplied = async (job: UnifiedJobItem) => {
    if (!firebaseUser || !firebaseUser.emailVerified) {
      setError('Sign in with a verified email to track applications.');
      return;
    }
    await trackJobApplication({
      uid: firebaseUser.uid,
      jobKey: job.jobKey,
      title: job.title,
      company: job.company,
      location: job.location,
      source: job.source,
      applyUrl: job.applyUrl,
      status: 'applied',
      notes: '',
    });
    setFeedback(`Marked "${job.title}" as Applied in My Applications.`);
  };

  const displayedJobs = combinedJobs.filter((job) => {
    if (tierFilter === 'all') return true;
    const ev = matchMap[job.jobKey];
    return ev?.suitabilityTier === tierFilter;
  });

  return (
    <AppShell
      title="Find Jobs & AI Matching"
      subtitle="Search live external job APIs and recruiter-published postings with transparent compatibility scoring"
    >
      <div className="space-y-6">
        {/* Search & Filter Panel */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            fetchJobs(1);
          }}
          className="rounded-xl border border-slate-200 bg-white p-6 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              type="text"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="Job title (e.g. Data Analyst, ML Engineer)"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
            <input
              type="text"
              value={skillsFilter}
              onChange={(e) => setSkillsFilter(e.target.value)}
              placeholder="Required skills (e.g. Python, React)"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
            <input
              type="text"
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              placeholder="Company name"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
            <input
              type="text"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              placeholder="City or state"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              aria-label="Country"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800"
            >
              <option value="us">United States</option>
              <option value="gb">United Kingdom</option>
              <option value="in">India</option>
              <option value="ca">Canada</option>
              <option value="au">Australia</option>
              <option value="de">Germany</option>
            </select>

            <select
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
              aria-label="Work mode"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800"
            >
              <option value="">Any Work Mode</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Onsite">Onsite</option>
            </select>

            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              aria-label="Experience level"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800"
            >
              <option value="">Any Experience</option>
              <option value="Entry">Entry</option>
              <option value="Mid">Mid</option>
              <option value="Senior">Senior</option>
              <option value="Lead">Lead</option>
            </select>

            <select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
              aria-label="Employment type"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800"
            >
              <option value="">Any Type</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>

            <input
              type="number"
              value={minSalary}
              onChange={(e) => setMinSalary(e.target.value)}
              placeholder="Min Salary ($)"
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
            />

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0B1221] px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              <Search className="h-3.5 w-3.5" />
              {loading ? 'Searching...' : 'Search Jobs'}
            </button>
          </div>
        </form>

        {/* External Job API Configuration Screen when keys are absent */}
        {hasExternalApi === false && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-6 space-y-3">
            <div className="flex items-start gap-3">
              <Settings className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-2 text-xs text-amber-950">
                <h2 className="text-sm font-bold">
                  External Job Search API Credentials Not Configured
                </h2>
                <p className="leading-relaxed">
                  Skill To Job Matcher never displays fabricated external vacancies. To pull live external job listings from Adzuna or Jooble, configure server-side credentials in your environment / Secrets panel:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <strong>Adzuna API</strong>: Register at{' '}
                    <a
                      href="https://developer.adzuna.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-semibold"
                    >
                      developer.adzuna.com
                    </a>{' '}
                    and set <code className="font-mono">ADZUNA_APP_ID</code> and{' '}
                    <code className="font-mono">ADZUNA_APP_KEY</code>.
                  </li>
                  <li>
                    <strong>Jooble API</strong>: Register at{' '}
                    <a
                      href="https://jooble.org/api/about"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-semibold"
                    >
                      jooble.org/api/about
                    </a>{' '}
                    and set <code className="font-mono">JOOBLE_API_KEY</code>.
                  </li>
                </ul>
                <p className="text-amber-900">
                  Recruiter-published vacancies stored in Skill To Job Matcher Firestore remain searchable below when signed in.
                </p>
              </div>
            </div>
          </div>
        )}

        {providerErrors.length > 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            {providerErrors.join(' · ')}
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {feedback && (
          <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{feedback}</span>
          </div>
        )}

        {/* AI Match Toolbar */}
        {combinedJobs.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  { id: 'all', label: `All Results (${combinedJobs.length})` },
                  { id: 'highly_suitable', label: 'Highly Suitable' },
                  { id: 'partially_suitable', label: 'Partially Suitable' },
                  { id: 'additional_skills_required', label: 'Needs Additional Skills' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTierFilter(tab.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                    tierFilter === tab.id
                      ? 'bg-[#0B1221] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={matching}
              onClick={handleRunAiMatch}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {matching ? 'Scoring Compatibility...' : 'Score Compatibility with Gemini'}
            </button>
          </div>
        )}

        {/* Job Results List */}
        {displayedJobs.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-600">
            {loading
              ? 'Searching job listings...'
              : 'No matching job postings found for your current filters.'}
          </div>
        ) : (
          <div className="space-y-4">
            {displayedJobs.map((job) => {
              const ev = matchMap[job.jobKey];
              const isSaved = savedKeys.has(job.jobKey);
              return (
                <article
                  key={job.jobKey}
                  className="rounded-xl border border-slate-200 bg-white p-6 space-y-4"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-semibold text-blue-700">{job.source}</span>
                        <span aria-hidden="true">·</span>
                        <span>{job.location}</span>
                        {job.workMode && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{job.workMode}</span>
                          </>
                        )}
                        {job.employmentType && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{job.employmentType}</span>
                          </>
                        )}
                        {job.salary && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono text-slate-700">{job.salary}</span>
                          </>
                        )}
                        {job.postedAt && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>Posted {job.postedAt}</span>
                          </>
                        )}
                      </div>
                      <h2 className="mt-2 text-lg font-bold text-[#0B1221]">{job.title}</h2>
                      <p className="text-sm font-medium text-slate-700">{job.company}</p>
                    </div>

                    {ev && (
                      <div className="rounded-lg border border-slate-200 bg-[#F8FAFC] px-4 py-3 text-right shrink-0">
                        <p className="text-xs text-slate-500">Overall Match</p>
                        <p className="text-2xl font-bold text-blue-700 tabular-nums">
                          {ev.overallCompatibility}%
                        </p>
                        <p className="text-xs font-medium text-slate-700 capitalize">
                          {ev.suitabilityTier.replace(/_/g, ' ')}
                        </p>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                    {job.description}
                  </p>

                  {job.requiredSkills.length > 0 && (
                    <p className="text-xs text-slate-500">
                      <strong>Required Skills:</strong> {job.requiredSkills.join(' · ')}
                    </p>
                  )}

                  {ev && (
                    <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-4 text-xs space-y-1.5">
                      <p className="font-semibold text-slate-900">
                        Why Matched · Required {ev.requiredSkillMatch}% · Preferred{' '}
                        {ev.preferredSkillMatch}% · Education {ev.educationRelevance}% · Experience{' '}
                        {ev.experienceRelevance}%
                      </p>
                      <p className="text-slate-700">{ev.explanation}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleBookmark(job)}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors ${
                          isSaved
                            ? 'border-blue-300 bg-blue-50 text-blue-800'
                            : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Bookmark className="h-3.5 w-3.5" />
                        {isSaved ? 'Saved' : 'Bookmark'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTrackApplied(job)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Track Application
                      </button>
                    </div>

                    {job.applyUrl ? (
                      <a
                        href={job.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B1221] px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                      >
                        Apply Now
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleTrackApplied(job)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B1221] px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                      >
                        Apply via Skill To Job Matcher
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {hasExternalApi && (
          <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-xs text-slate-600">
            <span className="tabular-nums">
              Page {page} · {totalExternal.toLocaleString()} external vacancies found
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => {
                  const p = Math.max(1, page - 1);
                  setPage(p);
                  fetchJobs(p);
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-semibold disabled:opacity-50"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </button>
              <button
                type="button"
                disabled={loading || externalJobs.length === 0}
                onClick={() => {
                  const p = page + 1;
                  setPage(p);
                  fetchJobs(p);
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-semibold disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
