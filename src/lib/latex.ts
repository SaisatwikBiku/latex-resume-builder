import type { ResumeData } from "./resumeSchema";

export function escapeLatex(input: string): string {
  return input
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/{/g, "\\{")
    .replace(/}/g, "\\}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

function s(x?: string) {
  return escapeLatex((x ?? "").trim());
}

export function renderLatex(data: ResumeData): string {
  const name = s(data.basics.name);
  const email = s(data.basics.email ?? "");
  const phone = s(data.basics.phone ?? "");
  const location = s(data.basics.location ?? "");
  const website = s(data.basics.website ?? "");
  const summary = s(data.basics.summary ?? "");

  const headerParts = [location, phone, email, website].filter(Boolean).join(" \\;|\\; ");

  const summaryBlock =
    summary.length > 0
      ? `${summary}\n\n`
      : "";

  // Experience Section
  const experienceBlock = data.experience.length > 0
    ? `\\section*{EXPERIENCE}\n${data.experience
        .map(exp => {
          const bullets = exp.bullets
            .filter(b => b.trim())
            .map(b => `  \\item ${s(b)}`)
            .join("\n");
          const loc = exp.location ? `\\quad ${s(exp.location)}` : "";
          return `\\textbf{${s(exp.company)}} \\hfill ${s(exp.dates ?? "")}\\\\\n${s(exp.role)}${loc}\n${bullets.length > 0 ? `\\begin{itemize}\n${bullets}\n\\end{itemize}` : ""}`;
        })
        .join("\n\n")}\n\n`
    : "";

  // Education Section
  const educationBlock = data.education.length > 0
    ? `\\section*{EDUCATION}\n${data.education
        .map(edu => {
          const details = edu.details
            .filter(d => d.trim())
            .map(d => `  \\item ${s(d)}`)
            .join("\n");
          const field = edu.field ? `, ${s(edu.field)}` : "";
          return `\\textbf{${s(edu.degree)}${field}} \\hfill ${s(edu.dates ?? "")}\\\\\n${s(edu.school)}\n${details.length > 0 ? `\\begin{itemize}\n${details}\n\\end{itemize}` : ""}`;
        })
        .join("\n\n")}\n\n`
    : "";

  // Projects Section
  const projectsBlock = data.projects.length > 0
    ? `\\section*{PROJECTS}\n${data.projects
        .map(proj => {
          const bullets = proj.bullets
            .filter(b => b.trim())
            .map(b => `  \\item ${s(b)}`)
            .join("\n");
          const tech = proj.technologies ? `\\quad \\textit{${s(proj.technologies)}}` : "";
          const link = proj.link ? `\\href{${s(proj.link)}}{${s(proj.name)}}` : s(proj.name);
          const desc = proj.description ? `\\\\\n${s(proj.description)}` : "";
          return `\\textbf{${link}}${tech}${desc}\n${bullets.length > 0 ? `\\begin{itemize}\n${bullets}\n\\end{itemize}` : ""}`;
        })
        .join("\n\n")}\n\n`
    : "";

  // Skills Section
  const skillsBlock = data.skills.length > 0
    ? `\\section*{SKILLS}\n${data.skills
        .map(skill => `\\textbf{${s(skill.group)}}\\quad ${s(skill.items.join(", "))}`)
        .join("\\\\\n")}\n\n`
    : "";

  // Certifications Section
  const certificationsBlock = data.certifications.length > 0
    ? `\\section*{CERTIFICATIONS}\n${data.certifications
        .map(cert => {
          const issuer = cert.issuer ? `\\quad ${s(cert.issuer)}` : "";
          return `${s(cert.name)}${issuer}${cert.date ? ` \\hfill ${s(cert.date)}` : ""}`;
        })
        .join("\\\\\n")}\n\n`
    : "";

  // Languages Section
  const languagesBlock = data.languages.length > 0
    ? `\\section*{LANGUAGES}\n${data.languages
        .map(lang => `${s(lang.name)}${lang.proficiency ? ` — ${s(lang.proficiency)}` : ""}`)
        .join("\\\\\n")}\n\n`
    : "";

  return String.raw`
\documentclass[11pt]{article}
\usepackage[margin=0.5in]{geometry}
\usepackage{enumitem}
\usepackage{hyperref}
\usepackage{titlesec}

\setlist[itemize]{noitemsep, topsep=2pt, leftmargin=*}
\titleformat{\section}{\large\bfseries}{}{0em}{}[\titlerule]
\hypersetup{colorlinks=true, urlcolor=blue}

\begin{document}

\begin{center}
{\LARGE \textbf{${name}}}\\
\vspace{2pt}
${headerParts}
\end{center}

\vspace{6pt}

${summaryBlock}${experienceBlock}${educationBlock}${projectsBlock}${skillsBlock}${certificationsBlock}${languagesBlock}
\end{document}
`.trim();
}
