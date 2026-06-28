import { NextRequest, NextResponse } from "next/server";

/**
 * Importa perfil do LinkedIn via URL pública.
 * Faz fetch da página e extrai dados estruturados.
 */
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: "Please provide a LinkedIn profile URL" },
        { status: 400 }
      );
    }

    // Normalizar URL: adicionar https:// se não tiver, e converter para lowercase no domínio
    let profileUrl = url.trim();
    
    // Se não tem protocolo, adicionar
    if (!profileUrl.startsWith("http://") && !profileUrl.startsWith("https://")) {
      profileUrl = "https://" + profileUrl;
    }
    
    // Converter domínio para lowercase (mas manter o path como está)
    try {
      const urlObj = new URL(profileUrl);
      profileUrl = urlObj.href;
    } catch {
      // Se falhar o parse, tentar com lowercase
      profileUrl = profileUrl.toLowerCase();
    }
    
    // Validação case-insensitive
    if (!profileUrl.toLowerCase().includes("linkedin.com")) {
      return NextResponse.json(
        { error: "Please provide a valid LinkedIn profile URL (e.g., https://www.linkedin.com/in/your-name)" },
        { status: 400 }
      );
    }

    // Fazer fetch da página do LinkedIn com headers de browser
    const fetchRes = await fetch(profileUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });

    if (!fetchRes.ok) {
      return NextResponse.json(
        { error: "Could not access LinkedIn profile. Make sure it's public." },
        { status: 400 }
      );
    }

    const html = await fetchRes.text();

    // Extrair dados do HTML do LinkedIn
    const profile = parseLinkedInHTML(html);

    if (!profile.name && !profile.experience.length) {
      return NextResponse.json(
        {
          error:
            "Could not extract profile data. The profile may be private. Try uploading your LinkedIn PDF export instead.",
        },
        { status: 400 }
      );
    }

    // Converter para formato de CV em texto
    const cvText = formatProfileAsCV(profile);

    return NextResponse.json({
      success: true,
      profile,
      cvText,
    });
  } catch (error: any) {
    console.error("LinkedIn import error:", error.message);
    return NextResponse.json(
      {
        error:
          "Failed to import LinkedIn profile. Make sure the profile is public, or try uploading your CV as PDF instead.",
      },
      { status: 500 }
    );
  }
}

interface LinkedInProfile {
  name: string;
  headline: string;
  location: string;
  about: string;
  experience: { title: string; company: string; duration: string; description: string }[];
  education: { school: string; degree: string; duration: string }[];
  skills: string[];
}

function parseLinkedInHTML(html: string): LinkedInProfile {
  const profile: LinkedInProfile = {
    name: "",
    headline: "",
    location: "",
    about: "",
    experience: [],
    education: [],
    skills: [],
  };

  // Extrair nome
  const nameMatch =
    html.match(/<h1[^>]*class="[^"]*text-heading-xlarge[^"]*"[^>]*>([^<]+)<\/h1>/i) ||
    html.match(/"name":"([^"]+)"/i) ||
    html.match(/<title[^>]*>([^<]+)\s*\|/i);
  if (nameMatch) profile.name = decodeHtml(nameMatch[1].trim());

  // Extrair headline
  const headlineMatch =
    html.match(/<div[^>]*class="[^"]*text-body-medium[^"]*"[^>]*>([^<]+)<\/div>/i) ||
    html.match(/"headline":"([^"]+)"/i);
  if (headlineMatch) profile.headline = decodeHtml(headlineMatch[1].trim());

  // Extrair localização
  const locationMatch =
    html.match(/<span[^>]*class="[^"]*text-body-small[^"]*"[^>]*>([^<]+)<\/span>/i) ||
    html.match(/"addressLocality":"([^"]+)"/i);
  if (locationMatch) profile.location = decodeHtml(locationMatch[1].trim());

  // Extrair sobre
  const aboutMatch = html.match(
    /<section[^>]*id="about"[^>]*>[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/i
  );
  if (aboutMatch) profile.about = decodeHtml(aboutMatch[1].trim());

  // Extrair experiência (JSON-LD ou seções)
  const expSection = html.match(
    /<section[^>]*id="experience"[^>]*>([\s\S]*?)<\/section>/i
  );
  if (expSection) {
    const expItems = expSection[1].matchAll(
      /<h3[^>]*>([^<]+)<\/h3>[\s\S]*?<p[^>]*>([^<]+)<\/p>[\s\S]*?<span[^>]*>([^<]+)<\/span>/gi
    );
    for (const item of expItems) {
      profile.experience.push({
        title: decodeHtml(item[1].trim()),
        company: decodeHtml(item[2].trim()),
        duration: decodeHtml(item[3].trim()),
        description: "",
      });
    }
  }

  // Tentar extrair do JSON-LD
  const jsonLdMatch = html.match(
    /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i
  );
  if (jsonLdMatch) {
    try {
      const jsonLd = JSON.parse(jsonLdMatch[1]);
      if (jsonLd.name && !profile.name) profile.name = jsonLd.name;
      if (jsonLd.jobTitle && !profile.headline)
        profile.headline = Array.isArray(jsonLd.jobTitle)
          ? jsonLd.jobTitle.join(", ")
          : jsonLd.jobTitle;
      if (jsonLd.workExperience) {
        for (const work of jsonLd.workExperience) {
          profile.experience.push({
            title: work.name || work.jobTitle || "",
            company: work.hiringOrganization?.name || "",
            duration: work.startDate && work.endDate
              ? `${work.startDate} - ${work.endDate}`
              : "",
            description: work.description || "",
          });
        }
      }
      if (jsonLd.alumniOf) {
        const edu = Array.isArray(jsonLd.alumniOf) ? jsonLd.alumniOf : [jsonLd.alumniOf];
        for (const school of edu) {
          profile.education.push({
            school: school.name || "",
            degree: "",
            duration: "",
          });
        }
      }
    } catch {}
  }

  // Extrair skills
  const skillsSection = html.match(
    /<section[^>]*id="skills"[^>]*>([\s\S]*?)<\/section>/i
  );
  if (skillsSection) {
    const skillMatches = skillsSection[1].matchAll(
      /<span[^>]*class="[^"]*visually-hidden[^"]*"[^>]*>([^<]+)<\/span>/gi
    );
    for (const skill of skillMatches) {
      const skillText = skill[1].trim();
      if (skillText && skillText.length > 1 && skillText.length < 50) {
        profile.skills.push(skillText);
      }
    }
  }

  return profile;
}

function formatProfileAsCV(profile: LinkedInProfile): string {
  let cv = "";

  if (profile.name) cv += `${profile.name}\n`;
  if (profile.headline) cv += `${profile.headline}\n`;
  if (profile.location) cv += `${profile.location}\n`;
  cv += "\n";

  if (profile.about) {
    cv += "ABOUT\n";
    cv += `${profile.about}\n\n`;
  }

  if (profile.experience.length > 0) {
    cv += "EXPERIENCE\n";
    for (const exp of profile.experience) {
      cv += `${exp.title}`;
      if (exp.company) cv += ` | ${exp.company}`;
      if (exp.duration) cv += ` | ${exp.duration}`;
      cv += "\n";
      if (exp.description) cv += `${exp.description}\n`;
      cv += "\n";
    }
  }

  if (profile.education.length > 0) {
    cv += "EDUCATION\n";
    for (const edu of profile.education) {
      cv += `${edu.school}`;
      if (edu.degree) cv += ` | ${edu.degree}`;
      if (edu.duration) cv += ` | ${edu.duration}`;
      cv += "\n";
    }
    cv += "\n";
  }

  if (profile.skills.length > 0) {
    cv += "SKILLS\n";
    cv += profile.skills.join(", ") + "\n";
  }

  return cv.trim();
}

function decodeHtml(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x27;/g, "'")
    .trim();
}
