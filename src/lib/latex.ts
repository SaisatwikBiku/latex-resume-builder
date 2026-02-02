import Handlebars from "handlebars";
import fs from "fs/promises";
import path from "path";
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

function sanitize(data: ResumeData): ResumeData {
  const esc = (s?: string) => escapeLatex((s ?? "").trim());
  return {
    ...data,
    basics: {
      ...data.basics,
      name: esc(data.basics.name),
      email: esc(data.basics.email ?? ""),
      phone: esc(data.basics.phone ?? ""),
      location: esc(data.basics.location ?? ""),
      summary: esc(data.basics.summary ?? ""),
    },
    education: (data.education ?? []).map(e => ({
      ...e,
      school: esc(e.school),
      degree: esc(e.degree),
      dates: esc(e.dates ?? ""),
      details: (e.details ?? []).map(esc),
    })),
    experience: (data.experience ?? []).map(x => ({
      ...x,
      company: esc(x.company),
      role: esc(x.role),
      dates: esc(x.dates ?? ""),
      location: esc(x.location ?? ""),
      bullets: (x.bullets ?? []).map(esc),
    })),
    skills: (data.skills ?? []).map(s => ({
      ...s,
      group: esc(s.group),
      items: (s.items ?? []).map(esc),
    })),
  };
}

export async function renderLatex(data: ResumeData): Promise<string> {
  const safe = sanitize(data);
  const tplPath = path.join(process.cwd(), "templates", "resume.tex.hbs");
  const source = await fs.readFile(tplPath, "utf8");
  const template = Handlebars.compile(source, { noEscape: true });
  return template(safe);
}
