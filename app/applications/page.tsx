'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trash2, ExternalLink, Briefcase, Bookmark } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { ProtectedGate } from '@/components/common/ProtectedGate';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  deleteJobApplication,
  getUserJobApplications,
  getUserSavedJobs,
  removeSavedJob,
  trackJobApplication,
  updateJobApplication,
} from '@/lib/firestore-service';
import { JobApplication, SavedJob } from '@/lib/types';

export default function ApplicationsPage() {
  const { firebaseUser } = useAuth();
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async (uid: string) => {
    setLoading(true);
    try {
      const [saved, apps] = await Promise.all([
        getUserSavedJobs(uid),
        getUserJobApplications(uid),
      ]);
      setSavedJobs(saved);
      setApplications(apps);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!firebaseUser || !firebaseUser.emailVerified) return;
    let active = true;
    Promise.all([
      getUserSavedJobs(firebaseUser.uid),
      getUserJobApplications(firebaseUser.uid),
    ])
      .then(([saved, apps]) => {
        if (!active) return;
        setSavedJobs(saved);
        setApplications(apps);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [firebaseUser]);

  const moveSavedToApplied = async (job: SavedJob) => {
    if (!firebaseUser) return;
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
    await loadData(firebaseUser.uid);
  };

  const handleStatusChange = async (app: JobApplication, status: JobApplication['status']) => {
    if (!app.id || !firebaseUser) return;
    await updateJobApplication(app.id, status, app.notes || '');
    setApplications((prev) =>
      prev.map((a) => (a.id === app.id ? { ...a, status } : a))
    );
  };

  const handleNotesBlur = async (app: JobApplication, notes: string) => {
    if (!app.id) return;
    await updateJobApplication(app.id, app.status, notes);
  };

  return (
    <AppShell
      title="My Applications & Saved Jobs"
      subtitle="Track job bookmarks, application statuses, and interview notes in Firestore"
    >
      <ProtectedGate>
        <div className="space-y-8">
          {/* Application Pipeline */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-base font-bold text-[#0B1221]">
                Tracked Applications ({applications.length})
              </h2>
              <Link
                href="/jobs"
                className="text-xs font-semibold text-blue-700 hover:underline"
              >
                Find More Jobs
              </Link>
            </div>

            {loading ? (
              <p className="text-xs text-slate-500">Loading applications...</p>
            ) : applications.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center">
                <Briefcase className="mx-auto h-7 w-7 text-slate-400" />
                <p className="mt-2 text-sm font-medium text-slate-800">
                  No tracked applications yet
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Search real jobs and click Track Application to monitor progress here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="py-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center"
                  >
                    <div className="lg:col-span-4">
                      <p className="text-sm font-bold text-[#0B1221]">{app.title}</p>
                      <p className="text-xs text-slate-600">
                        {app.company} {app.location ? `· ${app.location}` : ''}
                      </p>
                    </div>

                    <div className="lg:col-span-2">
                      <select
                        value={app.status}
                        onChange={(e) =>
                          handleStatusChange(app, e.target.value as JobApplication['status'])
                        }
                        aria-label={`Application status for ${app.title}`}
                        className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800"
                      >
                        <option value="saved">Saved</option>
                        <option value="applied">Applied</option>
                        <option value="interviewing">Interviewing</option>
                        <option value="offer">Offer</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>

                    <div className="lg:col-span-4">
                      <input
                        type="text"
                        defaultValue={app.notes || ''}
                        onBlur={(e) => handleNotesBlur(app, e.target.value)}
                        placeholder="Add interview or follow-up notes..."
                        className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800"
                      />
                    </div>

                    <div className="lg:col-span-2 flex items-center justify-end gap-2">
                      {app.applyUrl && (
                        <a
                          href={app.applyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:text-blue-700"
                          aria-label="Open original job posting"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={async () => {
                          if (!app.id || !firebaseUser) return;
                          await deleteJobApplication(app.id);
                          loadData(firebaseUser.uid);
                        }}
                        className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:text-rose-700"
                        aria-label="Remove application"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Bookmarked / Saved Jobs */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <h2 className="text-base font-bold text-[#0B1221]">
              Bookmarked Vacancies ({savedJobs.length})
            </h2>
            {savedJobs.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center">
                <Bookmark className="mx-auto h-7 w-7 text-slate-400" />
                <p className="mt-2 text-xs text-slate-500">No bookmarked jobs yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedJobs.map((job) => (
                  <div
                    key={job.id}
                    className="rounded-lg border border-slate-200 p-4 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <p className="text-xs text-blue-700 font-medium">
                        {job.source} {job.matchScore !== undefined ? `· Match ${job.matchScore}%` : ''}
                      </p>
                      <h3 className="mt-1 text-sm font-bold text-[#0B1221]">{job.title}</h3>
                      <p className="text-xs text-slate-600">
                        {job.company} {job.location ? `· ${job.location}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => moveSavedToApplied(job)}
                        className="rounded-lg bg-[#0B1221] px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        Mark Applied
                      </button>
                      <div className="flex items-center gap-2">
                        {job.applyUrl && (
                          <a
                            href={job.applyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-blue-700 hover:underline"
                          >
                            Apply Link
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={async () => {
                            if (!job.id || !firebaseUser) return;
                            await removeSavedJob(job.id);
                            loadData(firebaseUser.uid);
                          }}
                          className="text-xs text-slate-500 hover:text-rose-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </ProtectedGate>
    </AppShell>
  );
}
