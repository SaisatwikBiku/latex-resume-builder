"use client";

import { useMemo, useState } from "react";
import type { ResumeData } from "@/lib/resumeSchema";
import ResumeForm from "@/components/ResumeForm";
import ResumePreview from "@/components/ResumePreview";

const defaultData: ResumeData = {
  basics: { name: "Your Name", email: "", phone: "", location: "", summary: "" },
  education: [],
  experience: [],
  skills: [],
};

export default function Page() {
  const [data, setData] = useState<ResumeData>(defaultData);
  const [isGenerating, setIsGenerating] = useState(false);

  const jsonString = useMemo(() => JSON.stringify(data, null, 2), [data]);

  async function generatePdf() {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "PDF generation failed");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "resume.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(e?.message ?? "Unknown error");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", height: "100vh" }}>
      <div style={{ padding: 16, borderRight: "1px solid #eee", overflow: "auto" }}>
        <h2 style={{ margin: 0 }}>LaTeX Resume Builder</h2>
        <p style={{ marginTop: 6, color: "#555" }}>
          Fill the form → preview updates instantly → click Generate PDF.
        </p>

        <button
          onClick={generatePdf}
          disabled={isGenerating}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #ddd",
            cursor: isGenerating ? "not-allowed" : "pointer",
            marginBottom: 12,
          }}
        >
          {isGenerating ? "Generating..." : "Generate PDF"}
        </button>

        <ResumeForm value={data} onChange={setData} />

        <details style={{ marginTop: 16 }}>
          <summary>Debug JSON</summary>
          <pre style={{ fontSize: 12, background: "#fafafa", padding: 12, borderRadius: 8 }}>
            {jsonString}
          </pre>
        </details>
      </div>

      <div style={{ padding: 16, overflow: "auto", background: "#f6f6f6" }}>
        <ResumePreview data={data} />
      </div>
    </div>
  );
}
