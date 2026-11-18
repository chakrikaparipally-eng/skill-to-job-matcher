'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { AccountType } from '@/lib/types';

export function ProtectedGate({
  requiredRole,
  children,
}: {
  requiredRole?: AccountType | AccountType[];
  children: React.ReactNode;
}) {
  const { firebaseUser, userAccount, loading, emailNeedsVerification } = useAuth();

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
        <p className="mt-4 text-sm text-slate-500">Checking authenticated session...</p>
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 max-w-xl mx-auto text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          <Lock className="h-5 w-5" />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-slate-900">Sign in required</h2>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          This workspace saves your private progress, resumes, applications, and roadmap securely to your Firestore account.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Sign In or Create Account
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/skills"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Browse 10 Skills
          </Link>
        </div>
      </div>
    );
  }

  if (emailNeedsVerification) {
    return (
      <div className="rounded-xl border border-blue-200 bg-white p-10 max-w-xl mx-auto text-center">
        <h2 className="text-xl font-semibold text-slate-900">Verify your email to continue</h2>
        <p className="mt-2 text-sm text-slate-600">
          We sent a verification link to <strong>{firebaseUser.email}</strong>. Click the link in your inbox, then click Refresh Status in the top banner.
        </p>
      </div>
    );
  }

  if (requiredRole && userAccount) {
    const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!allowed.includes(userAccount.accountType)) {
      return (
        <div className="rounded-xl border border-slate-200 bg-white p-10 max-w-xl mx-auto text-center">
          <h2 className="text-xl font-semibold text-slate-900">Role Permission Required</h2>
          <p className="mt-2 text-sm text-slate-600">
            Your current account role is <strong>{userAccount.accountType}</strong>. Switch your account role in Profile settings if you wish to access this section.
          </p>
          <Link
            href="/profile"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Manage Role in Profile
          </Link>
        </div>
      );
    }
  }

  return <>{children}</>;
}
