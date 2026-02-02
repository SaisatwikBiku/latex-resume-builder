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

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

1. **Fill** - Enter your resume information (experience, education, skills, etc.)
2. **Preview** - See real-time HTML preview as you type
3. **Download** - Generate and download a professional PDF

## Features

- ✨ Real-time preview
- 📄 Professional LaTeX PDF output
- 📱 Fully responsive (mobile & desktop)
- 🎨 Clean, modern interface
- ✅ Type-safe with TypeScript & Zod validation
- 🚀 No sign-up required

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
├── app/
│   ├── page.tsx              # Main layout
│   └── api/compile/route.ts  # PDF compilation endpoint
├── components/
│   ├── ResumeForm.tsx        # Form for editing resume
│   └── ResumePreview.tsx     # Live preview component
└── lib/
    ├── latex.ts             # LaTeX document generator
    └── resumeSchema.ts      # Data validation schema
```

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Validation**: Zod
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

## License

MIT
