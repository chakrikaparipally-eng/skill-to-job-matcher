import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-jakarta',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-dm-sans',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains',
});

export const metadata: Metadata = {
  title: 'Skill To Job Matcher — Skill Development, Resume Intelligence & Job Matching',
  description:
    'AI-powered skill development, resume intelligence, skill-gap analysis, and real job matching platform connecting learners, job seekers, and recruiters.',
  openGraph: {
    title: 'Skill To Job Matcher — Skill Development, Resume Intelligence & Job Matching',
    description:
      'Build technical skills across 10 engineering domains, analyze PDF/DOCX resumes with Gemini AI, uncover skill gaps, and match with real vacancies.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Skill To Job Matcher',
    description:
      'Skill development, AI resume analysis, skill-gap roadmaps, and real job matching.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${dmSans.variable} ${jetbrains.variable}`}>
      <body suppressHydrationWarning>
        <ErrorBoundary>
          <AuthProvider>{children}</AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
