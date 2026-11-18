import { NextRequest, NextResponse } from 'next/server';
import { Type } from '@google/genai';
import { z } from 'zod';
import { GEMINI_MODEL, getGeminiClient } from '@/lib/gemini';

export const runtime = 'nodejs';

const AnalyzeSchema = z.object({
  extractedText: z.string().min(25, 'Resume text is too short to analyze.').max(100000),
  fileName: z.string().min(1).max(255),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = AnalyzeSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request payload for resume analysis.', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const ai = getGeminiClient();
    const { extractedText, fileName } = parsed.data;

    const systemInstruction = `You are a strict, evidence-based technical resume analyzer.
CRITICAL GROUNDING RULES:
1. Extract ONLY details explicitly present in the provided resume text.
2. NEVER invent, guess, or fabricate skills, degrees, employers, projects, certifications, contact info, or achievements that do not appear in the resume text.
3. If a field such as phone, email, internships, or certifications is absent in the text, return "" or [].
4. Score the resume honestly using this exact 100-point rubric:
   - technicalSkills (0 to 25): depth, clarity, and organization of technical skills
   - projects (0 to 20): evidence of hands-on projects, outcomes, and technologies used
   - education (0 to 15): clarity of degrees, institutions, dates, and academic foundation
   - practicalExperience (0 to 20): internships, work history, measurable impact, action verbs
   - certifications (0 to 10): relevant verified certifications or credentials
   - structureClarity (0 to 10): formatting clarity, section completeness, readability
   Explain clearly in calculationExplanation how each category earned its points.`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Analyze this resume file (${fileName}).\n\n--- RESUME TEXT START ---\n${extractedText}\n--- RESUME TEXT END ---`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            extractedProfile: {
              type: Type.OBJECT,
              properties: {
                fullName: { type: Type.STRING },
                email: { type: Type.STRING },
                phone: { type: Type.STRING },
                education: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      institution: { type: Type.STRING },
                      degree: { type: Type.STRING },
                      fieldOfStudy: { type: Type.STRING },
                      startYear: { type: Type.STRING },
                      endYear: { type: Type.STRING },
                      grade: { type: Type.STRING },
                    },
                  },
                },
                degrees: { type: Type.ARRAY, items: { type: Type.STRING } },
                technicalSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                programmingLanguages: { type: Type.ARRAY, items: { type: Type.STRING } },
                frameworksAndTools: { type: Type.ARRAY, items: { type: Type.STRING } },
                projects: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      technologies: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                  },
                },
                internships: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      role: { type: Type.STRING },
                      organization: { type: Type.STRING },
                      duration: { type: Type.STRING },
                      highlights: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                  },
                },
                workExperience: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      role: { type: Type.STRING },
                      organization: { type: Type.STRING },
                      duration: { type: Type.STRING },
                      highlights: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                  },
                },
                certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
                achievements: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
            },
            overview: {
              type: Type.OBJECT,
              properties: {
                professionalSummary: { type: Type.STRING },
                technicalSkillSummary: { type: Type.STRING },
                educationSummary: { type: Type.STRING },
                projectSummary: { type: Type.STRING },
                experienceSummary: { type: Type.STRING },
              },
            },
            scoreBreakdown: {
              type: Type.OBJECT,
              properties: {
                technicalSkills: { type: Type.INTEGER },
                projects: { type: Type.INTEGER },
                education: { type: Type.INTEGER },
                practicalExperience: { type: Type.INTEGER },
                certifications: { type: Type.INTEGER },
                structureClarity: { type: Type.INTEGER },
                calculationExplanation: { type: Type.STRING },
              },
            },
            improvements: {
              type: Type.OBJECT,
              properties: {
                missingSections: { type: Type.ARRAY, items: { type: Type.STRING } },
                suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                strongerProjectDescriptions: { type: Type.ARRAY, items: { type: Type.STRING } },
                missingTechnicalKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                actionableRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
            },
          },
        },
      },
    });

    const rawText = (response.text ?? '').trim();
    if (!rawText) {
      return NextResponse.json(
        { error: 'Gemini returned an empty response during resume analysis.' },
        { status: 502 }
      );
    }

    const data = JSON.parse(rawText);
    const sb = data.scoreBreakdown || {};
    const clamp = (val: unknown, max: number) =>
      Math.max(0, Math.min(max, Math.round(Number(val) || 0)));

    const technicalSkills = clamp(sb.technicalSkills, 25);
    const projects = clamp(sb.projects, 20);
    const education = clamp(sb.education, 15);
    const practicalExperience = clamp(sb.practicalExperience, 20);
    const certifications = clamp(sb.certifications, 10);
    const structureClarity = clamp(sb.structureClarity, 10);
    const overall =
      technicalSkills +
      projects +
      education +
      practicalExperience +
      certifications +
      structureClarity;

    return NextResponse.json({
      extractedProfile: data.extractedProfile,
      overview: data.overview,
      scoreBreakdown: {
        overall,
        technicalSkills,
        projects,
        education,
        practicalExperience,
        certifications,
        structureClarity,
        calculationExplanation: sb.calculationExplanation || '',
      },
      improvements: data.improvements,
    });
  } catch (error) {
    console.error('Resume analyze error:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to analyze resume with Gemini.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
