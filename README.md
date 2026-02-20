# LaTeX Resume Builder

A full-stack resume platform with a Git-style workflow:
- create multiple resume repositories,
- commit versions over time,
- edit historical commits,
- and export polished LaTeX PDFs.

It combines fast in-app editing (HTML preview) with high-quality final output (LaTeX compilation).

## Live Product Flow

1. **Landing page** (`/`) introduces the workflow.
2. **Auth** (`/login`, `/register`) with credentials.
3. **Repositories** (`/repositories`) shows all resume repos for the user.
4. **Workspace** (`/repositories/[repoId]`) for editing + committing + downloading PDF.
5. **Commits list** (`/repositories/[repoId]/commits`) for version history.
6. **Commit editor** (`/repositories/[repoId]/commits/[commitId]`) to modify/export a specific version.

## Core Features

- Repository-based resume management (role/company specific resumes)
- Commit-style version history
- Rename/delete repositories
- Rename/download commits (no commit delete in UI)
- Structured resume form (experience, education, projects, skills, etc.)
- Live preview while editing
- Authenticated PDF compile API using LaTeX
- User-scoped data in MongoDB

## Tech Stack

- **Frontend/App**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Validation**: Zod
- **Auth**: NextAuth/Auth.js + credentials + Mongo adapter
- **Database**: MongoDB
- **PDF Engine**: LaTeX (`latexmk`/`pdflatex`)
- **Quality**: ESLint

## Prerequisites

- Node.js 20+
- MongoDB database
- LaTeX toolchain
  - macOS: [MacTeX](https://www.tug.org/mactex/)
  - Debian/Ubuntu: `sudo apt-get install texlive-latex-recommended texlive-latex-extra texlive-fonts-recommended texlive-fonts-extra texlive-pictures latexmk`
  - Windows: [MiKTeX](https://miktex.org/) (ensure `latexmk`/`pdflatex` in PATH)

## Local Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create `.env.local`:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<db>?retryWrites=true&w=majority
MONGODB_DB=latex_resume_builder
AUTH_SECRET=<long-random-secret>
AUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true
```

## Scripts

```bash
npm run dev      # Development
npm run build    # Production build
npm run start    # Production server
npm run lint     # Lint
```

## Docker / Deployment Notes

- The app includes a `Dockerfile` with TeX dependencies preinstalled.
- `npm start` binds to `0.0.0.0` and uses `PORT` (fallback `3000`).
- Required runtime env vars: `MONGODB_URI`, `MONGODB_DB`, `AUTH_SECRET`, `AUTH_URL`, `AUTH_TRUST_HOST`.
- If compile fails in cloud:
  - verify `latexmk -v` inside container,
  - ensure enough memory,
  - inspect `POST /api/compile` error body.

## API Surface (High-Level)

- `POST /api/auth/register` - create user
- `GET/POST /api/repositories` - list/create repositories
- `GET/PUT/DELETE /api/repositories/[repoId]` - repo operations
- `GET/POST /api/repositories/[repoId]/versions` - list/create commits
- `GET/PUT /api/repositories/[repoId]/versions/[versionId]` - commit fetch/update
- `POST /api/compile` - compile LaTeX PDF (authenticated)

## Security

- Protected routes enforced by `src/proxy.ts`
- Auth required for app pages and compile endpoint
- Input validation with Zod
- Rate limiting for registration/login

## Project Structure

```text
src/
  app/
    page.tsx                                    # Landing page
    login/page.tsx                              # Login
    register/page.tsx                           # Register
    repositories/page.tsx                       # Repositories list
    repositories/[repoId]/page.tsx              # Workspace
    repositories/[repoId]/commits/page.tsx      # Commit history
    repositories/[repoId]/commits/[commitId]/page.tsx  # Commit editor
    api/
      auth/[...nextauth]/route.ts
      auth/register/route.ts
      repositories/...                          # Repo + version APIs
      compile/route.ts                          # LaTeX compile API
  components/
    ResumeForm.tsx
    ResumePreview.tsx
    AuthSessionProvider.tsx
  lib/
    db.ts
    mongodb.ts
    resumeSchema.ts
    latex.ts
```

## Current Status

- End-to-end repository + commit workflow is implemented.
- UI is responsive and aligned with the landing visual style.
- Production-hardening still recommended: monitoring, automated tests, and queued PDF compilation for scale.

## License

MIT
