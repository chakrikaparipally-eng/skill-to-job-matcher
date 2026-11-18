import React from 'react';
import { ALL_SKILLS } from '@/lib/curriculum';
import { SkillDetailClient } from '@/components/skills/SkillDetailClient';

export function generateStaticParams() {
  return ALL_SKILLS.map((skill) => ({ slug: skill.slug }));
}

export default async function SkillDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <SkillDetailClient slug={slug} />;
}
