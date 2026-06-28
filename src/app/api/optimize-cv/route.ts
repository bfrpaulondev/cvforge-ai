import { NextRequest, NextResponse } from "next/server";

// Lazy init OpenAI — só cria quando chamado
let _openai: any = null;
const getOpenAI = () => {
  if (!_openai) {
    const OpenAI = require("openai").default;
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error("OPENAI_API_KEY environment variable is not set. Please add it in Vercel project settings.");
    }
    _openai = new OpenAI({ apiKey: key });
  }
  return _openai;
};

export async function POST(req: NextRequest) {
  try {
    const { cv, jobDescription, template, language } = await req.json();

    if (!cv || typeof cv !== "string" || cv.trim().length < 50) {
      return NextResponse.json(
        { error: "CV content too short. Please paste at least 50 characters." },
        { status: 400 }
      );
    }

    const systemPrompt = `You are CVForge AI, a professional CV/resume optimizer with 15+ years of experience in HR and recruitment.

Your task: Take the user's current CV and optimize it based on the job description (if provided) and the selected template format.

## OPTIMIZATION RULES:
1. **Enhance impact**: Transform weak bullet points into strong, quantified achievements
2. **ATS keywords**: If a job description is provided, naturally integrate relevant keywords
3. **Action verbs**: Start every experience bullet with a strong action verb
4. **Quantify**: Add numbers, percentages, and metrics wherever possible
5. **Concise**: Keep bullet points to 1-2 lines max
6. **Professional tone**: Maintain professional language
7. **Language**: ${language === "auto" ? "Detect the language from the user's CV and respond in that SAME language" : `Respond in ${language}`}

## TEMPLATE FORMAT: ${template}
${getTemplateInstructions(template)}

## OUTPUT FORMAT:
Return the optimized CV in clean, structured text format with clear section headers. Use this structure:

=== PERSONAL INFO ===
[Name, contact, location, LinkedIn]

=== PROFESSIONAL SUMMARY ===
[2-3 line compelling summary tailored to the target role]

=== WORK EXPERIENCE ===
[Job Title] | [Company] | [Dates]
• [Achievement bullet 1]
• [Achievement bullet 2]
• [Achievement bullet 3]

=== EDUCATION ===
[Degree] | [Institution] | [Year]

=== SKILLS ===
[Technical skills, soft skills, tools, languages]

After the CV, provide:
ATS_SCORE: [number]/100

SUGGESTIONS:
1. [suggestion]
2. [suggestion]
3. [suggestion]`;

    const userPrompt = jobDescription
      ? `## CURRENT CV:\n${cv}\n\n## TARGET JOB DESCRIPTION:\n${jobDescription}\n\n## TEMPLATE: ${template}\n\nPlease optimize this CV for the target role.`
      : `## CURRENT CV:\n${cv}\n\n## TEMPLATE: ${template}\n\nPlease optimize this CV for general professional appeal.`;

    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const result = completion.choices[0].message.content || "";

    const atsMatch = result.match(/ATS_SCORE:\s*(\d+)\/100/i);
    const atsScore = atsMatch ? parseInt(atsMatch[1]) : null;

    const suggestionsMatch = result.match(/SUGGESTIONS:\s*([\s\S]*?)$/i);
    const suggestions = suggestionsMatch
      ? suggestionsMatch[1].trim().split("\n").filter((s: string) => /^\d+\./.test(s.trim())).map((s: string) => s.trim())
      : [];

    const cleanCV = result
      .replace(/ATS_SCORE:\s*\d+\/100.*$/is, "")
      .replace(/SUGGESTIONS:.*$/is, "")
      .trim();

    return NextResponse.json({
      success: true,
      optimizedCV: cleanCV,
      atsScore,
      suggestions,
      template,
    });
  } catch (error: any) {
    console.error("CV optimization error:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to optimize CV." },
      { status: 500 }
    );
  }
}

function getTemplateInstructions(template: string): string {
  const instructions: Record<string, string> = {
    europass: `Follow the official Europass format with Personal Statement, Work Experience, Education and Training, Personal Skills and Technical Skills sections. Clean, formal, structured layout for European institutions.`,
    ats: `Optimize for ATS: NO tables, columns, or graphics. Standard headers (Professional Summary, Work Experience, Education, Skills). Simple text format. Include keywords from job description naturally.`,
    modern: `Modern visual format with two-column layout indication [LEFT COLUMN] and [RIGHT COLUMN]. Left: Experience, Education. Right: Skills, Languages, Certifications. Use emoji headers sparingly.`,
    academic: `Academic format: Research Statement, Research Experience, Teaching Experience, Education with thesis titles, Publications, Conferences, Grants & Awards. Formal, detailed, citation-friendly.`,
    tech: `Tech format: Technical Profile, Technical Skills by category (Languages, Frameworks, Tools, Cloud), Professional Experience, Projects with tech stack, Open Source, GitHub links. Quantify technical impact.`,
    executive: `Executive format: Executive Summary (3-4 lines), Professional Experience with leadership scope (team size, budget, strategy), Education with executive programs, Board Memberships, Awards. Results-driven tone.`,
  };
  return instructions[template] || instructions.ats;
}
