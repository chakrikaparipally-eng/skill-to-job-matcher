import { NextRequest, NextResponse } from 'next/server';
import { Type } from '@google/genai';
import { z } from 'zod';
import { GEMINI_MODEL, getGeminiClient } from '@/lib/gemini';

export const runtime = 'nodejs';

const RoadmapSchema = z.object({
  targetRole: z.string().min(2).max(160),
  currentSkills: z.array(z.string()).max(80),
  missingSkills: z.array(z.string()).max(40).optional().default([]),
  weakTopics: z.array(z.string()).max(30).optional().default([]),
  weeksCount: z.number().int().min(4).max(12).optional().default(8),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RoadmapSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid roadmap request.', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { targetRole, currentSkills, missingSkills, weakTopics, weeksCount } = parsed.data;
    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Generate a ${weeksCount}-week personalized learning roadmap ("My Improvement Plan") for a candidate targeting "${targetRole}".
Current Skills: ${currentSkills.join(', ') || 'Beginner / starting from scratch'}
Missing Target Skills: ${missingSkills.join(', ') || 'General core stack'}
Weak Assessment Topics to Revise: ${weakTopics.join(', ') || 'None recorded yet'}`,
      config: {
        systemInstruction:
          'You are a senior technical curriculum mentor. Build a realistic, sequential week-by-week learning plan tailored to the candidate’s existing foundation, addressing weak topics early and ending with deployment/portfolio readiness.',
        responseMimeType: 'application/json',
        responseSchema: {
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
    });

    const raw = (response.text ?? '[]').trim();
    const weeks = JSON.parse(raw);

    return NextResponse.json({
      roadmap: (Array.isArray(weeks) ? weeks : []).map((w: Record<string, unknown>, i: number) => ({
        week: Number(w.week) || i + 1,
        title: String(w.title || `Week ${i + 1}`),
        focusSkills: Array.isArray(w.focusSkills) ? w.focusSkills.map(String) : [],
        tasks: Array.isArray(w.tasks) ? w.tasks.map(String) : [],
        milestone: String(w.milestone || ''),
        completed: false,
      })),
    });
  } catch (error) {
    console.error('Roadmap generation error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate learning roadmap.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
