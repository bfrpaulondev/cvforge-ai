import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { cv, jobDescription, template, language } = await req.json();

    if (!cv || typeof cv !== "string" || cv.trim().length < 30) {
      return NextResponse.json(
        { error: "CV content too short. Please paste at least 30 characters." },
        { status: 400 }
      );
    }

    const systemPrompt = `You are CVForge AI, an expert CV/resume optimizer with 15+ years in HR and recruitment.

## TASK
Optimize the user's CV based on the job description (if provided) and the selected template format.

## RULES
1. Transform weak bullets into strong, quantified achievements
2. If job description provided, integrate relevant ATS keywords naturally
3. Start every bullet with a strong action verb (Achieved, Led, Built, etc.)
4. Add numbers/percentages/metrics wherever possible
5. Keep bullets to 1-2 lines max
6. Professional tone
7. Language: ${language === "auto" ? "Detect language from the CV and respond in that SAME language" : `Respond in ${language}`}

## TEMPLATE: ${template}
${getTemplateInstructions(template)}

## OUTPUT FORMAT
=== PERSONAL INFO ===
[Name, contact, location, links]

=== PROFESSIONAL SUMMARY ===
[2-3 line summary tailored to the role]

=== WORK EXPERIENCE ===
[Job Title] | [Company] | [Dates]
• [Achievement with metrics]
• [Achievement with metrics]
• [Achievement with metrics]

=== EDUCATION ===
[Degree] | [Institution] | [Year]

=== SKILLS ===
[Technical, soft skills, tools, languages]

## AFTER THE CV:
ATS_SCORE: [0-100]/100

## SUGGESTIONS:
1. [improvement suggestion]
2. [improvement suggestion]
3. [improvement suggestion]`;

    const userPrompt = jobDescription
      ? `## CURRENT CV:\n${cv}\n\n## TARGET JOB:\n${jobDescription}\n\n## TEMPLATE: ${template}\n\nOptimize this CV for the target role.`
      : `## CURRENT CV:\n${cv}\n\n## TEMPLATE: ${template}\n\nOptimize this CV for general professional appeal.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 2500,
      temperature: 0.7,
    });

    const result = completion.choices[0].message.content || "";

    // Extract ATS score
    const atsMatch = result.match(/ATS_SCORE:\s*(\d+)\s*\/\s*100/i);
    const atsScore = atsMatch ? parseInt(atsMatch[1]) : null;

    // Extract suggestions
    const suggestionsMatch = result.match(/## SUGGESTIONS:\s*([\s\S]*?)$/i);
    const suggestions = suggestionsMatch
      ? suggestionsMatch[1].trim().split("\n").filter((s: string) => /^\d+\./.test(s.trim())).map((s: string) => s.trim())
      : [];

    // Clean CV text (remove ATS score and suggestions)
    const cleanCV = result
      .replace(/##?\s*ATS_SCORE:.*$/is, "")
      .replace(/##?\s*SUGGESTIONS:.*$/is, "")
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
      { error: error.message || "Failed to optimize CV. Please try again." },
      { status: 500 }
    );
  }
}

function getTemplateInstructions(template: string): string {
  const instructions: Record<string, string> = {
    europass: `Official Europass format: Personal Statement, Work Experience, Education and Training, Personal Skills, Technical Skills. Formal, structured, for European institutions.`,
    ats: `ATS-optimized: NO tables/columns/graphics. Standard headers. Simple text. Include keywords from job description. Easy for bots to parse.`,
    modern: `Modern visual: Two-column layout [LEFT] Experience + Education [RIGHT] Skills + Languages + Certifications. Emoji headers. Space for photo [PHOTO].`,
    academic: `Academic: Research Statement, Research Experience, Teaching Experience, Education with thesis titles, Publications (APA), Conferences, Grants & Awards.`,
    tech: `Tech: Technical Profile, Skills by category (Languages, Frameworks, Tools, Cloud), Experience with tech impact, Projects with stack, GitHub links. Quantify everything.`,
    executive: `Executive: Executive Summary (3-4 lines), Experience with leadership scope (team size, budget, strategy), Education with executive programs, Board Memberships, Awards.`,
  };
  return instructions[template] || instructions.ats;
}
