import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { resumeSchema } from "@/lib/resumeSchema";
import { renderLatex } from "@/lib/latex";
import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import os from "os";

function run(cmd: string, args: string[], cwd: string, timeoutMs: number) {
  return new Promise<void>((resolve, reject) => {
    const p = spawn(cmd, args, { cwd });

    let stdout = "";
    let stderr = "";

    p.stdout.on("data", (d) => (stdout += d.toString()));
    p.stderr.on("data", (d) => (stderr += d.toString()));

    const t = setTimeout(() => {
      p.kill("SIGKILL");
      reject(new Error(`LaTeX compile timeout after ${timeoutMs}ms`));
    }, timeoutMs);

    p.on("error", (e) => {
      clearTimeout(t);
      reject(new Error(`Failed to start '${cmd}': ${e.message}`));
    });

    p.on("close", (code) => {
      clearTimeout(t);
      if (code === 0) return resolve();
      reject(new Error(`LaTeX failed (code ${code}).\n${stderr}\n${stdout}`));
    });
  });
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const data = resumeSchema.parse(json);

    // renderLatex is now synchronous (no Handlebars)
    const tex = renderLatex(data);

    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "resume-"));
    await fs.writeFile(path.join(tmpDir, "resume.tex"), tex, "utf8");

    // If macOS PATH causes trouble, replace "latexmk" with "/Library/TeX/texbin/latexmk"
    await run(
      "latexmk",
      ["-pdf", "-interaction=nonstopmode", "-halt-on-error", "-no-shell-escape", "resume.tex"],
      tmpDir,
      60000
    );

    const pdf = await fs.readFile(path.join(tmpDir, "resume.pdf"));
    fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="resume.pdf"`,
      },
    });
  } catch (err: unknown) {
    // Helpful server logs
    console.error("Compile error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
