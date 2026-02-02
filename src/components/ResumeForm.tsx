"use client";
import type { ResumeData } from "@/lib/resumeSchema";

export default function ResumeForm({
  value,
  onChange,
}: {
  value: ResumeData;
  onChange: (v: ResumeData) => void;
}) {
  const b = value.basics;

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: 10,
    borderRadius: 10,
    border: "1px solid #ddd",
  };

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <label>
        Name
        <input
          style={inputStyle}
          value={b.name}
          onChange={(e) => onChange({ ...value, basics: { ...b, name: e.target.value } })}
        />
      </label>

      <label>
        Email
        <input
          style={inputStyle}
          value={b.email ?? ""}
          onChange={(e) => onChange({ ...value, basics: { ...b, email: e.target.value } })}
        />
      </label>

      <label>
        Phone
        <input
          style={inputStyle}
          value={b.phone ?? ""}
          onChange={(e) => onChange({ ...value, basics: { ...b, phone: e.target.value } })}
        />
      </label>

      <label>
        Location
        <input
          style={inputStyle}
          value={b.location ?? ""}
          onChange={(e) => onChange({ ...value, basics: { ...b, location: e.target.value } })}
        />
      </label>

      <label>
        Summary
        <textarea
          style={inputStyle}
          rows={4}
          value={b.summary ?? ""}
          onChange={(e) => onChange({ ...value, basics: { ...b, summary: e.target.value } })}
        />
      </label>
    </div>
  );
}
