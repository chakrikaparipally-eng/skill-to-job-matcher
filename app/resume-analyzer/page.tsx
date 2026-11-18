'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Upload,
  FileText,
  Download,
  AlertCircle,
  CheckCircle2,
  Save,
  Plus,
  X,
  ArrowRight,
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
import { useAuth } from '@/components/providers/AuthProvider';
import {
  getUserResumeAnalyses,
  saveCandidateProfile,
  saveResumeAndAnalysis,
} from '@/lib/firestore-service';
import {
  ParsedResumeProfile,
  ResumeAnalysis,
  ResumeImprovements,
  ResumeOverview,
  ResumeScoreBreakdown,
} from '@/lib/types';

export default function ResumeAnalyzerPage() {
  const { firebaseUser, candidateProfile, refreshCandidateProfile } = useAuth();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [stepStatus, setStepStatus] = useState<'idle' | 'parsing' | 'analyzing' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [extractedText, setExtractedText] = useState('');
  const [fileMeta, setFileMeta] = useState<{
    fileName: string;
    fileType: 'pdf' | 'docx';
    fileSize: number;
  } | null>(null);

  const [profileForm, setProfileForm] = useState<ParsedResumeProfile | null>(null);
  const [overview, setOverview] = useState<ResumeOverview | null>(null);
  const [scoreBreakdown, setScoreBreakdown] = useState<ResumeScoreBreakdown | null>(null);
  const [improvements, setImprovements] = useState<ResumeImprovements | null>(null);
  const [pastAnalyses, setPastAnalyses] = useState<ResumeAnalysis[]>([]);

  const [newSkillInput, setNewSkillInput] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!firebaseUser || !firebaseUser.emailVerified) return;
    getUserResumeAnalyses(firebaseUser.uid).then(setPastAnalyses);
  }, [firebaseUser]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setError(null);
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) {
      setError('Please select a PDF or DOCX resume file first.');
      return;
    }

    setError(null);
    setSaveMessage(null);
    setStepStatus('parsing');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const parseRes = await fetch('/api/resume/parse', {
        method: 'POST',
        body: formData,
      });
      const parseData = await parseRes.json();
      if (!parseRes.ok) {
        throw new Error(parseData.error || 'Could not extract text from this file.');
      }

      setExtractedText(parseData.extractedText);
      setFileMeta({
        fileName: parseData.fileName,
        fileType: parseData.fileType,
        fileSize: parseData.fileSize,
      });

      setStepStatus('analyzing');
      const analyzeRes = await fetch('/api/resume/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          extractedText: parseData.extractedText,
          fileName: parseData.fileName,
        }),
      });
      const analyzeData = await analyzeRes.json();
      if (!analyzeRes.ok) {
        throw new Error(analyzeData.error || 'Gemini analysis failed.');
      }

      const parsedProf: ParsedResumeProfile = analyzeData.extractedProfile;
      setProfileForm(parsedProf);
      setOverview(analyzeData.overview);
      setScoreBreakdown(analyzeData.scoreBreakdown);
      setImprovements(analyzeData.improvements);
      setStepStatus('done');

      if (firebaseUser && firebaseUser.emailVerified) {
        await saveResumeAndAnalysis({
          uid: firebaseUser.uid,
          fileName: parseData.fileName,
          fileType: parseData.fileType,
          fileSize: parseData.fileSize,
          extractedText: parseData.extractedText,
          parsedProfile: parsedProf,
          overview: analyzeData.overview,
          scoreBreakdown: analyzeData.scoreBreakdown,
          improvements: analyzeData.improvements,
        });

        const mergedSkills = Array.from(
          new Set([
            ...(parsedProf.technicalSkills || []),
            ...(parsedProf.programmingLanguages || []),
            ...(parsedProf.frameworksAndTools || []),
          ])
        );

        await saveCandidateProfile(firebaseUser.uid, {
          fullName: parsedProf.fullName || firebaseUser.displayName || 'Candidate',
          headline: candidateProfile?.headline || '',
          location: candidateProfile?.location || '',
          targetRole: candidateProfile?.targetRole || '',
          education: parsedProf.education || [],
          skills: mergedSkills,
          programmingLanguages: parsedProf.programmingLanguages || [],
          frameworksTools: parsedProf.frameworksAndTools || [],
          projects: parsedProf.projects || [],
          internships: parsedProf.internships || [],
          workExperience: parsedProf.workExperience || [],
          certifications: parsedProf.certifications || [],
          achievements: parsedProf.achievements || [],
          shareWithRecruiters: candidateProfile?.shareWithRecruiters ?? false,
          resumeScore: analyzeData.scoreBreakdown?.overall ?? 0,
        });

        await refreshCandidateProfile();
        const refreshedAnalyses = await getUserResumeAnalyses(firebaseUser.uid);
        setPastAnalyses(refreshedAnalyses);
        setSaveMessage('Resume extraction, score, and candidate profile saved to Firestore.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Resume analysis failed.');
      setStepStatus('idle');
    }
  };

  const handleSaveEditedProfile = async () => {
    if (!profileForm) return;
    if (!firebaseUser || !firebaseUser.emailVerified) {
      setError('Sign in with a verified email to save edits to your Firestore profile.');
      return;
    }

    setSavingProfile(true);
    setError(null);
    setSaveMessage(null);
    try {
      const mergedSkills = Array.from(
        new Set([
          ...(profileForm.technicalSkills || []),
          ...(profileForm.programmingLanguages || []),
          ...(profileForm.frameworksAndTools || []),
        ])
      );
      await saveCandidateProfile(firebaseUser.uid, {
        fullName: profileForm.fullName || 'Candidate',
        headline: candidateProfile?.headline || '',
        location: candidateProfile?.location || '',
        targetRole: candidateProfile?.targetRole || '',
        education: profileForm.education || [],
        skills: mergedSkills,
        programmingLanguages: profileForm.programmingLanguages || [],
        frameworksTools: profileForm.frameworksAndTools || [],
        projects: profileForm.projects || [],
        internships: profileForm.internships || [],
        workExperience: profileForm.workExperience || [],
        certifications: profileForm.certifications || [],
        achievements: profileForm.achievements || [],
        shareWithRecruiters: candidateProfile?.shareWithRecruiters ?? false,
        resumeScore: scoreBreakdown?.overall ?? candidateProfile?.resumeScore,
      });
      await refreshCandidateProfile();
      setSaveMessage('Edited candidate profile updated in Firestore.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile edits.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDownloadReport = () => {
    if (!overview || !scoreBreakdown || !improvements || !profileForm) return;
    const lines = [
      `SKILLBRIDGE AI — RESUME ANALYSIS REPORT`,
      `File: ${fileMeta?.fileName || 'Resume'}`,
      `Candidate: ${profileForm.fullName || 'Not specified'}`,
      `Generated: ${new Date().toISOString()}`,
      ``,
      `========================================`,
      `OVERALL RESUME SCORE: ${scoreBreakdown.overall} / 100`,
      `========================================`,
      `- Technical Skills: ${scoreBreakdown.technicalSkills} / 25`,
      `- Projects: ${scoreBreakdown.projects} / 20`,
      `- Education: ${scoreBreakdown.education} / 15`,
      `- Practical Experience: ${scoreBreakdown.practicalExperience} / 20`,
      `- Certifications: ${scoreBreakdown.certifications} / 10`,
      `- Structure & Clarity: ${scoreBreakdown.structureClarity} / 10`,
      ``,
      `Calculation Explanation:`,
      scoreBreakdown.calculationExplanation,
      ``,
      `RESUME OVERVIEW`,
      `---------------`,
      `Professional Summary: ${overview.professionalSummary}`,
      `Technical Skills Summary: ${overview.technicalSkillSummary}`,
      `Education Summary: ${overview.educationSummary}`,
      `Projects Summary: ${overview.projectSummary}`,
      `Experience Summary: ${overview.experienceSummary}`,
      ``,
      `EXTRACTED DETAILS`,
      `-----------------`,
      `Email: ${profileForm.email || 'Not listed'}`,
      `Phone: ${profileForm.phone || 'Not listed'}`,
      `Degrees: ${(profileForm.degrees || []).join(', ') || 'None'}`,
      `Technical Skills: ${(profileForm.technicalSkills || []).join(', ') || 'None'}`,
      `Programming Languages: ${(profileForm.programmingLanguages || []).join(', ') || 'None'}`,
      `Frameworks & Tools: ${(profileForm.frameworksAndTools || []).join(', ') || 'None'}`,
      `Certifications: ${(profileForm.certifications || []).join(', ') || 'None'}`,
      ``,
      `IMPROVEMENT RECOMMENDATIONS`,
      `---------------------------`,
      `Missing Sections: ${(improvements.missingSections || []).join('; ') || 'None'}`,
      `Missing Technical Keywords: ${(improvements.missingTechnicalKeywords || []).join(', ') || 'None'}`,
      ``,
      `Suggestions:`,
      ...(improvements.suggestions || []).map((s) => `- ${s}`),
      ``,
      `Stronger Project Descriptions:`,
      ...(improvements.strongerProjectDescriptions || []).map((s) => `- ${s}`),
      ``,
      `Actionable Next Steps:`,
      ...(improvements.actionableRecommendations || []).map((s) => `- ${s}`),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SkillBridge_Resume_Report_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const addSkillChip = () => {
    const val = newSkillInput.trim();
    if (!val || !profileForm) return;
    setProfileForm({
      ...profileForm,
      technicalSkills: Array.from(new Set([...(profileForm.technicalSkills || []), val])),
    });
    setNewSkillInput('');
  };

  const scoreChartData = scoreBreakdown
    ? [
        { metric: 'Skills (25)', score: scoreBreakdown.technicalSkills, max: 25 },
        { metric: 'Projects (20)', score: scoreBreakdown.projects, max: 20 },
        { metric: 'Experience (20)', score: scoreBreakdown.practicalExperience, max: 20 },
        { metric: 'Education (15)', score: scoreBreakdown.education, max: 15 },
        { metric: 'Certs (10)', score: scoreBreakdown.certifications, max: 10 },
        { metric: 'Clarity (10)', score: scoreBreakdown.structureClarity, max: 10 },
      ]
    : [];

  return (
    <AppShell
      title="AI Resume Analyzer"
      subtitle="Upload a PDF or DOCX resume for real document text extraction, Gemini evaluation, and 100-point rubric scoring"
    >
      <div className="space-y-6">
        {/* Upload Zone */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-[#0B1221]">
                Upload Resume Document (.pdf or .docx)
              </h2>
              <p className="mt-1 text-xs text-slate-600">
                Server-side extraction reads your actual document text. Password-protected, corrupted, or scanned image-only files are detected and flagged cleanly.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50">
                <Upload className="h-4 w-4 text-blue-600" />
                <span>{selectedFile ? selectedFile.name : 'Choose PDF or DOCX'}</span>
                <input
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                disabled={!selectedFile || stepStatus === 'parsing' || stepStatus === 'analyzing'}
                onClick={handleUploadAndAnalyze}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {stepStatus === 'parsing'
                  ? 'Extracting Text...'
                  : stepStatus === 'analyzing'
                  ? 'Analyzing with Gemini...'
                  : 'Extract & Analyze Resume'}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {saveMessage && (
            <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-900">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{saveMessage}</span>
            </div>
          )}
        </div>

        {/* Results Dashboard */}
        {scoreBreakdown && overview && improvements && profileForm && (
          <>
            {/* Score & Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium text-slate-500">100-Point Rubric Score</p>
                    <p className="mt-1 text-4xl font-bold text-[#0B1221] tabular-nums">
                      {scoreBreakdown.overall}
                      <span className="text-lg font-medium text-slate-400"> / 100</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadReport}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download Report
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {scoreBreakdown.calculationExplanation}
                </p>

                <div className="h-56 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={scoreChartData} layout="vertical" margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" domain={[0, 25]} tick={{ fontSize: 11 }} />
                      <YAxis
                        type="category"
                        dataKey="metric"
                        width={95}
                        tick={{ fontSize: 11, fill: '#334155' }}
                      />
                      <Tooltip />
                      <Bar dataKey="score" fill="#2563EB" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-6 space-y-4">
                <h2 className="text-base font-bold text-[#0B1221]">A. Resume Overview</h2>
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="rounded-lg bg-slate-50 border border-slate-200 p-3.5">
                    <p className="text-xs font-semibold text-slate-700">Professional Summary</p>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                      {overview.professionalSummary}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 border border-slate-200 p-3.5">
                    <p className="text-xs font-semibold text-slate-700">Technical Skill Summary</p>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                      {overview.technicalSkillSummary}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-lg bg-slate-50 border border-slate-200 p-3.5">
                      <p className="text-xs font-semibold text-slate-700">Education</p>
                      <p className="mt-1 text-xs text-slate-600">{overview.educationSummary}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 border border-slate-200 p-3.5">
                      <p className="text-xs font-semibold text-slate-700">Projects</p>
                      <p className="mt-1 text-xs text-slate-600">{overview.projectSummary}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 border border-slate-200 p-3.5">
                      <p className="text-xs font-semibold text-slate-700">Experience</p>
                      <p className="mt-1 text-xs text-slate-600">{overview.experienceSummary}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* C. Resume Improvement Recommendations */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-base font-bold text-[#0B1221]">
                  C. Resume Improvement & Missing Keywords
                </h2>
                <Link
                  href="/skill-gap"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:underline"
                >
                  Run Skill Gap Analysis
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="rounded-lg border border-slate-200 p-4 space-y-2">
                  <p className="font-semibold text-slate-900">Missing Sections</p>
                  <ul className="space-y-1 text-slate-600 list-disc pl-4">
                    {(improvements.missingSections || []).length > 0 ? (
                      improvements.missingSections.map((m, i) => <li key={i}>{m}</li>)
                    ) : (
                      <li>Core sections present</li>
                    )}
                  </ul>
                </div>

                <div className="rounded-lg border border-slate-200 p-4 space-y-2">
                  <p className="font-semibold text-slate-900">Missing Technical Keywords</p>
                  <p className="text-slate-600 leading-relaxed">
                    {(improvements.missingTechnicalKeywords || []).join(' · ') || 'None flagged'}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 p-4 space-y-2">
                  <p className="font-semibold text-slate-900">Stronger Project Descriptions</p>
                  <ul className="space-y-1 text-slate-600 list-disc pl-4">
                    {(improvements.strongerProjectDescriptions || []).map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-lg border border-slate-200 p-4 space-y-2">
                  <p className="font-semibold text-slate-900">Actionable Next Steps</p>
                  <ul className="space-y-1 text-slate-600 list-disc pl-4">
                    {(improvements.actionableRecommendations || []).map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Editable Extracted Candidate Profile */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-base font-bold text-[#0B1221]">
                    Extracted Candidate Profile (Editable)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Only details supported by your uploaded resume appear below. Review or refine before saving.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={savingProfile}
                  onClick={handleSaveEditedProfile}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#0B1221] px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  <Save className="h-3.5 w-3.5" />
                  {savingProfile ? 'Saving...' : 'Save Edits to Profile'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profileForm.fullName || ''}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, fullName: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={profileForm.email || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={profileForm.phone || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                  />
                </div>
              </div>

              {/* Technical Skills Editor */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Extracted Technical Skills & Tools
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {(profileForm.technicalSkills || []).map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-800"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() =>
                          setProfileForm({
                            ...profileForm,
                            technicalSkills: profileForm.technicalSkills.filter(
                              (s) => s !== skill
                            ),
                          })
                        }
                        aria-label={`Remove ${skill}`}
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
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    placeholder="Add confirmed skill..."
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={addSkillChip}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="space-y-2">
                  <p className="font-semibold text-slate-800">Programming Languages</p>
                  <p className="text-slate-600">
                    {(profileForm.programmingLanguages || []).join(' · ') || 'None detected'}
                  </p>
                  <p className="font-semibold text-slate-800 pt-2">Frameworks & Tools</p>
                  <p className="text-slate-600">
                    {(profileForm.frameworksAndTools || []).join(' · ') || 'None detected'}
                  </p>
                  <p className="font-semibold text-slate-800 pt-2">Certifications & Achievements</p>
                  <ul className="list-disc pl-4 text-slate-600 space-y-1">
                    {[...(profileForm.certifications || []), ...(profileForm.achievements || [])]
                      .length > 0 ? (
                      [...(profileForm.certifications || []), ...(profileForm.achievements || [])].map(
                        (item, idx) => <li key={idx}>{item}</li>
                      )
                    ) : (
                      <li>None listed in resume</li>
                    )}
                  </ul>
                </div>

                <div className="space-y-3">
                  <p className="font-semibold text-slate-800">Education & Experience</p>
                  {(profileForm.education || []).map((ed, i) => (
                    <div key={i} className="rounded-lg border border-slate-200 p-3">
                      <p className="font-semibold text-slate-900">
                        {ed.degree} {ed.fieldOfStudy ? `in ${ed.fieldOfStudy}` : ''}
                      </p>
                      <p className="text-slate-500">
                        {ed.institution} · {ed.startYear}–{ed.endYear}
                      </p>
                    </div>
                  ))}
                  {[...(profileForm.workExperience || []), ...(profileForm.internships || [])].map(
                    (exp, i) => (
                      <div key={i} className="rounded-lg border border-slate-200 p-3">
                        <p className="font-semibold text-slate-900">
                          {exp.role} · {exp.organization}
                        </p>
                        <p className="text-slate-500">{exp.duration}</p>
                      </div>
                    )
                  )}
                  {(profileForm.projects || []).map((proj, i) => (
                    <div key={i} className="rounded-lg border border-slate-200 p-3">
                      <p className="font-semibold text-slate-900">{proj.title}</p>
                      <p className="text-slate-600 mt-1">{proj.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Raw Extracted Text Preview */}
            <details className="rounded-xl border border-slate-200 bg-white p-5">
              <summary className="cursor-pointer text-xs font-semibold text-slate-700">
                View Raw Extracted Document Text ({extractedText.length.toLocaleString()} characters)
              </summary>
              <pre className="mt-3 max-h-64 overflow-y-auto whitespace-pre-wrap text-xs font-mono text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-200">
                {extractedText}
              </pre>
            </details>
          </>
        )}

        {/* Saved Resume Analysis History */}
        {pastAnalyses.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
            <h2 className="text-base font-bold text-[#0B1221]">Previous Resume Analyses</h2>
            <div className="divide-y divide-slate-100">
              {pastAnalyses.map((item) => (
                <div
                  key={item.id}
                  className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-slate-900">{item.fileName}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-semibold text-blue-700 tabular-nums">
                      Score: {item.scoreBreakdown?.overall ?? 0}/100
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setOverview(item.overview);
                        setScoreBreakdown(item.scoreBreakdown);
                        setImprovements(item.improvements);
                        setFileMeta({
                          fileName: item.fileName,
                          fileType: item.fileName.toLowerCase().endsWith('.docx') ? 'docx' : 'pdf',
                          fileSize: 0,
                        });
                        if (candidateProfile) {
                          setProfileForm({
                            fullName: candidateProfile.fullName,
                            email: firebaseUser?.email || '',
                            phone: '',
                            education: candidateProfile.education || [],
                            degrees: [],
                            technicalSkills: candidateProfile.skills || [],
                            programmingLanguages: candidateProfile.programmingLanguages || [],
                            frameworksAndTools: candidateProfile.frameworksTools || [],
                            projects: candidateProfile.projects || [],
                            internships: candidateProfile.internships || [],
                            workExperience: candidateProfile.workExperience || [],
                            certifications: candidateProfile.certifications || [],
                            achievements: candidateProfile.achievements || [],
                          });
                        }
                      }}
                      className="font-semibold text-slate-700 hover:text-blue-700"
                    >
                      Load Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
