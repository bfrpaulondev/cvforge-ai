import { NextRequest, NextResponse } from "next/server";

/**
 * CVForge AI — CV Optimization API
 * 
 * Usa o backend do PoupPT como proxy para a OpenAI (GLM-4.5/GPT-4o-mini).
 * O PoupPT API já tem a OPENAI_API_KEY configurada no Render.
 * 
 * Endpoint: POST /api/optimize-cv
 * Body: { cv, jobDescription, template, language }
 * Response: { success, optimizedCV, atsScore, suggestions, template }
 */

// URL do backend PoupPT (já tem OpenAI configurada)
const POUPT_API = "https://poupt-api-3tyo.onrender.com";

export async function POST(req: NextRequest) {
  try {
    const { cv, jobDescription, template, language } = await req.json();

    if (!cv || typeof cv !== "string" || cv.trim().length < 50) {
      return NextResponse.json(
        { error: "CV content too short. Please paste at least 50 characters." },
        { status: 400 }
      );
    }

    // Construir prompt para o Coach do PoupPT (que usa OpenAI internamente)
    const systemPrompt = `You are CVForge AI, a professional CV/resume optimizer with 15+ years of experience in HR and recruitment.

## OPTIMIZATION RULES:
1. Enhance impact: Transform weak bullet points into strong, quantified achievements
2. ATS keywords: If a job description is provided, naturally integrate relevant keywords
3. Action verbs: Start every experience bullet with a strong action verb
4. Quantify: Add numbers, percentages, and metrics wherever possible
5. Concise: Keep bullet points to 1-2 lines max
6. Professional tone: Maintain professional language
7. Language: ${language === "auto" ? "Detect the language from the user's CV and respond in that SAME language" : `Respond in ${language}`}

## TEMPLATE FORMAT: ${template}
${getTemplateInstructions(template)}

## OUTPUT FORMAT:
Return the optimized CV with these sections:
=== PERSONAL INFO ===
=== PROFESSIONAL SUMMARY ===
=== WORK EXPERIENCE ===
=== EDUCATION ===
=== SKILLS ===

After the CV:
ATS_SCORE: [number]/100

SUGGESTIONS:
1. [suggestion]
2. [suggestion]
3. [suggestion]`;

    const userPrompt = jobDescription
      ? `## CURRENT CV:\n${cv}\n\n## TARGET JOB DESCRIPTION:\n${jobDescription}\n\n## TEMPLATE: ${template}\n\nOptimize this CV for the target role.`
      : `## CURRENT CV:\n${cv}\n\n## TEMPLATE: ${template}\n\nOptimize this CV for general professional appeal.`;

    // Criar uma conta temporária no PoupPT para usar o Coach
    // Ou melhor: usar um endpoint público que não precisa de auth
    
    // Estratégia: registrar um user temporário, fazer login, e usar o coach
    const tempEmail = `cvforge_${Date.now()}@temp.poupt.pt`;
    const tempPassword = `CVForge2026!`;
    
    // 1. Registrar conta temporária
    const regRes = await fetch(`${POUPT_API}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Origin": "https://poupt-pwa.vercel.app" },
      body: JSON.stringify({
        name: "CVForge Temp",
        email: tempEmail,
        password: tempPassword,
      }),
    });
    
    const regData = await regRes.json();
    const token = regData?.token || regData?.data?.token;
    
    if (!token) {
      // Se registro falhar (já existe), tentar login
      const loginRes = await fetch(`${POUPT_API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Origin": "https://poupt-pwa.vercel.app" },
        body: JSON.stringify({ email: tempEmail, password: tempPassword }),
      });
      const loginData = await loginRes.json();
      const loginToken = loginData?.token;
      
      if (!loginToken) {
        throw new Error("Could not authenticate with AI service");
      }
      
      // Usar o token para chamar o coach
      return await callCoachAndReturn(loginToken, systemPrompt, userPrompt, template);
    }
    
    // Usar o token para chamar o coach
    return await callCoachAndReturn(token, systemPrompt, userPrompt, template);
    
  } catch (error: any) {
    console.error("CV optimization error:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to optimize CV. Please try again." },
      { status: 500 }
    );
  }
}

async function callCoachAndReturn(token: string, systemPrompt: string, userPrompt: string, template: string) {
  // Combinar system + user em uma mensagem (o coach do PoupPT adiciona seu próprio system prompt)
  const combinedMessage = `${systemPrompt}\n\n---\n\n${userPrompt}`;
  
  const coachRes = await fetch(`${POUPT_API}/api/coach/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "Origin": "https://poupt-pwa.vercel.app",
    },
    body: JSON.stringify({ message: combinedMessage }),
  });
  
  const coachData = await coachRes.json();
  
  if (!coachData?.success) {
    throw new Error(coachData?.error || "AI service error");
  }
  
  const result = coachData.data.reply || "";
  
  // Extrair ATS score
  const atsMatch = result.match(/ATS_SCORE:\s*(\d+)\/100/i);
  const atsScore = atsMatch ? parseInt(atsMatch[1]) : null;
  
  // Extrair sugestões
  const suggestionsMatch = result.match(/SUGGESTIONS:\s*([\s\S]*?)$/i);
  const suggestions = suggestionsMatch
    ? suggestionsMatch[1].trim().split("\n").filter((s: string) => /^\d+\./.test(s.trim())).map((s: string) => s.trim())
    : [];
  
  // Limpar CV (remover ATS score e sugestões)
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
