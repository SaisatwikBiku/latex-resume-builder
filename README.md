# LaTeX Resume Builder

A modern, professional resume builder that generates beautifully formatted PDF resumes using LaTeX. Built with Next.js, TypeScript, and Tailwind CSS, this application provides a seamless user experience with real-time preview and instant PDF generation.

## 🌟 Features

- **Real-time Preview**: See your resume as you type with live HTML preview
- **LaTeX PDF Export**: Generate professional, pixel-perfect PDFs using LaTeX typesetting
- **Comprehensive Sections**: Support for all standard resume sections
  - Personal Information (name, email, phone, location, website, summary)
  - Work Experience with bullet points
  - Education history
  - Projects with descriptions and technologies
  - Skills grouped by category
  - Certifications
  - Languages with proficiency levels
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop
- **Modern UI**: Clean, professional interface with step-by-step workflow
- **Type-Safe**: Full TypeScript support with Zod schema validation
- **No Sign-up Required**: Use immediately without creating an account

## 🛠️ Tech Stack

### Frontend
- **Next.js 16**: React framework with App Router
- **React 19**: UI library
- **TypeScript 5**: Type-safe JavaScript
- **Tailwind CSS 4**: Utility-first styling
- **Zod**: Schema validation

### Backend/Compilation
- **LaTeX**: Professional document typesetting
- **Node.js**: Server-side runtime

### Build Tools
- **PostCSS**: CSS processing
- **ESLint**: Code linting
- **React Compiler**: Performance optimization

## 📁 Project Structure

```
latex-resume-builder/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── compile/
│   │   │       └── route.ts          # PDF compilation API endpoint
│   │   ├── globals.css               # Global styles and scrollbar
│   │   ├── layout.tsx                # Root layout with metadata
│   │   └── page.tsx                  # Main page with form & preview
│   ├── components/
│   │   ├── ResumeForm.tsx            # Multi-section form (515 lines)
│   │   └── ResumePreview.tsx         # Real-time HTML preview (171 lines)
│   └── lib/
│       ├── latex.ts                  # LaTeX document generator
│       └── resumeSchema.ts           # Zod schema & TypeScript types
├── public/                           # Static assets
├── eslint.config.mjs                 # ESLint configuration
├── next.config.ts                    # Next.js configuration
├── next-env.d.ts                     # Next.js TypeScript declarations
├── package.json                      # Dependencies and scripts
├── postcss.config.mjs                # PostCSS configuration
├── README.md                         # This file
└── tsconfig.json                     # TypeScript configuration
```

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 20.x or higher
- **LaTeX Distribution**: 
  - macOS: Install [MacTeX](https://www.tug.org/mactex/)
  - Linux: `sudo apt-get install texlive-full`
  - Windows: Install [MiKTeX](https://miktex.org/)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd latex-resume-builder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Verify LaTeX installation**
   ```bash
   pdflatex --version
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 📖 How to Use

### Step 1: Fill Your Information
1. Enter your personal details (name, email, phone, etc.)
2. Add work experience with bullet points
3. Include education history
4. List projects with descriptions
5. Add skills grouped by category
6. Include certifications and languages

### Step 2: Preview Your Resume
- Real-time HTML preview updates as you type
- See exactly how your PDF will look
- Preview maintains LaTeX formatting styles

### Step 3: Download PDF
- Click "Download PDF" button
- LaTeX compiles your resume server-side
- Instant download of professional PDF

## 🏗️ Architecture

### Data Flow

```
User Input → ResumeForm (React State) → ResumePreview (HTML)
                                      ↓
                              API Route (/api/compile)
                                      ↓
                          LaTeX Generator (latex.ts)
                                      ↓
                          PDF Compilation (pdflatex)
                                      ↓
                          Download (resume.pdf)
```

### Key Components

#### 1. **page.tsx** (Main Layout)
- Manages global state with `useState`
- Orchestrates form, preview, and PDF generation
- Responsive 3-step layout (mobile/desktop)
- Mobile: Stacked (Form → Preview → Download)
- Desktop: Two-column (Form left, Preview+Download right)

#### 2. **ResumeForm.tsx** (Form Component)
- Multi-section form with dynamic fields
- Add/remove entries for experience, education, projects
- Real-time state updates via `onChange` callback
- Reusable `Section` wrapper for consistent styling
- Field validation and helper text

#### 3. **ResumePreview.tsx** (Preview Component)
- HTML representation matching PDF output
- Serif typography (Georgia font stack)
- Pixel-perfect spacing (matching LaTeX output)
- Bullet point rendering with `Bullets` component
- Scrollable A4-ratio container

#### 4. **route.ts** (API Endpoint)
- POST endpoint at `/api/compile`
- Receives resume data as JSON
- Generates LaTeX document
- Executes `pdflatex` compilation
- Returns PDF blob or error

#### 5. **latex.ts** (LaTeX Generator)
- Converts resume data to LaTeX markup
- Escapes special characters
- Formats sections with proper spacing
- Generates hyperlinks for URLs
- Professional document class settings

#### 6. **resumeSchema.ts** (Data Schema)
- Zod schema for type-safe validation
- TypeScript type inference
- Default values for arrays
- Optional field handling

## 🎨 Design System

### Colors
- **Primary**: Teal 500-600 (Step 1)
- **Secondary**: Emerald 50-600 (Step 2)
- **Accent**: Sky 50-600 (Step 3)
- **Neutrals**: Slate 50-900

### Typography
- **Headers**: Font sizes 2xl-5xl, extrabold/bold
- **Body**: Font sizes xs-lg
- **Preview**: Serif (Georgia) for professional look

### Spacing
- **Mobile-first**: 4px increments
- **Responsive**: sm, lg, xl, 2xl breakpoints
- **Grid gaps**: 6-8 units

### Layout
- **Max width**: 1920px
- **Padding**: Responsive (4-24 units)
- **Grid**: 1-column mobile, 2-column desktop

## 🔧 Configuration

### Environment Variables
No environment variables required. The application works out of the box.

### LaTeX Customization
Edit `src/lib/latex.ts` to modify:
- Document class and packages
- Page margins and spacing
- Section formatting
- Font styles

### Resume Schema
Modify `src/lib/resumeSchema.ts` to:
- Add new fields
- Change validation rules
- Adjust required/optional fields

## 🐛 Troubleshooting

### LaTeX Not Found
**Error**: `Command failed: pdflatex`
**Solution**: Install LaTeX distribution (see Prerequisites)

### PDF Generation Timeout
**Error**: Compilation takes too long
**Solution**: Check LaTeX installation, simplify resume content

### Preview Doesn't Match PDF
**Issue**: HTML preview differs from PDF output
**Solution**: Preview is approximate. PDF uses LaTeX for exact rendering

### Build Errors
**Error**: TypeScript or ESLint errors
**Solution**: 
```bash
npm run lint
npx tsc --noEmit
```

### Missing Packages (LaTeX)
**Error**: `File not found` in LaTeX compilation
**Solution**: Install additional LaTeX packages:
```bash
# macOS/Linux
sudo tlmgr install <package-name>
```

## 🚀 Development

### Code Style
- TypeScript strict mode enabled
- ESLint with Next.js configuration
- Functional React components
- Tailwind utility classes

### Adding New Resume Sections

1. **Update Schema** (`resumeSchema.ts`)
```typescript
newSection: z.array(z.object({
  field1: z.string(),
  field2: z.string().optional(),
})).default([]),
```

2. **Add Form Fields** (`ResumeForm.tsx`)
```tsx
<Section title="New Section">
  {/* Add input fields */}
</Section>
```

3. **Update Preview** (`ResumePreview.tsx`)
```tsx
{data.newSection.length > 0 && (
  <section>
    {/* Render section */}
  </section>
)}
```

4. **Update LaTeX Generator** (`latex.ts`)
```typescript
if (data.newSection.length > 0) {
  // Generate LaTeX markup
}
```

## 📝 Scripts

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🤝 Contributing

Contributions are welcome! Areas for improvement:
- Additional LaTeX templates
- More customization options
- Export formats (Markdown, HTML, DOCX)
- Resume templates/themes
- Internationalization (i18n)

## 📄 License

Built with Next.js and LaTeX.

## 🙏 Acknowledgments

- **LaTeX**: Donald Knuth's typesetting system
- **Next.js**: Vercel's React framework
- **Tailwind CSS**: Utility-first CSS framework
- **Zod**: TypeScript-first schema validation

---

**Built with ❤️ using Next.js 16, React 19, TypeScript, and LaTeX**
