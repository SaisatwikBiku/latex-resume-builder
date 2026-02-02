import { NextResponse } from "next/server";
import { resumeSchema } from "@/lib/resumeSchema";
import { renderLatex } from "@/lib/latex";
import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import os from "os";

function run(cmd: string, args: string[], cwd: string, timeoutMs: number) {
  return new Promise<void>((resolve, reject) => {
    const p = spawn(cmd, args, { cwd });
    let stderr = "";

    p.stderr.on("data", (d) => (stderr += d.toString()));

    const t = setTimeout(() => {
      p.kill("SIGKILL");
      reject(new Error(`LaTeX compile timeout after ${timeoutMs}ms`));
    }, timeoutMs);

    p.on("close", (code) => {
      clearTimeout(t);
      if (code === 0) return resolve();
      reject(new Error(`LaTeX failed (code ${code}).\n${stderr}`));
    });
  });
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const data = resumeSchema.parse(json);

    const tex = await renderLatex(data);

    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "resume-"));
    await fs.writeFile(path.join(tmpDir, "resume.tex"), tex, "utf8");

    await run(
      "latexmk",
      ["-pdf", "-interaction=nonstopmode", "-halt-on-error", "-no-shell-escape", "resume.tex"],
      tmpDir,
      15000
    );

    const pdf = await fs.readFile(path.join(tmpDir, "resume.pdf"));
    fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="resume.pdf"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 400 });
  }
}
