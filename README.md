# LaTeX Resume Builder

A modern resume builder that generates professional PDF resumes using LaTeX. Fill in your information, preview in real-time, and download a perfectly formatted PDF.

## Quick Start

### Prerequisites
- Node.js 20+
- LaTeX distribution:
  - **macOS**: [MacTeX](https://www.tug.org/mactex/)
  - **Linux**: `sudo apt-get install texlive-full`
  - **Windows**: [MiKTeX](https://miktex.org/)

### Installation & Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

Create `.env.local`:

```env
MONGODB_URI="mongodb+srv://<user>:<password>@<cluster>/<db>?retryWrites=true&w=majority"
MONGODB_DB="latex_resume_builder"
AUTH_SECRET="<long-random-secret>"
AUTH_URL="http://localhost:3000"
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

1. **Register/Login** - Authenticate with email/password
2. **Fill** - Enter your resume information (experience, education, skills, etc.)
3. **Preview** - See real-time HTML preview as you type
4. **Auto-save** - Draft is saved to MongoDB for your account
5. **Download** - Generate and download a professional PDF

## Features

- ✨ Real-time preview
- 📄 Professional LaTeX PDF output
- 📱 Fully responsive (mobile & desktop)
- 🎨 Clean, modern interface
- 🔐 User registration and login
- 💾 Per-user draft persistence (auto-save)
- ✅ Type-safe with TypeScript & Zod validation

## Resume Sections

- Personal Information (name, email, phone, location, website, summary)
- Work Experience with bullet points
- Education
- Projects
- Skills (grouped by category)
- Certifications
- Languages

## Project Structure

```
src/
├── auth.ts                  # Auth.js config
├── app/
│   ├── page.tsx              # Main layout
│   └── api/
│       ├── auth/             # Login/register/auth routes
│       ├── resume/route.ts   # Resume load/save endpoint
│       └── compile/route.ts  # PDF compilation endpoint (authenticated)
├── components/
│   ├── ResumeForm.tsx        # Form for editing resume
│   └── ResumePreview.tsx     # Live preview component
└── lib/
    ├── latex.ts             # LaTeX document generator
    ├── resumeSchema.ts      # Data validation schema
    ├── mongodb.ts           # Mongo client singleton
    └── db.ts                # DB accessor
```

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Validation**: Zod
- **Auth**: Auth.js (credentials), bcryptjs
- **Database**: MongoDB
- **PDF**: LaTeX (pdflatex)
- **Build**: PostCSS, ESLint

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run linting
```

## Troubleshooting

**LaTeX not found?**
- Install LaTeX distribution from prerequisites above

**PDF generation timeout?**
- Ensure LaTeX is installed and works: `pdflatex --version`

## Security Notes

- Auth-protected app routes are enforced through `src/proxy.ts`.
- `POST /api/compile` requires an authenticated session.
- Registration and login attempts are rate limited in-memory.

## License

MIT
