'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Mail, KeyRound, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth, formatAuthError } from '@/components/providers/AuthProvider';
import { AccountType } from '@/lib/types';

function AuthFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    firebaseUser,
    userAccount,
    emailNeedsVerification,
    signInWithGoogle,
    registerWithEmail,
    loginWithEmail,
    sendPasswordReset,
    resendVerification,
    refreshSession,
  } = useAuth();

  const initialMode = searchParams.get('mode') === 'login' ? 'login' : 'register';
  const initialRoleParam = searchParams.get('role');
  const defaultRole: AccountType =
    initialRoleParam === 'recruiter'
      ? 'recruiter'
      : initialRoleParam === 'job_seeker'
      ? 'job_seeker'
      : 'learner';

  const [mode, setMode] = useState<'login' | 'register' | 'reset'>(initialMode);
  const [accountType, setAccountType] = useState<AccountType>(defaultRole);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (firebaseUser && firebaseUser.emailVerified && userAccount) {
      router.push(userAccount.accountType === 'recruiter' ? '/recruiter' : '/dashboard');
    }
  }, [firebaseUser, userAccount, router]);

  const handleGoogle = async () => {
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      await signInWithGoogle(accountType);
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      if (mode === 'reset') {
        if (!email.trim()) throw new Error('Enter your email address to reset your password.');
        await sendPasswordReset(email.trim());
        setNotice('Password reset link sent. Check your inbox.');
      } else if (mode === 'login') {
        await loginWithEmail(email.trim(), password);
      } else {
        if (!displayName.trim()) throw new Error('Please enter your full name.');
        const res = await registerWithEmail({
          email: email.trim(),
          password,
          displayName: displayName.trim(),
          accountType,
        });
        if (res.requiresVerification) {
          setNotice(
            'Account created! We sent a verification link to your email. Please verify your email and click Refresh Status below.'
          );
        }
      }
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-[#0B1221] whitespace-nowrap"
          >
            SkillBridge AI
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {emailNeedsVerification ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-blue-700">
                <CheckCircle2 className="h-5 w-5" />
                <h1 className="text-xl font-bold text-slate-900">Verify Your Email</h1>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Your account <strong>{firebaseUser?.email}</strong> is signed in, and a verification email has been sent. Open the link in your inbox, then click Refresh Status to unlock your Firestore dashboard.
              </p>
              {notice && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900">
                  {notice}
                </div>
              )}
              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => refreshSession()}
                  className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  I Have Verified — Refresh Status
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await resendVerification();
                    setNotice('Verification email resent.');
                  }}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Resend Verification Email
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                    setNotice(null);
                  }}
                  className={`flex-1 rounded-md py-2 text-xs font-semibold transition-colors ${
                    mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                    setNotice(null);
                  }}
                  className={`flex-1 rounded-md py-2 text-xs font-semibold transition-colors ${
                    mode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Create Account
                </button>
              </div>

              <h1 className="mt-6 text-2xl font-bold text-[#0B1221]">
                {mode === 'login'
                  ? 'Welcome back'
                  : mode === 'register'
                  ? 'Create your SkillBridge account'
                  : 'Reset your password'}
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                {mode === 'reset'
                  ? 'Enter your email address and we will send a password reset link.'
                  : 'Choose your account type and continue with Google or email.'}
              </p>

              {mode !== 'reset' && (
                <div className="mt-5">
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Account Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { id: 'learner', label: 'Learner' },
                        { id: 'job_seeker', label: 'Job Seeker' },
                        { id: 'recruiter', label: 'Recruiter' },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAccountType(opt.id)}
                        className={`rounded-lg border px-2.5 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                          accountType === opt.id
                            ? 'border-blue-600 bg-blue-50 text-blue-800'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {mode !== 'reset' && (
                <div className="mt-5">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={handleGoogle}
                    className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors disabled:opacity-60"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
                      />
                    </svg>
                    Continue with Google
                  </button>

                  <div className="my-5 flex items-center gap-3">
                    <div className="h-px flex-1 bg-slate-200" />
                    <span className="text-xs text-slate-400">or with email</span>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Alex Rivera"
                        className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                {mode !== 'reset' && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-medium text-slate-700">
                        Password
                      </label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => {
                            setMode('reset');
                            setError(null);
                          }}
                          className="text-xs font-medium text-blue-700 hover:underline"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

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

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full rounded-lg bg-[#0B1221] px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors disabled:opacity-60"
                >
                  {busy
                    ? 'Please wait...'
                    : mode === 'login'
                    ? 'Sign In'
                    : mode === 'register'
                    ? 'Create Account'
                    : 'Send Reset Link'}
                </button>

                {mode === 'reset' && (
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="w-full text-center text-xs font-medium text-slate-600 hover:text-slate-900"
                  >
                    Back to Sign In
                  </button>
                )}
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC]" />}>
      <AuthFormContent />
    </Suspense>
  );
}
