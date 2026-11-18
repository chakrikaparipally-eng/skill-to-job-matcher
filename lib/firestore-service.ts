'use client';

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  runTransaction,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  AccountType,
  CandidateProfile,
  JobApplication,
  JobListing,
  LearningProgress,
  ParsedResumeProfile,
  QuizResult,
  RecruiterProfile,
  RecruiterShortlist,
  ResumeAnalysis,
  ResumeDocument,
  SavedJob,
  SkillGapReport,
  UserAccount,
} from './types';

export function sanitizeId(raw: string, fallbackPrefix = 'doc'): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
  return cleaned.length > 0 ? cleaned : `${fallbackPrefix}_${Date.now()}`;
}

export function cleanStringList(items: string[] | undefined, maxItems: number, maxLen = 120): string[] {
  if (!Array.isArray(items)) return [];
  return Array.from(
    new Set(
      items
        .map((s) => String(s || '').trim().slice(0, maxLen))
        .filter(Boolean)
    )
  ).slice(0, maxItems);
}

// 1. User Account
export async function getUserAccount(uid: string): Promise<UserAccount | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? (snap.data() as UserAccount) : null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function ensureUserAccount(params: {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  accountType: AccountType;
}): Promise<UserAccount> {
  const path = `users/${params.uid}`;
  try {
    const ref = doc(db, 'users', params.uid);
    const result = await runTransaction(db, async (tx) => {
      const existing = await tx.get(ref);
      if (existing.exists()) {
        return existing.data() as UserAccount;
      }
      const payload: Record<string, unknown> = {
        uid: params.uid,
        displayName: params.displayName.trim().slice(0, 120) || 'Skill To Job Matcher User',
        email: params.email.trim().slice(0, 254),
        accountType: params.accountType,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      if (params.photoURL) {
        payload.photoURL = params.photoURL.slice(0, 1000);
      }
      tx.set(ref, payload);
      return null;
    });
    if (result) return result;
    const created = await getDoc(ref);
    return created.data() as UserAccount;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function updateUserAccountType(uid: string, accountType: AccountType): Promise<void> {
  const path = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), {
      accountType,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

// 2. Candidate Profile
export async function getCandidateProfile(uid: string): Promise<CandidateProfile | null> {
  const path = `candidateProfiles/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'candidateProfiles', uid));
    return snap.exists() ? (snap.data() as CandidateProfile) : null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function saveCandidateProfile(
  uid: string,
  profile: Omit<CandidateProfile, 'uid' | 'createdAt' | 'updatedAt'>
): Promise<void> {
  const path = `candidateProfiles/${uid}`;
  try {
    const ref = doc(db, 'candidateProfiles', uid);
    const payload: Record<string, unknown> = {
      uid,
      fullName: (profile.fullName || 'Candidate').trim().slice(0, 120),
      headline: (profile.headline || '').trim().slice(0, 200),
      location: (profile.location || '').trim().slice(0, 120),
      targetRole: (profile.targetRole || '').trim().slice(0, 120),
      education: (profile.education || []).slice(0, 10),
      skills: cleanStringList(profile.skills, 60),
      programmingLanguages: cleanStringList(profile.programmingLanguages, 30),
      frameworksTools: cleanStringList(profile.frameworksTools, 40),
      projects: (profile.projects || []).slice(0, 15),
      internships: (profile.internships || []).slice(0, 15),
      workExperience: (profile.workExperience || []).slice(0, 15),
      certifications: cleanStringList(profile.certifications, 20),
      achievements: cleanStringList(profile.achievements, 20),
      shareWithRecruiters: Boolean(profile.shareWithRecruiters),
      updatedAt: serverTimestamp(),
    };
    if (typeof profile.resumeScore === 'number') {
      payload.resumeScore = Math.max(0, Math.min(100, Math.round(profile.resumeScore)));
    }
    await runTransaction(db, async (tx) => {
      const existing = await tx.get(ref);
      if (existing.exists()) {
        const { uid: _u, ...updateFields } = payload;
        void _u;
        tx.update(ref, updateFields);
      } else {
        tx.set(ref, {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function searchSharedCandidates(): Promise<CandidateProfile[]> {
  const path = 'candidateProfiles';
  try {
    const q = query(
      collection(db, 'candidateProfiles'),
      where('shareWithRecruiters', '==', true),
      limit(50)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as CandidateProfile);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

// 3. Recruiter Profile
export async function getRecruiterProfile(uid: string): Promise<RecruiterProfile | null> {
  const path = `recruiterProfiles/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'recruiterProfiles', uid));
    return snap.exists() ? (snap.data() as RecruiterProfile) : null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function saveRecruiterProfile(
  uid: string,
  profile: Omit<RecruiterProfile, 'uid' | 'createdAt' | 'updatedAt'>
): Promise<void> {
  const path = `recruiterProfiles/${uid}`;
  try {
    const ref = doc(db, 'recruiterProfiles', uid);
    const payload = {
      uid,
      recruiterName: (profile.recruiterName || 'Recruiter').trim().slice(0, 120),
      companyName: (profile.companyName || 'Company').trim().slice(0, 160),
      companyWebsite: (profile.companyWebsite || '').trim().slice(0, 500),
      industry: (profile.industry || '').trim().slice(0, 100),
      companySize: (profile.companySize || '').trim().slice(0, 60),
      location: (profile.location || '').trim().slice(0, 120),
      description: (profile.description || '').trim().slice(0, 2000),
      updatedAt: serverTimestamp(),
    };
    await runTransaction(db, async (tx) => {
      const existing = await tx.get(ref);
      if (existing.exists()) {
        const { uid: _u, ...updateFields } = payload;
        void _u;
        tx.update(ref, updateFields);
      } else {
        tx.set(ref, { ...payload, createdAt: serverTimestamp() });
      }
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// 4 & 5. Resumes & Resume Analyses
export async function saveResumeAndAnalysis(params: {
  uid: string;
  fileName: string;
  fileType: 'pdf' | 'docx';
  fileSize: number;
  extractedText: string;
  parsedProfile: ParsedResumeProfile;
  overview: ResumeAnalysis['overview'];
  scoreBreakdown: ResumeAnalysis['scoreBreakdown'];
  improvements: ResumeAnalysis['improvements'];
}): Promise<{ resumeId: string; analysisId: string }> {
  const stamp = Date.now();
  const resumeId = sanitizeId(`res_${params.uid.slice(0, 12)}_${stamp}`);
  const analysisId = sanitizeId(`ana_${params.uid.slice(0, 12)}_${stamp}`);

  try {
    await setDoc(doc(db, 'resumes', resumeId), {
      uid: params.uid,
      fileName: params.fileName.slice(0, 255),
      fileType: params.fileType,
      fileSize: Math.max(1, Math.min(params.fileSize, 10485760)),
      extractedText: params.extractedText.slice(0, 95000),
      parsedProfile: params.parsedProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `resumes/${resumeId}`);
  }

  try {
    await setDoc(doc(db, 'resumeAnalyses', analysisId), {
      uid: params.uid,
      resumeId,
      fileName: params.fileName.slice(0, 255),
      overview: params.overview,
      scoreBreakdown: params.scoreBreakdown,
      improvements: params.improvements,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `resumeAnalyses/${analysisId}`);
  }

  return { resumeId, analysisId };
}

export async function getUserResumes(uid: string): Promise<ResumeDocument[]> {
  try {
    const q = query(
      collection(db, 'resumes'),
      where('uid', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ResumeDocument, 'id'>) }));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'resumes');
  }
}

export async function getUserResumeAnalyses(uid: string): Promise<ResumeAnalysis[]> {
  try {
    const q = query(
      collection(db, 'resumeAnalyses'),
      where('uid', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ResumeAnalysis, 'id'>) }));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'resumeAnalyses');
  }
}

// 10. Quiz Results
export async function saveQuizResult(
  result: Omit<QuizResult, 'id' | 'createdAt'>
): Promise<string> {
  const resultId = sanitizeId(`quiz_${result.uid.slice(0, 10)}_${Date.now()}`);
  try {
    await setDoc(doc(db, 'quizResults', resultId), {
      uid: result.uid,
      skillId: sanitizeId(result.skillId),
      skillTitle: result.skillTitle.slice(0, 160),
      quizId: sanitizeId(result.quizId),
      difficulty: result.difficulty,
      totalQuestions: result.totalQuestions,
      correctAnswers: result.correctAnswers,
      incorrectAnswers: result.incorrectAnswers,
      percentage: Math.round(result.percentage),
      strongTopics: cleanStringList(result.strongTopics, 30),
      weakTopics: cleanStringList(result.weakTopics, 30),
      recommendedTopics: cleanStringList(result.recommendedTopics, 30),
      timeSpentSeconds: Math.max(0, Math.round(result.timeSpentSeconds || 0)),
      createdAt: serverTimestamp(),
    });
    return resultId;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `quizResults/${resultId}`);
  }
}

export async function getUserQuizResults(uid: string): Promise<QuizResult[]> {
  try {
    const q = query(
      collection(db, 'quizResults'),
      where('uid', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(40)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<QuizResult, 'id'>) }));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'quizResults');
  }
}

// 11. Learning Progress & Personalized Roadmap
export async function getUserLearningProgress(uid: string): Promise<LearningProgress[]> {
  try {
    const q = query(
      collection(db, 'learningProgress'),
      where('uid', '==', uid),
      limit(30)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<LearningProgress, 'id'>) }));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'learningProgress');
  }
}

export async function upsertLearningProgress(
  uid: string,
  skillId: string,
  updates: Partial<Omit<LearningProgress, 'id' | 'uid' | 'skillId' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const docId = sanitizeId(`${uid.slice(0, 20)}_${skillId}`);
  const path = `learningProgress/${docId}`;
  try {
    const ref = doc(db, 'learningProgress', docId);
    await runTransaction(db, async (tx) => {
      const existing = await tx.get(ref);
      if (existing.exists()) {
        const prev = existing.data() as LearningProgress;
        const merged: Record<string, unknown> = {
          completedLessonIds: cleanStringList(
            updates.completedLessonIds ?? prev.completedLessonIds,
            100
          ),
          completionPercentage:
            updates.completionPercentage ?? prev.completionPercentage ?? 0,
          badgeEarned: updates.badgeEarned ?? prev.badgeEarned ?? false,
          updatedAt: serverTimestamp(),
        };
        if (updates.weeklyGoals !== undefined) merged.weeklyGoals = updates.weeklyGoals.slice(0, 30);
        if (updates.dailyActivities !== undefined) merged.dailyActivities = updates.dailyActivities.slice(0, 60);
        if (updates.customRoadmap !== undefined) merged.customRoadmap = updates.customRoadmap.slice(0, 24);
        if (updates.targetRole !== undefined) merged.targetRole = updates.targetRole.slice(0, 120);
        tx.update(ref, merged);
      } else {
        const createPayload: Record<string, unknown> = {
          uid,
          skillId: sanitizeId(skillId),
          completedLessonIds: cleanStringList(updates.completedLessonIds || [], 100),
          completionPercentage: updates.completionPercentage ?? 0,
          badgeEarned: updates.badgeEarned ?? false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        if (updates.weeklyGoals) createPayload.weeklyGoals = updates.weeklyGoals.slice(0, 30);
        if (updates.dailyActivities) createPayload.dailyActivities = updates.dailyActivities.slice(0, 60);
        if (updates.customRoadmap) createPayload.customRoadmap = updates.customRoadmap.slice(0, 24);
        if (updates.targetRole) createPayload.targetRole = updates.targetRole.slice(0, 120);
        tx.set(ref, createPayload);
      }
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// 12. Job Listings (Recruiter-published)
export async function getOpenJobListings(): Promise<JobListing[]> {
  try {
    const q = query(
      collection(db, 'jobListings'),
      where('status', '==', 'open'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<JobListing, 'id'>) }));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'jobListings');
  }
}

export async function getRecruiterJobListings(recruiterId: string): Promise<JobListing[]> {
  try {
    const q = query(
      collection(db, 'jobListings'),
      where('recruiterId', '==', recruiterId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<JobListing, 'id'>) }));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'jobListings');
  }
}

export async function createJobListing(
  recruiterId: string,
  job: Omit<JobListing, 'id' | 'recruiterId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const jobId = sanitizeId(`job_${recruiterId.slice(0, 10)}_${Date.now()}`);
  try {
    await setDoc(doc(db, 'jobListings', jobId), {
      recruiterId,
      title: job.title.trim().slice(0, 160),
      companyName: job.companyName.trim().slice(0, 160),
      location: job.location.trim().slice(0, 160),
      workMode: job.workMode,
      employmentType: job.employmentType,
      experienceLevel: job.experienceLevel,
      salaryRange: (job.salaryRange || '').trim().slice(0, 100),
      requiredSkills: cleanStringList(job.requiredSkills, 30),
      preferredSkills: cleanStringList(job.preferredSkills, 30),
      description: job.description.trim().slice(0, 10000),
      applyUrl: (job.applyUrl || '').trim().slice(0, 1000),
      status: job.status || 'open',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return jobId;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `jobListings/${jobId}`);
  }
}

export async function updateJobListingStatus(
  jobId: string,
  status: 'open' | 'closed'
): Promise<void> {
  try {
    await updateDoc(doc(db, 'jobListings', jobId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `jobListings/${jobId}`);
  }
}

export async function deleteJobListing(jobId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'jobListings', jobId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `jobListings/${jobId}`);
  }
}

// 13 & 14. Saved Jobs & Job Applications
export async function getUserSavedJobs(uid: string): Promise<SavedJob[]> {
  try {
    const q = query(
      collection(db, 'savedJobs'),
      where('uid', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<SavedJob, 'id'>) }));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'savedJobs');
  }
}

export async function saveJobBookmark(job: Omit<SavedJob, 'id' | 'createdAt'>): Promise<string> {
  const savedId = sanitizeId(`${job.uid.slice(0, 12)}_${job.jobKey}`);
  try {
    const payload: Record<string, unknown> = {
      uid: job.uid,
      jobKey: job.jobKey.slice(0, 160),
      title: job.title.slice(0, 200),
      company: job.company.slice(0, 160),
      location: (job.location || '').slice(0, 160),
      salary: (job.salary || '').slice(0, 120),
      source: job.source.slice(0, 80),
      applyUrl: (job.applyUrl || '').slice(0, 1000),
      description: (job.description || '').slice(0, 5000),
      createdAt: serverTimestamp(),
    };
    if (typeof job.matchScore === 'number') {
      payload.matchScore = Math.max(0, Math.min(100, Math.round(job.matchScore)));
    }
    await setDoc(doc(db, 'savedJobs', savedId), payload);
    return savedId;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `savedJobs/${savedId}`);
  }
}

export async function removeSavedJob(savedId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'savedJobs', savedId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `savedJobs/${savedId}`);
  }
}

export async function getUserJobApplications(uid: string): Promise<JobApplication[]> {
  try {
    const q = query(
      collection(db, 'jobApplications'),
      where('uid', '==', uid),
      orderBy('updatedAt', 'desc'),
      limit(50)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<JobApplication, 'id'>) }));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'jobApplications');
  }
}

export async function trackJobApplication(
  app: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const appId = sanitizeId(`app_${app.uid.slice(0, 12)}_${app.jobKey}`);
  try {
    const ref = doc(db, 'jobApplications', appId);
    await runTransaction(db, async (tx) => {
      const existing = await tx.get(ref);
      if (existing.exists()) {
        tx.update(ref, {
          status: app.status,
          notes: (app.notes || '').slice(0, 2000),
          updatedAt: serverTimestamp(),
        });
      } else {
        tx.set(ref, {
          uid: app.uid,
          jobKey: app.jobKey.slice(0, 160),
          title: app.title.slice(0, 200),
          company: app.company.slice(0, 160),
          location: (app.location || '').slice(0, 160),
          source: (app.source || '').slice(0, 80),
          applyUrl: (app.applyUrl || '').slice(0, 1000),
          status: app.status,
          notes: (app.notes || '').slice(0, 2000),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    });
    return appId;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `jobApplications/${appId}`);
  }
}

export async function updateJobApplication(
  appId: string,
  status: JobApplication['status'],
  notes: string
): Promise<void> {
  try {
    await updateDoc(doc(db, 'jobApplications', appId), {
      status,
      notes: notes.slice(0, 2000),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `jobApplications/${appId}`);
  }
}

export async function deleteJobApplication(appId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'jobApplications', appId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `jobApplications/${appId}`);
  }
}

// 15. Skill Gap Reports
export async function saveSkillGapReport(
  report: Omit<SkillGapReport, 'id' | 'createdAt'>
): Promise<string> {
  const reportId = sanitizeId(`gap_${report.uid.slice(0, 10)}_${Date.now()}`);
  try {
    await setDoc(doc(db, 'skillGapReports', reportId), {
      uid: report.uid,
      targetRole: report.targetRole.slice(0, 160),
      matchedSkills: cleanStringList(report.matchedSkills, 60),
      missingSkills: cleanStringList(report.missingSkills, 60),
      uncertainSkills: cleanStringList(report.uncertainSkills, 40),
      additionalSkills: cleanStringList(report.additionalSkills, 60),
      matchPercentage: Math.max(0, Math.min(100, Math.round(report.matchPercentage))),
      missingSkillPlans: (report.missingSkillPlans || []).slice(0, 30),
      createdAt: serverTimestamp(),
    });
    return reportId;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `skillGapReports/${reportId}`);
  }
}

export async function getUserSkillGapReports(uid: string): Promise<SkillGapReport[]> {
  try {
    const q = query(
      collection(db, 'skillGapReports'),
      where('uid', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(15)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<SkillGapReport, 'id'>) }));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'skillGapReports');
  }
}

// 16. Recruiter Shortlists
export async function getRecruiterShortlists(recruiterId: string): Promise<RecruiterShortlist[]> {
  try {
    const q = query(
      collection(db, 'recruiterShortlists'),
      where('recruiterId', '==', recruiterId),
      orderBy('updatedAt', 'desc'),
      limit(50)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<RecruiterShortlist, 'id'>) }));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'recruiterShortlists');
  }
}

export async function upsertRecruiterShortlist(
  entry: Omit<RecruiterShortlist, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const shortlistId = sanitizeId(
    `sl_${entry.recruiterId.slice(0, 10)}_${entry.candidateUid.slice(0, 16)}`
  );
  try {
    const ref = doc(db, 'recruiterShortlists', shortlistId);
    await runTransaction(db, async (tx) => {
      const existing = await tx.get(ref);
      if (existing.exists()) {
        tx.update(ref, {
          status: entry.status,
          notes: (entry.notes || '').slice(0, 2000),
          matchPercentage: Math.max(0, Math.min(100, Math.round(entry.matchPercentage ?? 0))),
          updatedAt: serverTimestamp(),
        });
      } else {
        tx.set(ref, {
          recruiterId: entry.recruiterId,
          candidateUid: entry.candidateUid,
          candidateName: entry.candidateName.slice(0, 120),
          targetRole: (entry.targetRole || '').slice(0, 120),
          jobId: (entry.jobId || '').slice(0, 128),
          jobTitle: (entry.jobTitle || '').slice(0, 160),
          matchPercentage: Math.max(0, Math.min(100, Math.round(entry.matchPercentage ?? 0))),
          status: entry.status,
          notes: (entry.notes || '').slice(0, 2000),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    });
    return shortlistId;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `recruiterShortlists/${shortlistId}`);
  }
}

export async function removeRecruiterShortlist(shortlistId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'recruiterShortlists', shortlistId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `recruiterShortlists/${shortlistId}`);
  }
}
