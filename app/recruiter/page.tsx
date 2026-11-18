'use client';

import React, { useEffect, useState } from 'react';
import {
  Briefcase,
  Users,
  Plus,
  CheckCircle2,
  AlertCircle,
  BookmarkCheck,
  Trash2,
  Building2,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { ProtectedGate } from '@/components/common/ProtectedGate';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  createJobListing,
  deleteJobListing,
  getRecruiterJobListings,
  getRecruiterProfile,
  getRecruiterShortlists,
  removeRecruiterShortlist,
  saveRecruiterProfile,
  searchSharedCandidates,
  updateJobListingStatus,
  upsertRecruiterShortlist,
} from '@/lib/firestore-service';
import {
  CandidateProfile,
  JobListing,
  RecruiterShortlist,
} from '@/lib/types';

export default function RecruiterDashboardPage() {
  const { firebaseUser, userAccount } = useAuth();

  const [tab, setTab] = useState<'candidates' | 'jobs' | 'shortlist' | 'company'>('candidates');

  // Company profile
  const [recruiterName, setRecruiterName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [location, setLocation] = useState('');
  const [companyDesc, setCompanyDesc] = useState('');

  // Job postings
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [jobTitle, setJobTitle] = useState('');
  const [jobLocation, setJobLocation] = useState('Remote');
  const [workMode, setWorkMode] = useState<'Remote' | 'Hybrid' | 'Onsite'>('Remote');
  const [employmentType, setEmploymentType] = useState<
    'Full-time' | 'Part-time' | 'Contract' | 'Internship'
  >('Full-time');
  const [experienceLevel, setExperienceLevel] = useState<'Entry' | 'Mid' | 'Senior' | 'Lead'>(
    'Mid'
  );
  const [salaryRange, setSalaryRange] = useState('');
  const [reqSkillsText, setReqSkillsText] = useState('');
  const [prefSkillsText, setPrefSkillsText] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  // Candidate Search
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [skillFilter, setSkillFilter] = useState('');
  const [qualFilter, setQualFilter] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile | null>(null);

  // Shortlists
  const [shortlists, setShortlists] = useState<RecruiterShortlist[]>([]);

  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadAll = async (uid: string) => {
    const [prof, myJobs, sharedCands, sl] = await Promise.all([
      getRecruiterProfile(uid),
      getRecruiterJobListings(uid),
      searchSharedCandidates(),
      getRecruiterShortlists(uid),
    ]);
    if (prof) {
      setRecruiterName(prof.recruiterName);
      setCompanyName(prof.companyName);
      setCompanyWebsite(prof.companyWebsite || '');
      setIndustry(prof.industry || '');
      setCompanySize(prof.companySize || '');
      setLocation(prof.location || '');
      setCompanyDesc(prof.description || '');
    } else if (userAccount) {
      setRecruiterName(userAccount.displayName);
    }
    setJobs(myJobs);
    if (myJobs[0] && !selectedJobId) setSelectedJobId(myJobs[0].id);
    setCandidates(sharedCands);
    setShortlists(sl);
  };

  useEffect(() => {
    if (!firebaseUser || !firebaseUser.emailVerified || userAccount?.accountType !== 'recruiter') {
      return;
    }
    let active = true;
    Promise.all([
      getRecruiterProfile(firebaseUser.uid),
      getRecruiterJobListings(firebaseUser.uid),
      searchSharedCandidates(),
      getRecruiterShortlists(firebaseUser.uid),
    ]).then(([prof, myJobs, sharedCands, sl]) => {
      if (!active) return;
      if (prof) {
        setRecruiterName(prof.recruiterName);
        setCompanyName(prof.companyName);
        setCompanyWebsite(prof.companyWebsite || '');
        setIndustry(prof.industry || '');
        setCompanySize(prof.companySize || '');
        setLocation(prof.location || '');
        setCompanyDesc(prof.description || '');
      } else if (userAccount) {
        setRecruiterName(userAccount.displayName);
      }
      setJobs(myJobs);
      if (myJobs[0]) setSelectedJobId((prev) => prev || myJobs[0].id);
      setCandidates(sharedCands);
      setShortlists(sl);
    });
    return () => {
      active = false;
    };
  }, [firebaseUser, userAccount]);

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await saveRecruiterProfile(firebaseUser.uid, {
        recruiterName,
        companyName,
        companyWebsite,
        industry,
        companySize,
        location,
        description: companyDesc,
      });
      setNotice('Company & recruiter profile saved to Firestore.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save recruiter profile.');
    } finally {
      setBusy(false);
    }
  };

  const handlePublishJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const requiredSkills = reqSkillsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const preferredSkills = prefSkillsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      if (requiredSkills.length === 0) {
        throw new Error('Specify at least one required skill separated by commas.');
      }

      await createJobListing(firebaseUser.uid, {
        title: jobTitle,
        companyName: companyName || 'Hiring Organization',
        location: jobLocation,
        workMode,
        employmentType,
        experienceLevel,
        salaryRange,
        requiredSkills,
        preferredSkills,
        description: jobDescription,
        status: 'open',
      });
      setJobTitle('');
      setReqSkillsText('');
      setPrefSkillsText('');
      setJobDescription('');
      setSalaryRange('');
      await loadAll(firebaseUser.uid);
      setNotice('Job vacancy published and visible to candidates.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish job.');
    } finally {
      setBusy(false);
    }
  };

  const activeBenchmarkJob = jobs.find((j) => j.id === selectedJobId);

  const computeCandidateMatch = (cand: CandidateProfile): number => {
    const reqs = activeBenchmarkJob?.requiredSkills || [];
    if (reqs.length === 0) return cand.resumeScore ?? 0;
    const candSkills = new Set(
      [
        ...(cand.skills || []),
        ...(cand.programmingLanguages || []),
        ...(cand.frameworksTools || []),
      ].map((s) => s.toLowerCase())
    );
    const hits = reqs.filter((r) => candSkills.has(r.toLowerCase())).length;
    return Math.round((hits / reqs.length) * 100);
  };

  const filteredCandidates = candidates
    .filter((c) => {
      const sk = skillFilter.trim().toLowerCase();
      const qf = qualFilter.trim().toLowerCase();
      const matchSkill =
        !sk ||
        c.skills.some((s) => s.toLowerCase().includes(sk)) ||
        c.programmingLanguages.some((s) => s.toLowerCase().includes(sk));
      const matchQual =
        !qf ||
        (c.education || []).some(
          (ed) =>
            ed.degree.toLowerCase().includes(qf) ||
            ed.fieldOfStudy.toLowerCase().includes(qf)
        ) ||
        (c.targetRole || '').toLowerCase().includes(qf);
      return matchSkill && matchQual;
    })
    .map((c) => ({ candidate: c, matchPct: computeCandidateMatch(c) }))
    .sort((a, b) => b.matchPct - a.matchPct);

  const handleShortlist = async (cand: CandidateProfile, matchPct: number) => {
    if (!firebaseUser) return;
    await upsertRecruiterShortlist({
      recruiterId: firebaseUser.uid,
      candidateUid: cand.uid,
      candidateName: cand.fullName,
      targetRole: cand.targetRole,
      jobId: activeBenchmarkJob?.id || '',
      jobTitle: activeBenchmarkJob?.title || '',
      matchPercentage: matchPct,
      status: 'shortlisted',
      notes: '',
    });
    const updated = await getRecruiterShortlists(firebaseUser.uid);
    setShortlists(updated);
    setNotice(`Shortlisted ${cand.fullName}.`);
  };

  return (
    <AppShell
      title="Recruiter Hub"
      subtitle="Publish job vacancies, discover opted-in candidates, and manage talent shortlists"
    >
      <ProtectedGate requiredRole="recruiter">
        <div className="space-y-6">
          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs text-slate-500">Active Job Postings</p>
              <p className="mt-1 text-2xl font-bold text-[#0B1221] tabular-nums">
                {jobs.filter((j) => j.status === 'open').length}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs text-slate-500">Discoverable Opt-In Candidates</p>
              <p className="mt-1 text-2xl font-bold text-[#0B1221] tabular-nums">
                {candidates.length}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs text-slate-500">Shortlisted Talent</p>
              <p className="mt-1 text-2xl font-bold text-blue-700 tabular-nums">
                {shortlists.length}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: 'candidates', label: 'Find Candidates', icon: Users },
                { id: 'jobs', label: 'Post & Manage Jobs', icon: Briefcase },
                { id: 'shortlist', label: `Shortlisted (${shortlists.length})`, icon: BookmarkCheck },
                { id: 'company', label: 'Company Profile', icon: Building2 },
              ] as const
            ).map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                    tab === t.id
                      ? 'bg-[#0B1221] text-white'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {t.label}
                </button>
              );
            })}
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

          {/* Tab 1: Candidate Search */}
          {tab === 'candidates' && (
            <div className="space-y-5">
              <div className="rounded-xl border border-slate-200 bg-white p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                  placeholder="Filter by skill (e.g. Python, React, SQL)..."
                  className="rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
                />
                <input
                  type="text"
                  value={qualFilter}
                  onChange={(e) => setQualFilter(e.target.value)}
                  placeholder="Filter by degree or target role..."
                  className="rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
                />
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  aria-label="Compare candidates against job posting"
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800"
                >
                  <option value="">Score by Resume Quality</option>
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      Match vs: {j.title}
                    </option>
                  ))}
                </select>
              </div>

              {filteredCandidates.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-xs text-slate-500">
                  No opted-in candidate profiles match your current filters. Candidates only appear here when they enable &ldquo;Share Profile with Verified Recruiters&rdquo;.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredCandidates.map(({ candidate, matchPct }) => (
                    <div
                      key={candidate.uid}
                      className="rounded-xl border border-slate-200 bg-white p-6 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-base font-bold text-[#0B1221]">
                            {candidate.fullName}
                          </h3>
                          <p className="text-xs text-slate-600">
                            {candidate.targetRole || candidate.headline || 'Technical Candidate'}
                            {candidate.location ? ` · ${candidate.location}` : ''}
                          </p>
                        </div>
                        <span className="font-mono text-sm font-bold text-blue-700 tabular-nums">
                          {matchPct}% Match
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed">
                        <strong>Skills:</strong>{' '}
                        {candidate.skills.slice(0, 10).join(' · ') || 'None listed'}
                      </p>

                      <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                        <button
                          type="button"
                          onClick={() => setSelectedCandidate(candidate)}
                          className="text-xs font-semibold text-slate-700 hover:text-blue-700"
                        >
                          View Profile Details
                        </button>
                        <button
                          type="button"
                          onClick={() => handleShortlist(candidate, matchPct)}
                          className="rounded-lg bg-[#0B1221] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                        >
                          Shortlist Candidate
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedCandidate && (
                <div className="rounded-xl border border-blue-200 bg-white p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-[#0B1221]">
                      {selectedCandidate.fullName}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setSelectedCandidate(null)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-900"
                    >
                      Close
                    </button>
                  </div>
                  <p className="text-xs text-slate-600">
                    {selectedCandidate.headline} · {selectedCandidate.targetRole}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="font-semibold text-slate-800">Education</p>
                      {(selectedCandidate.education || []).map((e, i) => (
                        <p key={i} className="text-slate-600 mt-1">
                          {e.degree} {e.fieldOfStudy} — {e.institution}
                        </p>
                      ))}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">Projects</p>
                      {(selectedCandidate.projects || []).map((p, i) => (
                        <p key={i} className="text-slate-600 mt-1">
                          <strong>{p.title}:</strong> {p.description}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Post & Manage Jobs */}
          {tab === 'jobs' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <form
                onSubmit={handlePublishJob}
                className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-6 space-y-4"
              >
                <h2 className="text-base font-bold text-[#0B1221]">Publish Job Vacancy</h2>
                <input
                  type="text"
                  required
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Job Title (e.g. Junior Machine Learning Engineer)"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    value={jobLocation}
                    onChange={(e) => setJobLocation(e.target.value)}
                    placeholder="Location"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                  <input
                    type="text"
                    value={salaryRange}
                    onChange={(e) => setSalaryRange(e.target.value)}
                    placeholder="Salary range (optional)"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={workMode}
                    onChange={(e) =>
                      setWorkMode(e.target.value as 'Remote' | 'Hybrid' | 'Onsite')
                    }
                    className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Onsite">Onsite</option>
                  </select>
                  <select
                    value={employmentType}
                    onChange={(e) =>
                      setEmploymentType(
                        e.target.value as 'Full-time' | 'Part-time' | 'Contract' | 'Internship'
                      )
                    }
                    className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                  <select
                    value={experienceLevel}
                    onChange={(e) =>
                      setExperienceLevel(e.target.value as 'Entry' | 'Mid' | 'Senior' | 'Lead')
                    }
                    className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs"
                  >
                    <option value="Entry">Entry</option>
                    <option value="Mid">Mid</option>
                    <option value="Senior">Senior</option>
                    <option value="Lead">Lead</option>
                  </select>
                </div>
                <input
                  type="text"
                  required
                  value={reqSkillsText}
                  onChange={(e) => setReqSkillsText(e.target.value)}
                  placeholder="Required skills (comma-separated: Python, SQL, Scikit-learn)"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
                <input
                  type="text"
                  value={prefSkillsText}
                  onChange={(e) => setPrefSkillsText(e.target.value)}
                  placeholder="Preferred skills (optional, comma-separated)"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
                <textarea
                  rows={4}
                  required
                  minLength={10}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Role responsibilities, team context, and requirements..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  <Plus className="h-4 w-4" />
                  Publish Vacancy
                </button>
              </form>

              <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-6 space-y-4">
                <h2 className="text-base font-bold text-[#0B1221]">
                  Manage Job Postings ({jobs.length})
                </h2>
                {jobs.length === 0 ? (
                  <p className="text-xs text-slate-500">No job postings published yet.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {jobs.map((j) => (
                      <div key={j.id} className="py-3 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-sm font-bold text-slate-900">{j.title}</h3>
                          <span className="text-xs font-mono uppercase text-slate-600">
                            {j.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          {j.location} · {j.workMode} · {j.experienceLevel}
                        </p>
                        <div className="flex items-center gap-3 pt-1 text-xs">
                          <button
                            type="button"
                            onClick={async () => {
                              if (!firebaseUser) return;
                              await updateJobListingStatus(
                                j.id,
                                j.status === 'open' ? 'closed' : 'open'
                              );
                              loadAll(firebaseUser.uid);
                            }}
                            className="font-semibold text-blue-700 hover:underline"
                          >
                            {j.status === 'open' ? 'Close Listing' : 'Reopen Listing'}
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (!firebaseUser) return;
                              await deleteJobListing(j.id);
                              loadAll(firebaseUser.uid);
                            }}
                            className="inline-flex items-center gap-1 text-rose-700 hover:underline"
                          >
                            <Trash2 className="h-3 w-3" /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Shortlists */}
          {tab === 'shortlist' && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
              <h2 className="text-base font-bold text-[#0B1221]">Shortlisted Candidates</h2>
              {shortlists.length === 0 ? (
                <p className="text-xs text-slate-500">
                  No candidates shortlisted yet. Search opted-in talent and click Shortlist Candidate.
                </p>
              ) : (
                <div className="divide-y divide-slate-200">
                  {shortlists.map((sl) => (
                    <div
                      key={sl.id}
                      className="py-3.5 grid grid-cols-1 md:grid-cols-12 gap-3 items-center text-xs"
                    >
                      <div className="md:col-span-4">
                        <p className="font-bold text-sm text-[#0B1221]">{sl.candidateName}</p>
                        <p className="text-slate-500">
                          {sl.jobTitle || sl.targetRole || 'General Talent'} ·{' '}
                          <span className="font-mono text-blue-700">
                            {sl.matchPercentage ?? 0}%
                          </span>
                        </p>
                      </div>
                      <div className="md:col-span-3">
                        <select
                          value={sl.status}
                          onChange={async (e) => {
                            if (!firebaseUser) return;
                            await upsertRecruiterShortlist({
                              recruiterId: firebaseUser.uid,
                              candidateUid: sl.candidateUid,
                              candidateName: sl.candidateName,
                              matchPercentage: sl.matchPercentage,
                              status: e.target.value as RecruiterShortlist['status'],
                              notes: sl.notes,
                            });
                            loadAll(firebaseUser.uid);
                          }}
                          className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5"
                        >
                          <option value="shortlisted">Shortlisted</option>
                          <option value="contacted">Contacted</option>
                          <option value="interview">Interview</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>
                      <div className="md:col-span-4">
                        <input
                          type="text"
                          defaultValue={sl.notes || ''}
                          placeholder="Recruiter notes..."
                          onBlur={async (e) => {
                            if (!firebaseUser) return;
                            await upsertRecruiterShortlist({
                              recruiterId: firebaseUser.uid,
                              candidateUid: sl.candidateUid,
                              candidateName: sl.candidateName,
                              matchPercentage: sl.matchPercentage,
                              status: sl.status,
                              notes: e.target.value,
                            });
                          }}
                          className="w-full rounded-lg border border-slate-200 px-3 py-1.5"
                        />
                      </div>
                      <div className="md:col-span-1 text-right">
                        <button
                          type="button"
                          onClick={async () => {
                            if (!sl.id || !firebaseUser) return;
                            await removeRecruiterShortlist(sl.id);
                            loadAll(firebaseUser.uid);
                          }}
                          className="text-slate-400 hover:text-rose-700"
                          aria-label="Remove from shortlist"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Company Profile */}
          {tab === 'company' && (
            <form
              onSubmit={handleSaveCompany}
              className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 max-w-2xl"
            >
              <h2 className="text-base font-bold text-[#0B1221]">
                Recruiter & Company Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Recruiter Name
                  </label>
                  <input
                    type="text"
                    required
                    value={recruiterName}
                    onChange={(e) => setRecruiterName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Industry</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g. Cloud Infrastructure"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Company Size
                  </label>
                  <input
                    type="text"
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                    placeholder="e.g. 50–200 employees"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Website</label>
                  <input
                    type="url"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                    placeholder="https://company.com"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Company Description
                </label>
                <textarea
                  rows={3}
                  value={companyDesc}
                  onChange={(e) => setCompanyDesc(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="rounded-lg bg-[#0B1221] px-5 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                Save Company Profile
              </button>
            </form>
          )}
        </div>
      </ProtectedGate>
    </AppShell>
  );
}
