'use client';

import React, { useState } from 'react';
import { Save, Plus, X, CheckCircle2, AlertCircle, Shield } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { ProtectedGate } from '@/components/common/ProtectedGate';
import { useAuth } from '@/components/providers/AuthProvider';
import { saveCandidateProfile } from '@/lib/firestore-service';
import { AccountType, CandidateProfile, UserAccount } from '@/lib/types';

export default function ProfilePage() {
  const {
    firebaseUser,
    userAccount,
    candidateProfile,
    changeAccountType,
    refreshCandidateProfile,
  } = useAuth();

  const [roleSwitching, setRoleSwitching] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRoleSwitch = async (nextRole: AccountType) => {
    setRoleSwitching(true);
    setError(null);
    setNotice(null);
    try {
      await changeAccountType(nextRole);
      setNotice(`Account role updated to "${nextRole}".`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch role.');
    } finally {
      setRoleSwitching(false);
    }
  };

  const formKey = `${userAccount?.uid ?? 'none'}_${
    candidateProfile ? candidateProfile.updatedAt || 'loaded' : 'new'
  }`;

  return (
    <AppShell
      title="Profile & Privacy Controls"
      subtitle="Manage your account role, confirmed technical skills, and recruiter visibility consent"
    >
      <ProtectedGate>
        <div className="space-y-6 max-w-4xl">
          {/* Account Role & Privacy */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-[#0B1221]">Account Information</h2>
                <p className="text-xs text-slate-500">
                  Signed in as <strong>{firebaseUser?.email}</strong>
                </p>
              </div>
              <div className="flex items-center gap-2">
                {(
                  [
                    { id: 'learner', label: 'Candidate / Learner' },
                    { id: 'job_seeker', label: 'Job Seeker' },
                    { id: 'recruiter', label: 'Recruiter' },
                  ] as const
                ).map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    disabled={roleSwitching}
                    onClick={() => handleRoleSwitch(r.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                      userAccount?.accountType === r.id
                        ? 'bg-[#0B1221] text-white'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {userAccount?.accountType !== 'recruiter' && (
            <CandidateProfileForm
              key={formKey}
              uid={firebaseUser?.uid || ''}
              userAccount={userAccount}
              candidateProfile={candidateProfile}
              refreshCandidateProfile={refreshCandidateProfile}
              notice={notice}
              error={error}
              setNotice={setNotice}
              setError={setError}
            />
          )}
        </div>
      </ProtectedGate>
    </AppShell>
  );
}

function CandidateProfileForm({
  uid,
  userAccount,
  candidateProfile,
  refreshCandidateProfile,
  notice,
  error,
  setNotice,
  setError,
}: {
  uid: string;
  userAccount: UserAccount | null;
  candidateProfile: CandidateProfile | null;
  refreshCandidateProfile: () => Promise<void>;
  notice: string | null;
  error: string | null;
  setNotice: (val: string | null) => void;
  setError: (val: string | null) => void;
}) {
  const [fullName, setFullName] = useState(
    candidateProfile?.fullName || userAccount?.displayName || ''
  );
  const [headline, setHeadline] = useState(candidateProfile?.headline || '');
  const [location, setLocation] = useState(candidateProfile?.location || '');
  const [targetRole, setTargetRole] = useState(candidateProfile?.targetRole || '');
  const [skills, setSkills] = useState<string[]>(candidateProfile?.skills || []);
  const [languages, setLanguages] = useState<string[]>(
    candidateProfile?.programmingLanguages || []
  );
  const [frameworks] = useState<string[]>(candidateProfile?.frameworksTools || []);
  const [certifications] = useState<string[]>(candidateProfile?.certifications || []);
  const [shareWithRecruiters, setShareWithRecruiters] = useState(
    Boolean(candidateProfile?.shareWithRecruiters)
  );

  const [skillDraft, setSkillDraft] = useState('');
  const [langDraft, setLangDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await saveCandidateProfile(uid, {
        fullName: fullName.trim() || userAccount?.displayName || 'Candidate',
        headline: headline.trim(),
        location: location.trim(),
        targetRole: targetRole.trim(),
        education: candidateProfile?.education || [],
        skills,
        programmingLanguages: languages,
        frameworksTools: frameworks,
        projects: candidateProfile?.projects || [],
        internships: candidateProfile?.internships || [],
        workExperience: candidateProfile?.workExperience || [],
        certifications,
        achievements: candidateProfile?.achievements || [],
        shareWithRecruiters,
        resumeScore: candidateProfile?.resumeScore,
      });
      await refreshCandidateProfile();
      setNotice('Profile saved cleanly to Firestore.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSaveProfile}
      className="rounded-xl border border-slate-200 bg-white p-6 space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <h2 className="text-base font-bold text-[#0B1221]">Candidate Skill Profile</h2>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          <Save className="h-3.5 w-3.5" />
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Target Role
                  </label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Machine Learning Engineer"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Professional Headline
                  </label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g. Computer Science Graduate · Python & SQL"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Austin, TX / Remote"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                  />
                </div>
              </div>

              {/* Confirmed Skills */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Technical Skills ({skills.length})
                </label>
                <div className="flex flex-wrap gap-2 mb-2.5">
                  {skills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-800"
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => setSkills((prev) => prev.filter((x) => x !== s))}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 max-w-sm">
                  <input
                    type="text"
                    value={skillDraft}
                    onChange={(e) => setSkillDraft(e.target.value)}
                    placeholder="Add skill..."
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!skillDraft.trim()) return;
                      setSkills((prev) => Array.from(new Set([...prev, skillDraft.trim()])));
                      setSkillDraft('');
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add
                  </button>
                </div>
              </div>

              {/* Programming Languages */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Programming Languages
                </label>
                <div className="flex flex-wrap gap-2 mb-2.5">
                  {languages.map((l) => (
                    <span
                      key={l}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-800"
                    >
                      {l}
                      <button
                        type="button"
                        onClick={() => setLanguages((prev) => prev.filter((x) => x !== l))}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 max-w-sm">
                  <input
                    type="text"
                    value={langDraft}
                    onChange={(e) => setLangDraft(e.target.value)}
                    placeholder="Add language..."
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!langDraft.trim()) return;
                      setLanguages((prev) => Array.from(new Set([...prev, langDraft.trim()])));
                      setLangDraft('');
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add
                  </button>
                </div>
              </div>

              {/* Recruiter Sharing Consent */}
              <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-700 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <label className="flex items-center justify-between gap-4 cursor-pointer">
                    <div>
                      <span className="text-sm font-semibold text-[#0B1221]">
                        Share Profile with Verified Recruiters
                      </span>
                      <p className="mt-0.5 text-xs text-slate-600">
                        Only when enabled can recruiters discover your skills, target role, and project summary. Your private email and raw resume files are never exposed.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={shareWithRecruiters}
                      onChange={(e) => setShareWithRecruiters(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600"
                    />
          </label>
        </div>
      </div>
    </form>
  );
}
