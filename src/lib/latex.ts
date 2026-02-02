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
  const summary = s(data.basics.summary ?? "");

  const headerParts = [location, phone, email].filter(Boolean).join(" \\;|\\; ");

  // Note: Use \\texttt{...} for email, but no templating braces exist anywhere.
  const emailLine =
    email.length > 0
      ? `\\\\ \\href{mailto:${email}}{\\texttt{${email}}}`
      : "";

  const summaryBlock =
    summary.length > 0
      ? `\\vspace{6pt}\n${summary}\n`
      : "";

  return String.raw`
\documentclass[11pt]{article}
\usepackage[margin=1.3cm]{geometry}
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
${emailLine}
\end{center}

${summaryBlock}
\end{document}
`.trim();
}
