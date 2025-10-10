# Boilerplate Generator - Complete Guide

## 🚀 Overview
The Boilerplate Generator is a powerful feature that allows users to create fully configured project boilerplates with a single click.

## 📍 Route
`/generator`

## ✨ Features

### 1. AI-Powered Project Description Parser
- Users can describe their project in natural language
- AI automatically selects the best framework, language, and features
- Example: "I want a Next.js app with Tailwind, Auth, and a simple product page"

### 2. Manual Configuration
Users can manually select:

**Frameworks:**
- Next.js (React with SSR)
- React (Vite-based)
- Vue.js
- Express (Node.js backend)
- FastAPI (Python backend)

**Languages:**
- TypeScript (default)
- JavaScript
- Python

**Features:**
- Tailwind CSS
- API Routes
- Authentication (JWT-based)
- Database (MongoDB)
- Testing (Jest/Pytest)
- Docker
- ESLint
- Prettier

### 3. Real-time Progress Updates
Shows step-by-step progress:
- 🧱 Setting up base structure...
- 🧩 Adding features...
- 🧰 Installing dependencies...
- 📦 Packaging project...

### 4. Automatic ZIP Download
- Generates complete project structure
- Downloads as ZIP file
- Ready to unzip and run

## 🔧 Technical Implementation

### Frontend (`pages/generator.tsx`)
- Form with framework/language/feature selection
- AI description parser integration
- Progress UI with loading states
- Automatic file download

### Backend APIs

#### `/api/parse-project-description`
- Accepts natural language description
- Uses Gemini AI to extract configuration
- Returns structured JSON with framework, language, and features

#### `/api/generate-boilerplate`
- Accepts configuration object
- Dynamically generates project files
- Creates ZIP archive
- Streams ZIP to client

### File Generation
The generator creates complete, working projects with:

**Common Files:**
- `package.json` with correct dependencies
- `README.md` with setup instructions
- `.gitignore`
- `.env.example`
- `tsconfig.json` (for TypeScript)

**Framework-Specific Files:**

**Next.js:**
- `next.config.js`
- `pages/index.tsx`
- `pages/_app.tsx`
- `pages/api/hello.ts` (if API feature selected)

**React:**
- `vite.config.ts`
- `src/App.tsx`
- `src/main.tsx`
- `index.html`

**Express:**
- `src/index.ts`
- `src/middleware/auth.ts` (if auth selected)

**FastAPI:**
- `main.py`
- `requirements.txt`
- `auth.py` (if auth selected)

**Feature-Specific Files:**

**Tailwind:**
- `tailwind.config.js`
- `postcss.config.js`
- `styles/globals.css` or `src/index.css`

**Docker:**
- `Dockerfile`
- `docker-compose.yml`

**ESLint:**
- `.eslintrc.json`

**Prettier:**
- `.prettierrc`

**Testing:**
- `jest.config.js` or `pytest` files
- Sample test files

## 📦 Dependencies Added
- `archiver` - For creating ZIP files
- `@types/archiver` - TypeScript types

## 🎯 User Flow

1. User visits `/generator`
2. Either:
   - Describes project in AI input → AI parses and selects options
   - Manually selects framework, language, and features
3. Clicks "Generate Project"
4. Progress updates show in real-time
5. ZIP file automatically downloads
6. User unzips and runs:
   ```bash
   npm install
   npm run dev
   ```

## 🔗 Integration

Added button on home page:
- "Generate Custom Boilerplate" button
- Links to `/generator` page
- Prominent placement below main heading

## 🎨 UI/UX Features
- Clean, organized form layout
- Visual feedback for selected options
- Loading states with spinner
- Success confirmation
- Configuration summary display
- Responsive design

## 🧠 AI Integration
Uses Gemini AI to:
- Parse natural language descriptions
- Extract framework requirements
- Identify needed features
- Suggest appropriate language

## 📝 Example Generated Projects

### Next.js + TypeScript + Tailwind + Auth
```
my-project/
├── pages/
│   ├── index.tsx
│   ├── _app.tsx
│   └── api/
│       └── hello.ts
├── styles/
│   └── globals.css
├── tailwind.config.js
├── postcss.config.js
├── next.config.js
├── tsconfig.json
├── package.json
├── .gitignore
├── .env.example
└── README.md
```

### React + Vite + Tailwind
```
my-project/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── package.json
└── README.md
```

## 🚀 Future Enhancements
- More frameworks (Svelte, Angular, Django)
- More features (GraphQL, Redis, WebSockets)
- Custom templates
- GitHub repo creation integration
- Live preview before download
- Project customization wizard
