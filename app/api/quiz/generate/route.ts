import { NextRequest, NextResponse } from 'next/server';
import { Type } from '@google/genai';
import { z } from 'zod';
import { GEMINI_MODEL, getGeminiClient } from '@/lib/gemini';

export const runtime = 'nodejs';

const QuizGenSchema = z.object({
  skillId: z.string().min(1).max(128),
  skillTitle: z.string().min(1).max(160),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  topic: z.string().max(120).optional().default(''),
  count: z.number().int().min(3).max(15).optional().default(5),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = QuizGenSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid quiz generation request.', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { skillId, skillTitle, difficulty, topic, count } = parsed.data;
    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Generate ${count} factually accurate technical assessment questions for "${skillTitle}" at "${difficulty}" difficulty${topic ? ` focusing on "${topic}"` : ''}.
Include a mix of kinds: "mcq" (4 options), "true_false" (exactly 2 options: ["True", "False"]), "technical" (4 options), and "coding" (4 options with a concise codeSnippet).
Ensure correctIndex is strictly a valid 0-based index into options and provide a crisp technical explanation for every answer.`,
      config: {
        systemInstruction:
          'You are a rigorous computer science and technical instructor. Only produce unambiguous questions with verified, factually accurate answer keys.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              kind: { type: Type.STRING },
              topic: { type: Type.STRING },
              prompt: { type: Type.STRING },
              codeSnippet: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
            },
          },
        },
      },
    });

    const raw = (response.text ?? '[]').trim();
    const items = JSON.parse(raw);

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Gemini did not return valid quiz questions.' },
        { status: 502 }
      );
    }

    const questions = items.map((q: Record<string, unknown>, idx: number) => {
      const kindRaw = String(q.kind || 'mcq');
      const kind =
        kindRaw === 'true_false' || kindRaw === 'technical' || kindRaw === 'coding'
          ? kindRaw
          : 'mcq';
      const options =
        kind === 'true_false'
          ? ['True', 'False']
          : Array.isArray(q.options) && q.options.length >= 2
          ? q.options.map(String)
          : ['Option A', 'Option B', 'Option C', 'Option D'];
      const rawIdx = Number(q.correctIndex);
      const correctIndex =
        Number.isInteger(rawIdx) && rawIdx >= 0 && rawIdx < options.length ? rawIdx : 0;

      return {
        id: `${skillId}-ai-${Date.now()}-${idx}`,
        kind,
        topic: String(q.topic || topic || skillTitle),
        difficulty,
        prompt: String(q.prompt || ''),
        codeSnippet: q.codeSnippet ? String(q.codeSnippet) : undefined,
        options,
        correctIndex,
        explanation: String(q.explanation || ''),
      };
    });

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Quiz generation error:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to generate quiz questions.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
