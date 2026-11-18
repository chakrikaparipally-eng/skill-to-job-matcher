'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Compass,
  BookOpen,
  CheckSquare,
  FileText,
  Target,
  Briefcase,
  Calendar,
  FolderKanban,
  UserCircle,
  Users,
  Menu,
  X,
  LogOut,
  LogIn,
  MailCheck,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CANDIDATE_NAV: NavItem[] = [
  { label: 'Home', href: '/dashboard', icon: Home },
  { label: 'Explore Skills', href: '/skills', icon: Compass },
  { label: 'Tutorials & Courses', href: '/courses', icon: BookOpen },
  { label: 'Practice & Quizzes', href: '/quizzes', icon: CheckSquare },
  { label: 'Resume Analyzer', href: '/resume-analyzer', icon: FileText },
  { label: 'Skill Gap Analyzer', href: '/skill-gap', icon: Target },
  { label: 'Find Jobs', href: '/jobs', icon: Briefcase },
  { label: 'My Learning Plan', href: '/learning-plan', icon: Calendar },
  { label: 'My Applications', href: '/applications', icon: FolderKanban },
  { label: 'Profile', href: '/profile', icon: UserCircle },
];

const RECRUITER_NAV: NavItem[] = [
  { label: 'Recruiter Hub', href: '/recruiter', icon: Users },
  { label: 'Explore Skills', href: '/skills', icon: Compass },
  { label: 'Tutorials & Courses', href: '/courses', icon: BookOpen },
  { label: 'Practice & Quizzes', href: '/quizzes', icon: CheckSquare },
  { label: 'Resume Analyzer', href: '/resume-analyzer', icon: FileText },
  { label: 'Skill Gap Analyzer', href: '/skill-gap', icon: Target },
  { label: 'Find Jobs', href: '/jobs', icon: Briefcase },
  { label: 'Profile', href: '/profile', icon: UserCircle },
];

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    firebaseUser,
    userAccount,
    emailNeedsVerification,
    resendVerification,
    refreshSession,
    logout,
    connectionError,
  } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState<string | null>(null);

  const isRecruiter = userAccount?.accountType === 'recruiter';
  const navItems = isRecruiter ? RECRUITER_NAV : CANDIDATE_NAV;

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleResend = async () => {
    await resendVerification();
    setVerifyMsg('Verification email sent. Check your inbox and click Refresh Status once verified.');
  };

  const handleRefresh = async () => {
    await refreshSession();
    setVerifyMsg(null);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col bg-[#0B1221] text-slate-100">
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0"
        >
          SkillBridge AI
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="lg:hidden rounded-lg p-1.5 text-slate-400 hover:text-white"
          aria-label="Close navigation menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="Workspace navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== '/' && item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800/80 p-4">
        {firebaseUser ? (
          <div className="space-y-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">
                {userAccount?.displayName || firebaseUser.displayName || 'Account'}
              </p>
              <p className="truncate text-xs text-slate-400">
                {userAccount?.accountType === 'recruiter'
                  ? 'Recruiter Account'
                  : userAccount?.accountType === 'job_seeker'
                  ? 'Job Seeker'
                  : 'Candidate / Learner'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        ) : (
          <Link
            href="/auth"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            <LogIn className="h-3.5 w-3.5" />
            Sign In / Register
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-slate-200 sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/50"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-64 h-full">{sidebarContent}</div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur px-4 sm:px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="lg:hidden rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-semibold text-slate-900 truncate">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-xs sm:text-sm text-slate-500 truncate">{subtitle}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/"
                className="hidden sm:inline-flex text-sm font-medium text-slate-600 hover:text-slate-900 whitespace-nowrap"
              >
                Overview
              </Link>
              {!firebaseUser ? (
                <Link
                  href="/auth"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#0B1221] px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
                >
                  Sign In
                </Link>
              ) : (
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
                >
                  Profile
                </Link>
              )}
            </div>
          </div>
        </header>

        {connectionError && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 text-sm text-amber-900">
            {connectionError}
          </div>
        )}

        {emailNeedsVerification && (
          <div className="bg-blue-50 border-b border-blue-200 px-4 sm:px-8 py-3">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-sm text-slate-800">
              <div className="flex items-center gap-2">
                <MailCheck className="h-4 w-4 text-blue-700 shrink-0" />
                <span>
                  Verify your email address (<strong>{firebaseUser?.email}</strong>) to unlock cloud persistence in Firestore.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResend}
                  className="rounded-lg border border-blue-300 bg-white px-3 py-1.5 text-xs font-medium text-blue-800 hover:bg-blue-100"
                >
                  Resend Email
                </button>
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Refresh Status
                </button>
              </div>
            </div>
            {verifyMsg && (
              <p className="max-w-7xl mx-auto mt-1 text-xs text-blue-700">{verifyMsg}</p>
            )}
          </div>
        )}

        <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
