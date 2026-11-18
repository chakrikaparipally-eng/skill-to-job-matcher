import { NextRequest, NextResponse } from 'next/server';
import { Type } from '@google/genai';
import { z } from 'zod';
import { GEMINI_MODEL, getGeminiClient } from '@/lib/gemini';

export const runtime = 'nodejs';

const SkillGapSchema = z.object({
  candidateSkills: z.array(z.string()).max(80),
  confirmedSkills: z.array(z.string()).max(40).optional().default([]),
  targetRole: z.string().min(2).max(160),
  jobDescription: z.string().max(15000).optional().default(''),
  requiredSkills: z.array(z.string()).max(40).optional().default([]),
  preferredSkills: z.array(z.string()).max(40).optional().default([]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SkillGapSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid skill-gap analysis request.', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      candidateSkills,
      confirmedSkills,
      targetRole,
      jobDescription,
      requiredSkills,
      preferredSkills,
    } = parsed.data;

    const allKnownSkills = Array.from(
      new Set([...candidateSkills, ...confirmedSkills].map((s) => s.trim()).filter(Boolean))
    );

    const ai = getGeminiClient();

    const systemInstruction = `You are a precision technical career and skill-gap analyst.
RULES:
1. Compare the candidate's evidenced skills against the target role and job description.
2. Recognize common technical aliases (e.g., "JS" = "JavaScript", "Postgres" = "PostgreSQL", "K8s" = "Kubernetes").
3. Separate findings into FOUR clear lists:
   - matchedSkills: Job skills clearly matched by the candidate's evidenced skills.
   - missingSkills: Job-required/preferred skills clearly not yet demonstrated.
   - uncertainSkills: Skills where the candidate has closely adjacent experience (e.g., candidate lists React/Next.js so HTML/CSS or JavaScript may be known even if not written verbatim) — NEVER claim an unmentioned skill is absent knowledge without flagging it as needing confirmation!
   - additionalSkills: Valuable technical skills the candidate already has that go beyond the job requirements.
4. For EVERY item in missingSkills, produce a detailed learning plan with real official documentation or respected free learning URLs (MDN, Python.org, Scikit-learn.org, React.dev, Kubernetes.io, freeCodeCamp, Kaggle Learn, Coursera/DeepLearning.AI).
5. Also generate a transparent 6-to-8 week personalized improvement roadmap tailored to the candidate's existing skills and missing skills.`;

    const prompt = `Target Role: ${targetRole}
Candidate Evidenced Skills: ${allKnownSkills.length ? allKnownSkills.join(', ') : 'None listed yet'}
Explicit Required Skills: ${requiredSkills.length ? requiredSkills.join(', ') : 'Infer from job description / industry standard for target role'}
Explicit Preferred Skills: ${preferredSkills.length ? preferredSkills.join(', ') : 'None specified'}
Job Description:
${jobDescription || 'No extra description provided; evaluate against standard industry requirements for ' + targetRole}`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            extractedRequiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            extractedPreferredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            matchedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            uncertainSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            additionalSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            matchFormulaNote: { type: Type.STRING },
            missingSkillPlans: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  skill: { type: Type.STRING },
                  whyRequired: { type: Type.STRING },
                  roadmapSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
                  recommendedCourses: { type: Type.ARRAY, items: { type: Type.STRING } },
                  freeResources: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        url: { type: Type.STRING },
                      },
                    },
                  },
                  estimatedLearningTime: { type: Type.STRING },
                  practiceExercises: { type: Type.ARRAY, items: { type: Type.STRING } },
                  miniProjectSuggestion: { type: Type.STRING },
                },
              },
            },
            personalizedRoadmap: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  week: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  focusSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                  tasks: { type: Type.ARRAY, items: { type: Type.STRING } },
                  milestone: { type: Type.STRING },
                },
              },
            },
          },
        },
      },
    });

    const rawText = (response.text ?? '').trim();
    if (!rawText) {
      return NextResponse.json({ error: 'Gemini returned an empty skill-gap analysis.' }, { status: 502 });
    }

    const result = JSON.parse(rawText);
    const matchedCount = Array.isArray(result.matchedSkills) ? result.matchedSkills.length : 0;
    const missingCount = Array.isArray(result.missingSkills) ? result.missingSkills.length : 0;
    const totalTarget = matchedCount + missingCount;
    const matchPercentage =
      totalTarget > 0 ? Math.round((matchedCount / totalTarget) * 100) : 0;

    return NextResponse.json({
      targetRole,
      matchedSkills: result.matchedSkills || [],
      missingSkills: result.missingSkills || [],
      uncertainSkills: result.uncertainSkills || [],
      additionalSkills: result.additionalSkills || [],
      matchPercentage,
      matchFormulaNote:
        result.matchFormulaNote ||
        `Calculated as ${matchedCount} matched skills out of ${totalTarget} required/preferred target skills (${matchPercentage}%).`,
      missingSkillPlans: result.missingSkillPlans || [],
      personalizedRoadmap: (result.personalizedRoadmap || []).map(
        (w: Record<string, unknown>, idx: number) => ({
          week: Number(w.week) || idx + 1,
          title: String(w.title || `Week ${idx + 1}`),
          focusSkills: Array.isArray(w.focusSkills) ? w.focusSkills : [],
          tasks: Array.isArray(w.tasks) ? w.tasks : [],
          milestone: String(w.milestone || ''),
          completed: false,
        })
      ),
    });
  } catch (error) {
    console.error('Skill gap error:', error);
    const message = error instanceof Error ? error.message : 'Failed to compute skill gap.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
