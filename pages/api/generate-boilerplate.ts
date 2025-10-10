import type { NextApiRequest, NextApiResponse } from 'next';
import archiver from 'archiver';
import { Readable } from 'stream';

interface Config {
  framework: string;
  language: string;
  features: string[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const config: Config = req.body;

  if (!config.framework || !config.language) {
    return res.status(400).json({ error: 'Framework and language are required' });
  }

  try {
    // Create archive
    const archive = archiver('zip', { zlib: { level: 9 } });

    // Set response headers
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=repoza-${config.framework}-${config.language}.zip`);

    // Pipe archive to response
    archive.pipe(res);

    // Generate files based on configuration
    const files = generateProjectFiles(config);

    // Add files to archive
    for (const [path, content] of Object.entries(files)) {
      archive.append(content, { name: path });
    }

    // Finalize archive
    await archive.finalize();
  } catch (error: any) {
    console.error('Generation error:', error);
    return res.status(500).json({
      error: 'Failed to generate boilerplate',
      details: error.message,
    });
  }
}

function generateProjectFiles(config: Config): Record<string, string> {
  const files: Record<string, string> = {};
  const { framework, language, features } = config;

  // Generate package.json
  files['package.json'] = generatePackageJson(config);

  // Generate README
  files['README.md'] = generateReadme(config);

  // Generate .gitignore
  files['.gitignore'] = generateGitignore();

  // Generate .env.example
  files['.env.example'] = generateEnvExample(config);

  // Framework-specific files
  if (framework === 'nextjs') {
    files['next.config.js'] = generateNextConfig(config);
    files['tsconfig.json'] = language === 'typescript' ? generateTsConfig() : '';
    files['pages/index.tsx'] = generateNextIndexPage(config);
    files['pages/_app.tsx'] = generateNextAppPage(config);
    
    if (features.includes('api')) {
      files['pages/api/hello.ts'] = generateNextApiRoute();
    }
    
    if (features.includes('tailwind')) {
      files['tailwind.config.js'] = generateTailwindConfig();
      files['postcss.config.js'] = generatePostcssConfig();
      files['styles/globals.css'] = generateGlobalCss();
    }
  } else if (framework === 'react') {
    files['tsconfig.json'] = language === 'typescript' ? generateTsConfig() : '';
    files['src/App.tsx'] = generateReactApp(config);
    files['src/main.tsx'] = generateReactMain(config);
    files['index.html'] = generateReactIndexHtml();
    files['vite.config.ts'] = generateViteConfig();
    
    if (features.includes('tailwind')) {
      files['tailwind.config.js'] = generateTailwindConfig();
      files['postcss.config.js'] = generatePostcssConfig();
      files['src/index.css'] = generateGlobalCss();
    }
  } else if (framework === 'express') {
    files['tsconfig.json'] = language === 'typescript' ? generateTsConfig() : '';
    files['src/index.ts'] = generateExpressServer(config);
    
    if (features.includes('auth')) {
      files['src/middleware/auth.ts'] = generateAuthMiddleware();
    }
  } else if (framework === 'fastapi') {
    files['main.py'] = generateFastAPIMain(config);
    files['requirements.txt'] = generateRequirements(config);
    
    if (features.includes('auth')) {
      files['auth.py'] = generateFastAPIAuth();
    }
  }

  // Common features
  if (features.includes('docker')) {
    files['Dockerfile'] = generateDockerfile(config);
    files['docker-compose.yml'] = generateDockerCompose(config);
  }

  if (features.includes('eslint') && language !== 'python') {
    files['.eslintrc.json'] = generateEslintConfig();
  }

  if (features.includes('prettier') && language !== 'python') {
    files['.prettierrc'] = generatePrettierConfig();
  }

  if (features.includes('testing')) {
    if (language === 'python') {
      files['test_main.py'] = generatePytestFile();
    } else {
      files['jest.config.js'] = generateJestConfig();
      files['tests/example.test.ts'] = generateJestTest();
    }
  }

  // Remove empty files
  Object.keys(files).forEach(key => {
    if (!files[key]) delete files[key];
  });

  return files;
}

// Package.json generator
function generatePackageJson(config: Config): string {
  const { framework, language, features } = config;
  
  const deps: Record<string, string> = {};
  const devDeps: Record<string, string> = {};
  const scripts: Record<string, string> = {};

  if (framework === 'nextjs') {
    deps['next'] = '^14.0.0';
    deps['react'] = '^18.2.0';
    deps['react-dom'] = '^18.2.0';
    scripts['dev'] = 'next dev';
    scripts['build'] = 'next build';
    scripts['start'] = 'next start';
  } else if (framework === 'react') {
    deps['react'] = '^18.2.0';
    deps['react-dom'] = '^18.2.0';
    devDeps['vite'] = '^5.0.0';
    devDeps['@vitejs/plugin-react'] = '^4.2.0';
    scripts['dev'] = 'vite';
    scripts['build'] = 'vite build';
    scripts['preview'] = 'vite preview';
  } else if (framework === 'express') {
    deps['express'] = '^4.18.0';
    scripts['dev'] = 'nodemon src/index.ts';
    scripts['start'] = 'node dist/index.js';
    scripts['build'] = 'tsc';
  }

  if (language === 'typescript' && framework !== 'fastapi') {
    devDeps['typescript'] = '^5.0.0';
    devDeps['@types/node'] = '^20.0.0';
    if (framework === 'react') {
      devDeps['@types/react'] = '^18.0.0';
      devDeps['@types/react-dom'] = '^18.0.0';
    }
  }

  if (features.includes('tailwind')) {
    devDeps['tailwindcss'] = '^3.4.0';
    devDeps['postcss'] = '^8.4.0';
    devDeps['autoprefixer'] = '^10.4.0';
  }

  if (features.includes('database')) {
    deps['mongodb'] = '^6.0.0';
  }

  if (features.includes('auth')) {
    deps['jsonwebtoken'] = '^9.0.0';
    deps['bcryptjs'] = '^2.4.0';
  }

  if (features.includes('testing')) {
    devDeps['jest'] = '^29.0.0';
    devDeps['@types/jest'] = '^29.0.0';
    scripts['test'] = 'jest';
  }

  if (features.includes('eslint')) {
    devDeps['eslint'] = '^8.0.0';
    scripts['lint'] = 'eslint .';
  }

  if (features.includes('prettier')) {
    devDeps['prettier'] = '^3.0.0';
    scripts['format'] = 'prettier --write .';
  }

  return JSON.stringify({
    name: `repoza-${framework}-project`,
    version: '1.0.0',
    private: true,
    scripts,
    dependencies: deps,
    devDependencies: devDeps,
  }, null, 2);
}

// README generator
function generateReadme(config: Config): string {
  const { framework, language, features } = config;
  
  return `# Project Generated with Repoza 🚀

## Configuration
- **Framework:** ${framework}
- **Language:** ${language}
- **Features:** ${features.join(', ') || 'None'}

## Getting Started

### Install Dependencies
\`\`\`bash
npm install
\`\`\`

### Run Development Server
\`\`\`bash
npm run dev
\`\`\`

### Build for Production
\`\`\`bash
npm run build
\`\`\`

## Project Structure
\`\`\`
${framework === 'nextjs' ? `
├── pages/          # Next.js pages
├── public/         # Static assets
├── styles/         # CSS files
` : framework === 'react' ? `
├── src/            # Source files
│   ├── App.tsx     # Main component
│   └── main.tsx    # Entry point
├── public/         # Static assets
` : framework === 'express' ? `
├── src/            # Source files
│   └── index.ts    # Server entry
` : `
├── main.py         # FastAPI application
`}
├── package.json    # Dependencies
└── README.md       # This file
\`\`\`

## Features

${features.includes('tailwind') ? '✅ **Tailwind CSS** - Utility-first CSS framework\n' : ''}
${features.includes('api') ? '✅ **API Routes** - Backend API endpoints\n' : ''}
${features.includes('auth') ? '✅ **Authentication** - JWT-based auth system\n' : ''}
${features.includes('database') ? '✅ **Database** - MongoDB integration\n' : ''}
${features.includes('testing') ? '✅ **Testing** - Jest/Pytest setup\n' : ''}
${features.includes('docker') ? '✅ **Docker** - Containerization ready\n' : ''}
${features.includes('eslint') ? '✅ **ESLint** - Code linting\n' : ''}
${features.includes('prettier') ? '✅ **Prettier** - Code formatting\n' : ''}

## Learn More

- [Repoza](https://repoza.vercel.app) - AI Codebase Recommender
- [${framework}](https://github.com/${framework}) - Official documentation

Happy coding! 🎉
`;
}

// .gitignore generator
function generateGitignore(): string {
  return `# Dependencies
node_modules/
__pycache__/
*.pyc

# Build
.next/
dist/
build/
out/

# Environment
.env
.env.local
.env*.local

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
`;
}

// .env.example generator
function generateEnvExample(config: Config): string {
  let env = '# Environment Variables\n\n';
  
  if (config.features.includes('database')) {
    env += 'MONGODB_URI=mongodb://localhost:27017/myapp\n';
  }
  
  if (config.features.includes('auth')) {
    env += 'JWT_SECRET=your_jwt_secret_here\n';
  }
  
  env += 'PORT=3000\n';
  
  return env;
}

// Next.js specific generators
function generateNextConfig(config: Config): string {
  return `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;
`;
}

function generateNextIndexPage(config: Config): string {
  const useTailwind = config.features.includes('tailwind');
  
  return `${config.language === 'typescript' ? "import type { NextPage } from 'next';\n" : ''}
export default function Home${config.language === 'typescript' ? ': NextPage' : ''}() {
  return (
    <div${useTailwind ? ' className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600"' : ''}>
      <div${useTailwind ? ' className="text-center text-white"' : ''}>
        <h1${useTailwind ? ' className="text-6xl font-bold mb-4"' : ''}>
          Welcome to Your Project 🚀
        </h1>
        <p${useTailwind ? ' className="text-xl mb-8"' : ''}>
          Generated with Repoza
        </p>
        <a
          href="https://repoza.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          ${useTailwind ? 'className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"' : ''}
        >
          Visit Repoza
        </a>
      </div>
    </div>
  );
}
`;
}

function generateNextAppPage(config: Config): string {
  const useTailwind = config.features.includes('tailwind');
  
  return `${config.language === 'typescript' ? "import type { AppProps } from 'next/app';\n" : ''}${useTailwind ? "import '../styles/globals.css';\n" : ''}
export default function App({ Component, pageProps }${config.language === 'typescript' ? ': AppProps' : ''}) {
  return <Component {...pageProps} />;
}
`;
}

function generateNextApiRoute(): string {
  return `import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ message: 'Hello from API!' });
}
`;
}

// React specific generators
function generateReactApp(config: Config): string {
  const useTailwind = config.features.includes('tailwind');
  
  return `${config.language === 'typescript' ? '' : ''}function App() {
  return (
    <div${useTailwind ? ' className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600"' : ''}>
      <div${useTailwind ? ' className="text-center text-white"' : ''}>
        <h1${useTailwind ? ' className="text-6xl font-bold mb-4"' : ''}>
          Welcome to Your Project 🚀
        </h1>
        <p${useTailwind ? ' className="text-xl mb-8"' : ''}>
          Generated with Repoza
        </p>
        <a
          href="https://repoza.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          ${useTailwind ? 'className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"' : ''}
        >
          Visit Repoza
        </a>
      </div>
    </div>
  );
}

export default App;
`;
}

function generateReactMain(config: Config): string {
  const useTailwind = config.features.includes('tailwind');
  
  return `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
${useTailwind ? "import './index.css';" : ''}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;
}

function generateReactIndexHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Repoza Project</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
}

function generateViteConfig(): string {
  return `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
`;
}

// Express specific generators
function generateExpressServer(config: Config): string {
  const hasAuth = config.features.includes('auth');
  
  return `import express${config.language === 'typescript' ? ', { Request, Response }' : ''} from 'express';
${hasAuth ? "import authMiddleware from './middleware/auth';" : ''}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req${config.language === 'typescript' ? ': Request' : ''}, res${config.language === 'typescript' ? ': Response' : ''}) => {
  res.json({ message: 'Welcome to your Express API!' });
});

${hasAuth ? `
app.get('/protected', authMiddleware, (req, res) => {
  res.json({ message: 'This is a protected route!' });
});
` : ''}

app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
});
`;
}

function generateAuthMiddleware(): string {
  return `import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export default function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
`;
}

// FastAPI specific generators
function generateFastAPIMain(config: Config): string {
  const hasAuth = config.features.includes('auth');
  
  return `from fastapi import FastAPI${hasAuth ? ', Depends, HTTPException' : ''}
${hasAuth ? 'from auth import get_current_user' : ''}

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Welcome to your FastAPI application!"}

${hasAuth ? `
@app.get("/protected")
def protected_route(current_user: dict = Depends(get_current_user)):
    return {"message": f"Hello {current_user['username']}!"}
` : ''}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
`;
}

function generateFastAPIAuth(): string {
  return `from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, "secret", algorithms=["HS256"])
        return payload
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
`;
}

function generateRequirements(config: Config): string {
  let reqs = 'fastapi==0.104.1\nuvicorn==0.24.0\n';
  
  if (config.features.includes('auth')) {
    reqs += 'pyjwt==2.8.0\n';
  }
  
  if (config.features.includes('database')) {
    reqs += 'pymongo==4.6.0\n';
  }
  
  if (config.features.includes('testing')) {
    reqs += 'pytest==7.4.3\n';
  }
  
  return reqs;
}

// Common generators
function generateTsConfig(): string {
  return `{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src", "pages"],
  "exclude": ["node_modules"]
}
`;
}

function generateTailwindConfig(): string {
  return `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
`;
}

function generatePostcssConfig(): string {
  return `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`;
}

function generateGlobalCss(): string {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;
`;
}

function generateDockerfile(config: Config): string {
  if (config.framework === 'fastapi') {
    return `FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
`;
  }
  
  return `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

${config.framework === 'nextjs' ? 'RUN npm run build\n\nCMD ["npm", "start"]' : 'CMD ["npm", "run", "dev"]'}
`;
}

function generateDockerCompose(config: Config): string {
  return `version: '3.8'

services:
  app:
    build: .
    ports:
      - "${config.framework === 'fastapi' ? '8000:8000' : '3000:3000'}"
    environment:
      - NODE_ENV=development
    volumes:
      - .:/app
      - /app/node_modules
`;
}

function generateEslintConfig(): string {
  return `{
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "root": true
}
`;
}

function generatePrettierConfig(): string {
  return `{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
`;
}

function generateJestConfig(): string {
  return `module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
};
`;
}

function generateJestTest(): string {
  return `describe('Example Test', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });
});
`;
}

function generatePytestFile(): string {
  return `def test_example():
    assert True
`;
}
