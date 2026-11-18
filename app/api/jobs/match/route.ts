import { NextRequest, NextResponse } from 'next/server';
import { Type } from '@google/genai';
import { z } from 'zod';
import { GEMINI_MODEL, getGeminiClient } from '@/lib/gemini';

export const runtime = 'nodejs';

const JobMatchSchema = z.object({
  candidateSummary: z.object({
    skills: z.array(z.string()).max(80),
    education: z.string().max(1000).optional().default(''),
    experience: z.string().max(2000).optional().default(''),
    targetRole: z.string().max(160).optional().default(''),
  }),
  jobs: z
    .array(
      z.object({
        jobKey: z.string(),
        title: z.string(),
        company: z.string(),
        requiredSkills: z.array(z.string()).optional().default([]),
        preferredSkills: z.array(z.string()).optional().default([]),
        description: z.string().max(4000),
      })
    )
    .min(1)
    .max(15),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = JobMatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid job matching request.', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { candidateSummary, jobs } = parsed.data;
    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Candidate Profile:
- Skills: ${candidateSummary.skills.join(', ') || 'None specified'}
- Education: ${candidateSummary.education || 'Not specified'}
- Experience: ${candidateSummary.experience || 'Not specified'}
- Target Role: ${candidateSummary.targetRole || 'Not specified'}

Evaluate compatibility for each of these real job listings:
${jobs
  .map(
    (j, idx) =>
      `[${idx + 1}] jobKey="${j.jobKey}" | Title: ${j.title} | Company: ${j.company} | Required: ${j.requiredSkills.join(', ')} | Preferred: ${j.preferredSkills.join(', ')} | Description: ${j.description.slice(0, 900)}`
  )
  .join('\n\n')}`,
      config: {
        systemInstruction: `You are an objective candidate-to-job compatibility evaluator.
For each jobKey, score 0–100 on:
- requiredSkillMatch
- preferredSkillMatch
- educationRelevance
- experienceRelevance
- overallCompatibility
Assign suitabilityTier strictly from:
- "highly_suitable" (overallCompatibility >= 75)
- "partially_suitable" (overallCompatibility 45–74)
- "additional_skills_required" (overallCompatibility < 45)
Provide concrete matchedSkills, missingSkills, and a crisp 1–2 sentence grounded explanation referencing actual skills.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              jobKey: { type: Type.STRING },
              requiredSkillMatch: { type: Type.INTEGER },
              preferredSkillMatch: { type: Type.INTEGER },
              educationRelevance: { type: Type.INTEGER },
              experienceRelevance: { type: Type.INTEGER },
              overallCompatibility: { type: Type.INTEGER },
              suitabilityTier: { type: Type.STRING },
              explanation: { type: Type.STRING },
              matchedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
              missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
          },
        },
      },
    });

    const raw = (response.text ?? '[]').trim();
    const evaluations = JSON.parse(raw);

    return NextResponse.json({ evaluations });
  } catch (error) {
    console.error('Job match error:', error);
    const message = error instanceof Error ? error.message : 'Failed to score job matches.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
