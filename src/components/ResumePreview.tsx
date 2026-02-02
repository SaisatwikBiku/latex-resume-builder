"use client";
import type { ResumeData } from "@/lib/resumeSchema";

export default function ResumePreview({ data }: { data: ResumeData }) {
  const b = data.basics;
  const line = [b.location, b.phone, b.email].filter(Boolean).join(" | ");

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", background: "white", padding: 28, borderRadius: 14 }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>{b.name || "Your Name"}</h1>
        <div style={{ marginTop: 6, color: "#444", fontSize: 13 }}>{line}</div>
      </div>

      <p style={{ marginTop: 18, lineHeight: 1.5, color: b.summary ? "#222" : "#777" }}>
        {b.summary ? b.summary : "Live preview (HTML). Click Generate PDF to compile LaTeX."}
      </p>
    </div>
  );
}
