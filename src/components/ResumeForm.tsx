"use client";
import type { ReactNode } from "react";
import type { ResumeData } from "@/lib/resumeSchema";

export default function ResumeForm({
  value,
  onChange,
}: {
  value: ResumeData;
  onChange: (v: ResumeData) => void;
}) {
  const b = value.basics;

  const fieldClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-[0_1px_0_rgba(15,23,42,0.04)] transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none";
  const labelClass = "flex flex-col gap-1 text-sm font-semibold text-slate-800";
  const pillButton =
    "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500";
  const removeButton =
    "text-xs font-semibold text-rose-600 underline underline-offset-4 decoration-rose-200 hover:decoration-rose-400";

  return (
    <div className="space-y-6">
      <Section title="Personal Info" helper="Include contact details and a brief professional summary.">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Name *
            <input
              className={fieldClass}
              value={b.name}
              onChange={(e) => onChange({ ...value, basics: { ...b, name: e.target.value } })}
              placeholder="John Doe"
            />
          </label>
          <label className={labelClass}>
            Email
            <input
              className={fieldClass}
              type="email"
              value={b.email ?? ""}
              onChange={(e) => onChange({ ...value, basics: { ...b, email: e.target.value } })}
              placeholder="john@example.com"
            />
          </label>
          <label className={labelClass}>
            Phone
            <input
              className={fieldClass}
              value={b.phone ?? ""}
              onChange={(e) => onChange({ ...value, basics: { ...b, phone: e.target.value } })}
              placeholder="+1 (555) 123-4567"
            />
          </label>
          <label className={labelClass}>
            Location
            <input
              className={fieldClass}
              value={b.location ?? ""}
              onChange={(e) => onChange({ ...value, basics: { ...b, location: e.target.value } })}
              placeholder="San Francisco, CA"
            />
          </label>
          <label className={labelClass}>
            Website
            <input
              className={fieldClass}
              type="url"
              value={b.website ?? ""}
              onChange={(e) => onChange({ ...value, basics: { ...b, website: e.target.value } })}
              placeholder="https://example.com"
            />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Professional Summary
            <textarea
              className={`${fieldClass} min-h-[100px] resize-none`}
              rows={3}
              value={b.summary ?? ""}
              onChange={(e) => onChange({ ...value, basics: { ...b, summary: e.target.value } })}
              placeholder="Brief overview of your professional background..."
            />
          </label>
        </div>
      </Section>

      <Section title="Experience" helper="Show growth and impact with crisp bullets.">
        {value.experience.map((exp, i) => (
          <div
            key={i}
            className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-slate-800">
                {exp.company || `Role ${i + 1}`}
              </p>
              <button
                className={removeButton}
                onClick={() => onChange({ ...value, experience: value.experience.filter((_, idx) => idx !== i) })}
              >
                Remove
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className={fieldClass}
                placeholder="Company"
                value={exp.company}
                onChange={(e) => {
                  const updated = [...value.experience];
                  updated[i].company = e.target.value;
                  onChange({ ...value, experience: updated });
                }}
              />
              <input
                className={fieldClass}
                placeholder="Role"
                value={exp.role}
                onChange={(e) => {
                  const updated = [...value.experience];
                  updated[i].role = e.target.value;
                  onChange({ ...value, experience: updated });
                }}
              />
              <input
                className={fieldClass}
                placeholder="Dates (e.g. Jan 2024 – Present)"
                value={exp.dates ?? ""}
                onChange={(e) => {
                  const updated = [...value.experience];
                  updated[i].dates = e.target.value;
                  onChange({ ...value, experience: updated });
                }}
              />
              <input
                className={fieldClass}
                placeholder="Location"
                value={exp.location ?? ""}
                onChange={(e) => {
                  const updated = [...value.experience];
                  updated[i].location = e.target.value;
                  onChange({ ...value, experience: updated });
                }}
              />
            </div>
            <textarea
              className={`${fieldClass} min-h-[104px]`}
              placeholder="Bullet points (one per line)"
              value={exp.bullets.join("\n")}
              onChange={(e) => {
                const updated = [...value.experience];
                updated[i].bullets = e.target.value.split("\n");
                onChange({ ...value, experience: updated });
              }}
            />
          </div>
        ))}
        <button
          className={pillButton}
          onClick={() =>
            onChange({
              ...value,
              experience: [...value.experience, { company: "", role: "", dates: "", location: "", bullets: [] }],
            })
          }
        >
          + Add Experience
        </button>
      </Section>

      <Section title="Education" helper="Chronological academic history, with quick highlights.">
        {value.education.map((edu, i) => (
          <div
            key={i}
            className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-slate-800">
                {edu.school || `Program ${i + 1}`}
              </p>
              <button
                className={removeButton}
                onClick={() => onChange({ ...value, education: value.education.filter((_, idx) => idx !== i) })}
              >
                Remove
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className={fieldClass}
                placeholder="School"
                value={edu.school}
                onChange={(e) => {
                  const updated = [...value.education];
                  updated[i].school = e.target.value;
                  onChange({ ...value, education: updated });
                }}
              />
              <input
                className={fieldClass}
                placeholder="Degree"
                value={edu.degree}
                onChange={(e) => {
                  const updated = [...value.education];
                  updated[i].degree = e.target.value;
                  onChange({ ...value, education: updated });
                }}
              />
              <input
                className={fieldClass}
                placeholder="Field of Study (optional)"
                value={edu.field ?? ""}
                onChange={(e) => {
                  const updated = [...value.education];
                  updated[i].field = e.target.value;
                  onChange({ ...value, education: updated });
                }}
              />
              <input
                className={fieldClass}
                placeholder="Dates"
                value={edu.dates ?? ""}
                onChange={(e) => {
                  const updated = [...value.education];
                  updated[i].dates = e.target.value;
                  onChange({ ...value, education: updated });
                }}
              />
            </div>
            <textarea
              className={`${fieldClass} min-h-[88px]`}
              placeholder="Details (one per line)"
              value={edu.details.join("\n")}
              onChange={(e) => {
                const updated = [...value.education];
                updated[i].details = e.target.value.split("\n");
                onChange({ ...value, education: updated });
              }}
            />
          </div>
        ))}
        <button
          className={pillButton}
          onClick={() =>
            onChange({
              ...value,
              education: [...value.education, { school: "", degree: "", field: "", dates: "", details: [] }],
            })
          }
        >
          + Add Education
        </button>
      </Section>

      <Section title="Projects" helper="Surface 2–3 most impressive projects with links and stack.">
        {value.projects.map((proj, i) => (
          <div
            key={i}
            className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-slate-800">
                {proj.name || `Project ${i + 1}`}
              </p>
              <button
                className={removeButton}
                onClick={() => onChange({ ...value, projects: value.projects.filter((_, idx) => idx !== i) })}
              >
                Remove
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className={fieldClass}
                placeholder="Project Name"
                value={proj.name}
                onChange={(e) => {
                  const updated = [...value.projects];
                  updated[i].name = e.target.value;
                  onChange({ ...value, projects: updated });
                }}
              />
              <input
                className={fieldClass}
                placeholder="Link (optional)"
                value={proj.link ?? ""}
                onChange={(e) => {
                  const updated = [...value.projects];
                  updated[i].link = e.target.value;
                  onChange({ ...value, projects: updated });
                }}
              />
            </div>
            <input
              className={fieldClass}
              placeholder="Technologies (comma-separated)"
              value={proj.technologies ?? ""}
              onChange={(e) => {
                const updated = [...value.projects];
                updated[i].technologies = e.target.value;
                onChange({ ...value, projects: updated });
              }}
            />
            <textarea
              className={`${fieldClass} min-h-[72px]`}
              placeholder="Short description"
              value={proj.description ?? ""}
              onChange={(e) => {
                const updated = [...value.projects];
                updated[i].description = e.target.value;
                onChange({ ...value, projects: updated });
              }}
            />
            <textarea
              className={`${fieldClass} min-h-[88px]`}
              placeholder="Bullet points (one per line)"
              value={proj.bullets.join("\n")}
              onChange={(e) => {
                const updated = [...value.projects];
                updated[i].bullets = e.target.value.split("\n");
                onChange({ ...value, projects: updated });
              }}
            />
          </div>
        ))}
        <button
          className={pillButton}
          onClick={() =>
            onChange({
              ...value,
              projects: [...value.projects, { name: "", description: "", technologies: "", link: "", bullets: [] }],
            })
          }
        >
          + Add Project
        </button>
      </Section>

      <Section title="Skills" helper="Group tools and languages so they map cleanly to the PDF.">
        {value.skills.map((skill, i) => (
          <div
            key={i}
            className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-slate-800">
                {skill.group || `Skill group ${i + 1}`}
              </p>
              <button
                className={removeButton}
                onClick={() => onChange({ ...value, skills: value.skills.filter((_, idx) => idx !== i) })}
              >
                Remove
              </button>
            </div>
            <input
              className={fieldClass}
              placeholder="Skill Group (e.g. Languages, Tools)"
              value={skill.group}
              onChange={(e) => {
                const updated = [...value.skills];
                updated[i].group = e.target.value;
                onChange({ ...value, skills: updated });
              }}
            />
            <textarea
              className={`${fieldClass} min-h-[72px]`}
              placeholder="Items (comma-separated)"
              value={skill.items.join(", ")}
              onChange={(e) => {
                const updated = [...value.skills];
                updated[i].items = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                onChange({ ...value, skills: updated });
              }}
            />
          </div>
        ))}
        <button
          className={pillButton}
          onClick={() => onChange({ ...value, skills: [...value.skills, { group: "", items: [] }] })}
        >
          + Add Skill Group
        </button>
      </Section>

      <Section title="Certifications" helper="Optional credentials, sorted by relevance.">
        {value.certifications.map((cert, i) => (
          <div
            key={i}
            className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-slate-800">
                {cert.name || `Certification ${i + 1}`}
              </p>
              <button
                className={removeButton}
                onClick={() =>
                  onChange({ ...value, certifications: value.certifications.filter((_, idx) => idx !== i) })
                }
              >
                Remove
              </button>
            </div>
            <input
              className={fieldClass}
              placeholder="Certification Name"
              value={cert.name}
              onChange={(e) => {
                const updated = [...value.certifications];
                updated[i].name = e.target.value;
                onChange({ ...value, certifications: updated });
              }}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className={fieldClass}
                placeholder="Issuer (optional)"
                value={cert.issuer ?? ""}
                onChange={(e) => {
                  const updated = [...value.certifications];
                  updated[i].issuer = e.target.value;
                  onChange({ ...value, certifications: updated });
                }}
              />
              <input
                className={fieldClass}
                placeholder="Date (optional)"
                value={cert.date ?? ""}
                onChange={(e) => {
                  const updated = [...value.certifications];
                  updated[i].date = e.target.value;
                  onChange({ ...value, certifications: updated });
                }}
              />
            </div>
          </div>
        ))}
        <button
          className={pillButton}
          onClick={() =>
            onChange({
              ...value,
              certifications: [...value.certifications, { name: "", issuer: "", date: "" }],
            })
          }
        >
          + Add Certification
        </button>
      </Section>

      <Section title="Languages" helper="Optional language proficiency.">
        {value.languages.map((lang, i) => (
          <div
            key={i}
            className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-slate-800">
                {lang.name || `Language ${i + 1}`}
              </p>
              <button
                className={removeButton}
                onClick={() => onChange({ ...value, languages: value.languages.filter((_, idx) => idx !== i) })}
              >
                Remove
              </button>
            </div>
            <input
              className={fieldClass}
              placeholder="Language"
              value={lang.name}
              onChange={(e) => {
                const updated = [...value.languages];
                updated[i].name = e.target.value;
                onChange({ ...value, languages: updated });
              }}
            />
            <input
              className={fieldClass}
              placeholder="Proficiency (e.g. Native, Fluent, Intermediate)"
              value={lang.proficiency ?? ""}
              onChange={(e) => {
                const updated = [...value.languages];
                updated[i].proficiency = e.target.value;
                onChange({ ...value, languages: updated });
              }}
            />
          </div>
        ))}
        <button
          className={pillButton}
          onClick={() => onChange({ ...value, languages: [...value.languages, { name: "", proficiency: "" }] })}
        >
          + Add Language
        </button>
      </Section>
    </div>
  );
}

function Section({ title, helper, children }: { title: string; helper?: string; children: ReactNode }) {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-teal-500 shadow-[0_0_0_4px_rgba(13,148,136,0.15)]" />
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        </div>
        {helper && <p className="text-sm text-slate-600">{helper}</p>}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
