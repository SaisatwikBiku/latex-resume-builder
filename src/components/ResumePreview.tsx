"use client";
import type { ReactNode } from "react";
import type { ResumeData } from "@/lib/resumeSchema";

export default function ResumePreview({ data }: { data: ResumeData }) {
  const b = data.basics;
  const line = [b.location, b.phone, b.email].filter(Boolean).join(" | ");

  return (
    <div
      className="h-full w-full bg-white p-[28pt] text-[10.5pt] leading-[1.35] text-black"
      style={{ fontFamily: '"Times New Roman", Times, serif' }}
    >
      <div className="mb-9 text-center">
        <h1 className="text-[18pt] font-bold">{b.name || "Your Name"}</h1>
        <p className="mt-[4pt] text-[9.5pt] text-slate-900">
          {line}
          {b.website && b.email ? " | " : ""}
          {b.website && (
            <a className="text-[9.5pt] text-blue-700 underline" href={b.website}>
              {b.website}
            </a>
          )}
        </p>
      </div>

      {b.summary && (
        <p className="mb-8 text-[10.5pt] leading-[1.45]">
          {b.summary}
        </p>
      )}

      {data.experience.length > 0 && (
        <Section title="EXPERIENCE">
          {data.experience.map((exp, i) => (
            <Entry key={i} right={exp.dates}>
              <div className="flex flex-col">
                <span className="text-[11pt] font-bold">{exp.company}</span>
                <span className="text-[10pt] italic text-slate-900">{exp.role}</span>
                {exp.location && <span className="text-[9.5pt] text-slate-900">{exp.location}</span>}
              </div>
              {exp.bullets.filter((b) => b.trim()).length > 0 && <Bullets items={exp.bullets} />}
            </Entry>
          ))}
        </Section>
      )}

      {data.education.length > 0 && (
        <Section title="EDUCATION">
          {data.education.map((edu, i) => (
            <Entry key={i} right={edu.dates}>
              <div className="flex flex-col">
                <span className="text-[11pt] font-bold">
                  {edu.degree} {edu.field && `in ${edu.field}`}
                </span>
                <span className="text-[10pt] italic text-slate-900">{edu.school}</span>
              </div>
              {edu.details.filter((d) => d.trim()).length > 0 && <Bullets items={edu.details} />}
            </Entry>
          ))}
        </Section>
      )}

      {data.projects.length > 0 && (
        <Section title="PROJECTS">
          {data.projects.map((proj, i) => (
            <Entry key={i} right="">
              <div className="flex flex-col gap-[2pt]">
                <span className="text-[11pt] font-bold">
                  {proj.link ? (
                    <a className="text-blue-700 underline" href={proj.link}>
                      {proj.name}
                    </a>
                  ) : (
                    proj.name
                  )}
                </span>
                {proj.technologies && <span className="text-[9.5pt] italic text-slate-900">{proj.technologies}</span>}
              </div>
              {proj.description && <p className="mt-[2pt] text-[10pt]">{proj.description}</p>}
              {proj.bullets.filter((b) => b.trim()).length > 0 && <Bullets items={proj.bullets} />}
            </Entry>
          ))}
        </Section>
      )}

      {data.skills.length > 0 && (
        <Section title="SKILLS">
          <div className="space-y-[6pt]">
            {data.skills.map((skill, i) => (
              <div key={i} className="flex gap-2 text-[10pt]">
                <div className="font-bold">{skill.group}:</div>
                <div className="text-slate-900">{skill.items.join(", ")}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {data.certifications.length > 0 && (
        <Section title="CERTIFICATIONS">
          {data.certifications.map((cert, i) => (
            <Entry key={i} right={cert.date}>
              <div className="flex flex-col">
                <span className="text-[11pt] font-bold">{cert.name}</span>
                {cert.issuer && <span className="text-[10pt] italic text-slate-900">{cert.issuer}</span>}
              </div>
            </Entry>
          ))}
        </Section>
      )}

      {data.languages.length > 0 && (
        <Section title="LANGUAGES">
          <div className="space-y-[4pt] text-[10pt]">
            {data.languages.map((lang, i) => (
              <div key={i} className="flex gap-1">
                <div className="font-bold">{lang.name}</div>
                {lang.proficiency && <div>— {lang.proficiency}</div>}
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-6 space-y-2">
      <h2 className="border-b border-black pb-[4pt] text-[11pt] font-bold tracking-[0.08em]">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Entry({ children, right }: { children: ReactNode; right?: string }) {
  return (
    <div className="space-y-[2pt]">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="space-y-[2pt]">{children}</div>
        {right && <div className="shrink-0 text-[9.5pt] text-slate-900 whitespace-nowrap">{right}</div>}
      </div>
    </div>
  );
}

function Bullets({ items }: { items: string[] }) {
  const cleaned = items.filter((bullet) => bullet.trim());
  if (cleaned.length === 0) return null;

  return (
    <ul className="mt-[3pt] space-y-[3pt] list-disc list-outside pl-5 text-[10pt] text-black">
      {cleaned.map((bullet, j) => (
        <li key={j}>{bullet}</li>
      ))}
    </ul>
  );
}
